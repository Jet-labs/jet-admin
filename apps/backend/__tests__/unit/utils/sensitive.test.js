/**
 * Datasource/listener credential masking and partial-update restore.
 */

const {
  MASK_PLACEHOLDER,
  maskDatasourceOptions,
  maskDatasource,
  mergeAndRestoreMaskedOptions,
  redact,
} = require("../../../utils/sensitive");

describe("sensitive helpers", () => {
  it("masks datasource credentials without hiding structural fields", () => {
    const options = {
      authType: "bearer",
      bearerToken: "secret-token",
      username: "user",
      password: "secret-password",
      baseUrl: "https://example.com",
      serviceAccountKey: { private_key: "secret-key" },
      headers: [
        { key: "Authorization", value: "Bearer abc" },
        { key: "X-Trace-Id", value: "visible" },
      ],
      queryParams: [{ key: "api_key", value: "secret-param" }],
    };

    const masked = maskDatasourceOptions(options);

    expect(masked.bearerToken).toBe(MASK_PLACEHOLDER);
    expect(masked.password).toBe(MASK_PLACEHOLDER);
    expect(masked.serviceAccountKey.private_key).toBe(MASK_PLACEHOLDER);
    expect(typeof masked.serviceAccountKey).toBe("object");
    expect(masked.headers[0].value).toBe(MASK_PLACEHOLDER);
    expect(masked.headers[0].key).toBe("Authorization");
    expect(masked.headers[1].value).toBe("visible");
    expect(masked.queryParams[0].value).toBe(MASK_PLACEHOLDER);
    expect(masked.baseUrl).toBe("https://example.com");
    expect(masked.username).toBe("user");

    // No mutation of the source object.
    expect(options.bearerToken).toBe("secret-token");
  });

  it("masks only -datasourceOptions- when wrapping a datasource", () => {
    const datasource = {
      datasourceID: "ds-1",
      datasourceTitle: "Example",
      datasourceOptions: { apiKey: "secret", region: "us-east-1" },
    };

    const masked = maskDatasource(datasource);

    expect(masked.datasourceTitle).toBe("Example");
    expect(masked.datasourceOptions.apiKey).toBe(MASK_PLACEHOLDER);
    expect(masked.datasourceOptions.region).toBe("us-east-1");
    expect(datasource.datasourceOptions.apiKey).toBe("secret");
  });

  it("restores masked values from stored options, including arrays", () => {
    const stored = {
      bearerToken: "secret-token",
      password: "secret-password",
      headers: [
        { key: "Authorization", value: "Bearer abc" },
        { key: "X-Trace-Id", value: "old" },
      ],
    };
    const incoming = {
      bearerToken: MASK_PLACEHOLDER,
      password: MASK_PLACEHOLDER,
      headers: [
        { key: "Authorization", value: MASK_PLACEHOLDER },
        { key: "X-Trace-Id", value: "new" },
      ],
    };

    const merged = mergeAndRestoreMaskedOptions(incoming, stored);

    expect(merged.bearerToken).toBe("secret-token");
    expect(merged.password).toBe("secret-password");
    expect(merged.headers[0].value).toBe("Bearer abc");
    expect(merged.headers[1].value).toBe("new");
  });

  it("keeps a deliberately changed secret", () => {
    const merged = mergeAndRestoreMaskedOptions(
      { bearerToken: "brand-new-token" },
      { bearerToken: "old-token" }
    );
    expect(merged.bearerToken).toBe("brand-new-token");
  });

  it("restores the stored object when the update payload is empty", () => {
    const stored = {
      connectionOption: "connectionDetails",
      connectionDetails: { host: "db", password: "stored" },
    };
    expect(mergeAndRestoreMaskedOptions({}, stored)).toEqual(stored);
    expect(mergeAndRestoreMaskedOptions(undefined, stored)).toEqual(stored);
  });

  it("redacts credentials embedded in free-form log strings", () => {
    const result = redact({
      error: "connection to postgresql://user:supersecret@db:5432/app failed",
      message: "password=hunter2 token=abc123",
      auth: "Bearer eyJhbGciOiJIUzI1NiJ9.payload.signature",
    });
    expect(result.error).toContain("postgresql://[REDACTED]@db:5432/app");
    expect(result.error).not.toContain("supersecret");
    expect(result.message).not.toContain("hunter2");
    expect(result.message).not.toContain("abc123");
    expect(result.auth).toBe("Bearer [REDACTED]");
  });
});
