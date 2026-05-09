export const syslogTestConnection = async ({ datasourceOptions }) => {
  // Syslog is a passive listener, so we just return true.
  // Optionally, we could try binding to the port momentarily, but it might already be in use.
  return { success: true };
};
