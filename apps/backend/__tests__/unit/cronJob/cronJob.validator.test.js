const {
  createCronJobSchema,
  updateCronJobSchema,
} = require('../../../modules/cronJob/cronJob.validator');

const workflowID = '11111111-1111-4111-8111-111111111111';

const validPayload = {
  cronJobTitle: 'QA cron',
  cronJobSchedule: '* * * * *',
  workflowID,
};

describe('cronJob.validator', () => {
  it('accepts a valid schedule and the 255-character title boundary', () => {
    const result = createCronJobSchema.safeParse({
      ...validPayload,
      cronJobTitle: 'a'.repeat(255),
      cronJobSchedule: '0 0 1 1 *',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid cron expression', () => {
    const result = createCronJobSchema.safeParse({
      ...validPayload,
      cronJobSchedule: 'not-a-cron',
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ message: 'Invalid cron schedule expression' }),
    ]));
  });

  it('rejects a title longer than 255 characters on create and update', () => {
    const title = 'a'.repeat(256);
    expect(createCronJobSchema.safeParse({ ...validPayload, cronJobTitle: title }).success).toBe(false);
    expect(updateCronJobSchema.safeParse({ cronJobTitle: title }).success).toBe(false);
  });
});
