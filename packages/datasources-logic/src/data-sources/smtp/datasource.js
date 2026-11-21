import nodemailer from "nodemailer";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

function buildTransport(options) {
  const auth = {};
  if (options.username) auth.user = options.username;
  if (options.password) auth.pass = options.password;

  return nodemailer.createTransport({
    host: options.host,
    port: options.port || 587,
    secure: Boolean(options.secure),
    requireTLS: options.requireTLS !== false,
    auth: Object.keys(auth).length > 0 ? auth : undefined,
    // Never let nodemailer resolve body content objects to files/URLs.
    disableFileAccess: true,
    disableUrlAccess: true,
    connectionTimeout: Math.max(1, Number(options.timeout) || 15) * 1000,
    greetingTimeout: Math.max(1, Number(options.timeout) || 15) * 1000,
  });
}

function requireString(value, field) {
  if (value === undefined || value === null || value === "") return value;
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string (objects are not accepted).`);
  }
  if (/[\r\n]/.test(value)) {
    throw new Error(`${field} must not contain line breaks.`);
  }
  return value;
}

export default class SMTPDataSource extends DataSource {
  async execute(dataQueryOptions) {
    const options = this.config.datasourceOptions || {};
    const operation = String(dataQueryOptions?.operation || "send");

    Logger.log("info", {
      message: "smtp:SMTPDataSource:execute:params",
      params: {
        operation,
        to: dataQueryOptions?.to,
        subject: dataQueryOptions?.subject,
        host: options.host,
      },
    });

    if (!options.host || !options.port) {
      throw new Error("SMTP host and port are required.");
    }

    const transporter = buildTransport(options);

    try {
      if (operation === "verify") {
        await transporter.verify();
        return { success: true, verified: true };
      }

      if (operation === "send") {
        const to = requireString(dataQueryOptions.to, "to");
        const subject = requireString(dataQueryOptions.subject, "subject");
        const from = requireString(dataQueryOptions.from || options.from, "from");
        const cc = requireString(dataQueryOptions.cc, "cc");
        const bcc = requireString(dataQueryOptions.bcc, "bcc");
        const text = requireString(dataQueryOptions.text, "text");
        const html = requireString(dataQueryOptions.html, "html");

        if (!to) throw new Error("to is required for an SMTP send.");
        if (!subject) throw new Error("subject is required for an SMTP send.");
        if (!text && !html) {
          throw new Error("text or html is required for an SMTP send.");
        }

        const info = await transporter.sendMail({
          from: from || undefined,
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          text: text || undefined,
          html: html || undefined,
        });

        return {
          success: true,
          messageId: info.messageId,
          accepted: info.accepted || [],
          rejected: info.rejected || [],
          response: info.response,
        };
      }

      throw new Error(`Unsupported SMTP operation: ${operation}`);
    } catch (error) {
      Logger.log("error", {
        message: "smtp:SMTPDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`SMTP query failed: ${error.message || String(error)}`);
    } finally {
      try {
        transporter.close();
      } catch {}
    }
  }
}

export { buildTransport, requireString };
