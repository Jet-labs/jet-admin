/**
 * OperatorAuth Service
 *
 * The platform admin console has its own identity store (tblOperators) that
 * is completely separate from end-user Firebase auth. Operators authenticate
 * with email + password (PBKDF2-SHA512, 600k iterations) and receive opaque
 * bearer session tokens; only a SHA-256 hash of each token is persisted.
 */
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  generateSaltAndPasswordHash,
  comparePasswordWithHash,
  generateAPIKey,
  hashAPIKey,
} = require("../../utils/crypto.util");

/** Operator sessions live for 12 hours. */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const operatorAuthService = {};

/**
 * Creates an operator account. Used by scripts/create-operator.js only —
 * there is intentionally no self-service registration.
 *
 * @param {object} param0
 * @param {string} param0.email
 * @param {string} param0.password
 * @param {string} [param0.operatorTitle]
 * @returns {Promise<import("@prisma/client").tblOperators>}
 */
operatorAuthService.createOperator = async ({ email, password, operatorTitle }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.tblOperators.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new Error("An operator with this email already exists.");
  }

  const { salt, passwordHash } = generateSaltAndPasswordHash({ password });
  const operator = await prisma.tblOperators.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      passwordSalt: salt,
      operatorTitle: operatorTitle || null,
    },
  });
  Logger.log("success", {
    message: "operatorAuthService:createOperator:success",
    params: { operatorID: operator.operatorID, email: normalizedEmail },
  });
  return operator;
};

/**
 * Verifies credentials and issues a new session token.
 *
 * @param {object} param0
 * @param {string} param0.email
 * @param {string} param0.password
 * @param {string} [param0.userAgent]
 * @param {string} [param0.ipAddress]
 * @returns {Promise<{operator: object, token: string, expiresAt: Date}>}
 */
operatorAuthService.login = async ({ email, password, userAgent, ipAddress }) => {
  const normalizedEmail = String(email).trim().toLowerCase();

  const operator = await prisma.tblOperators.findUnique({
    where: { email: normalizedEmail },
  });

  // Same generic error for unknown email and wrong password.
  if (!operator || operator.isDisabled) {
    throw constants.ERROR_CODES.INVALID_OPERATOR_CREDENTIALS;
  }

  const passwordOK = comparePasswordWithHash({
    password,
    salt: operator.passwordSalt,
    passwordHash: operator.passwordHash,
  });
  if (!passwordOK) {
    Logger.log("warning", {
      message: "operatorAuthService:login:badPassword",
      params: { operatorID: operator.operatorID },
    });
    throw constants.ERROR_CODES.INVALID_OPERATOR_CREDENTIALS;
  }

  const token = generateAPIKey();
  const { hash: tokenHash } = hashAPIKey(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.tblOperatorSessions.create({
    data: {
      tokenHash,
      operatorID: operator.operatorID,
      userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
      ipAddress: ipAddress ? String(ipAddress).slice(0, 64) : null,
      expiresAt,
    },
  });

  // Opportunistic cleanup of dead sessions so the table stays small.
  prisma.tblOperatorSessions
    .deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    })
    .catch((cleanupError) => {
      Logger.log("warning", {
        message: "operatorAuthService:login:cleanupFailed",
        params: { error: cleanupError.message },
      });
    });

  Logger.log("success", {
    message: "operatorAuthService:login:success",
    params: { operatorID: operator.operatorID },
  });

  return {
    operator: {
      operatorID: operator.operatorID,
      email: operator.email,
      operatorTitle: operator.operatorTitle,
    },
    token,
    expiresAt,
  };
};

/**
 * Resolves an operator from a raw bearer token. Throws
 * OPERATOR_SESSION_INVALID for unknown/expired/revoked tokens and disabled
 * operators.
 *
 * @param {object} param0
 * @param {string} param0.token
 * @returns {Promise<object>} Safe operator fields only.
 */
operatorAuthService.getOperatorFromToken = async ({ token }) => {
  const { hash: tokenHash } = hashAPIKey(token);
  const session = await prisma.tblOperatorSessions.findUnique({
    where: { tokenHash },
    include: { tblOperators: true },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt.getTime() < Date.now() ||
    !session.tblOperators ||
    session.tblOperators.isDisabled
  ) {
    throw constants.ERROR_CODES.OPERATOR_SESSION_INVALID;
  }

  return {
    operatorID: session.tblOperators.operatorID,
    email: session.tblOperators.email,
    operatorTitle: session.tblOperators.operatorTitle,
    sessionID: session.sessionID,
  };
};

/**
 * Revokes a session (sign-out). Unknown tokens are ignored so logout stays
 * idempotent.
 *
 * @param {object} param0
 * @param {string} param0.token
 * @returns {Promise<void>}
 */
operatorAuthService.logout = async ({ token }) => {
  const { hash: tokenHash } = hashAPIKey(token);
  await prisma.tblOperatorSessions.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

/**
 * Rotates an operator's password and revokes all their active sessions.
 *
 * @param {object} param0
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {Promise<void>}
 */
operatorAuthService.resetPassword = async ({ email, password }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const operator = await prisma.tblOperators.findUnique({
    where: { email: normalizedEmail },
  });
  if (!operator) {
    throw constants.ERROR_CODES.INVALID_USER;
  }
  const { salt, passwordHash } = generateSaltAndPasswordHash({ password });
  await prisma.$transaction([
    prisma.tblOperators.update({
      where: { operatorID: operator.operatorID },
      data: { passwordHash, passwordSalt: salt, updatedAt: new Date() },
    }),
    prisma.tblOperatorSessions.updateMany({
      where: { operatorID: operator.operatorID, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  Logger.log("success", {
    message: "operatorAuthService:resetPassword:success",
    params: { operatorID: operator.operatorID },
  });
};

module.exports = { operatorAuthService, SESSION_TTL_MS };
