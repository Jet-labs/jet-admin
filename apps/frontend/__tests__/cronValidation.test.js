import {
  formValidations,
  isValidCronExpression,
} from "../src/utils/formValidation";

const additionSchema = formValidations.cronJobAdditionFormValidationSchema;
const validWorkflowID = "11111111-1111-4111-8111-111111111111";

const validateCronForm = (overrides = {}) =>
  additionSchema.validate(
    {
      cronJobTitle: "QA cron",
      cronJobSchedule: "* * * * *",
      workflowID: validWorkflowID,
      ...overrides,
    },
    { abortEarly: false }
  );

describe("cron job form validation", () => {
  test.each([
    "* * * * *",
    "0 0 1 1 *",
    "*/5 9-17 * * MON-FRI",
    "0,30 8,20 * * 1,5",
  ])("accepts valid expression %s", (expression) => {
    expect(isValidCronExpression(expression)).toBe(true);
  });

  test.each([
    "",
    "not-a-cron",
    "* * * *",
    "* * * * * *",
    "every minute",
  ])("rejects invalid expression %s", (expression) => {
    expect(isValidCronExpression(expression)).toBe(false);
  });

  test("rejects an invalid schedule instead of silently defaulting", async () => {
    await expect(validateCronForm({ cronJobSchedule: "not-a-cron" })).rejects.toThrow(
      /Invalid cron schedule expression/
    );
  });

  test("accepts a 255-character title and rejects 256", async () => {
    await expect(validateCronForm({ cronJobTitle: "a".repeat(255) })).resolves.toBeTruthy();
    await expect(validateCronForm({ cronJobTitle: "a".repeat(256) })).rejects.toThrow(
      /255 characters or fewer/
    );
  });
});
