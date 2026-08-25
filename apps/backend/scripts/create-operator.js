/**
 * Bootstrap CLI: create an operator account for the platform admin console.
 * Operators live in tblOperators — fully separate from Firebase end users.
 *
 * Usage:
 *   node scripts/create-operator.js <email> <password> [title]
 *   node scripts/create-operator.js --reset <email> <password>
 *
 * --reset rotates the password and revokes all existing sessions instead of
 * failing when the operator already exists.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { prisma } = require("../config/prisma.config");
const { operatorAuthService } = require("../modules/operatorAuth/operatorAuth.service");

async function main() {
  const args = process.argv.slice(2);
  const isReset = args[0] === "--reset";
  const positional = isReset ? args.slice(1) : args;

  const [email, password, title] = positional;
  if (!email || !password) {
    console.error(
      "Usage: node scripts/create-operator.js [--reset] <email> <password> [title]"
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  if (isReset) {
    await operatorAuthService.resetPassword({ email, password });
    console.log(`Password rotated and sessions revoked for ${email.trim().toLowerCase()}`);
    return;
  }

  try {
    const operator = await operatorAuthService.createOperator({
      email,
      password,
      operatorTitle: title,
    });
    console.log(`Operator created: ${operator.email} (${operator.operatorID})`);
  } catch (error) {
    // Idempotent convenience: if the account exists, rotate instead of fail.
    if (
      await prisma.tblOperators.findUnique({
        where: { email: email.trim().toLowerCase() },
      })
    ) {
      console.error(`Operator already exists. Re-run with --reset to rotate the password.`);
      process.exit(1);
    }
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
