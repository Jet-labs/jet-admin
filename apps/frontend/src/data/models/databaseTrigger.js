export class DatabaseTrigger {
  /**
   * @param {object} options
   * @param {string} options.databaseSchemaName - The schema name (default: "public").
   * @param {string} options.databaseTableName - The table name.
   * @param {string} options.databaseTriggerName - The name of the trigger.
   * @param {string} options.triggerTiming - BEFORE, AFTER, or INSTEAD OF (default: "AFTER").
   * @param {Array<string>} options.triggerEvents - Array of events: INSERT, UPDATE, DELETE, TRUNCATE.
   * @param {string} options.triggerFunctionName - The function to execute.
   * @param {string} options.forEach - ROW or STATEMENT (default: "ROW").
   * @param {string|null} options.whenCondition - Optional conditional expression for WHEN clause.
   * @param {string|null} options.referencingOld - Optional alias for OLD rows (for INSTEAD OF triggers).
   * @param {string|null} options.referencingNew - Optional alias for NEW rows (for INSTEAD OF triggers).
   * @param {boolean} options.deferrable - Whether the trigger is DEFERRABLE (default: false).
   * @param {boolean} options.initiallyDeferred - Whether the trigger is INITIALLY DEFERRED (default: false).
   */
  constructor({
    databaseSchemaName = "public",
    databaseTableName,
    databaseTriggerName,
    triggerTiming = "AFTER",
    triggerEvents = ["INSERT"],
    triggerFunctionName,
    forEach = "ROW",
    whenCondition = null,
    referencingOld = null,
    referencingNew = null,
    deferrable = false,
    initiallyDeferred = false,
  }) {
    this.databaseSchemaName = databaseSchemaName;
    this.databaseTableName = databaseTableName;
    this.databaseTriggerName = databaseTriggerName;
    this.triggerTiming = triggerTiming;
    this.triggerEvents = triggerEvents;
    this.triggerFunctionName = triggerFunctionName;
    this.forEach = forEach;
    this.whenCondition = whenCondition;
    this.referencingOld = referencingOld;
    this.referencingNew = referencingNew;
    this.deferrable = deferrable;
    this.initiallyDeferred = initiallyDeferred;
  }

  /**
   * Converts an array of trigger data into a list of `DatabaseTrigger` instances.
   * @param {Array<object>} data - Array of trigger data objects.
   * @returns {Array<DatabaseTrigger>} - Array of `DatabaseTrigger` instances.
   */
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new DatabaseTrigger(item));
    }
    throw new Error(
      "Input must be an array to convert to a list of DatabaseTrigger instances."
    );
  }

  /**
   * Serializes the trigger object into a plain JavaScript object.
   * @returns {object} - Serialized trigger object.
   */
  serialize() {
    return {
      databaseSchemaName: this.databaseSchemaName,
      databaseTableName: this.databaseTableName,
      databaseTriggerName: this.databaseTriggerName,
      triggerTiming: this.triggerTiming,
      triggerEvents: this.triggerEvents,
      triggerFunctionName: this.triggerFunctionName,
      forEach: this.forEach,
      whenCondition: this.whenCondition,
      referencingOld: this.referencingOld,
      referencingNew: this.referencingNew,
      deferrable: this.deferrable,
      initiallyDeferred: this.initiallyDeferred,
    };
  }

  /**
   * Validates the trigger properties.
   * @throws {Error} - Throws an error if any required property is missing or invalid.
   */
  validate() {
    const validTimings = ["BEFORE", "AFTER", "INSTEAD OF"];
    const validEvents = ["INSERT", "UPDATE", "DELETE", "TRUNCATE"];
    const validForEach = ["ROW", "STATEMENT"];

    if (!validTimings.includes(this.triggerTiming.toUpperCase())) {
      throw new Error(
        `Invalid trigger timing: ${
          this.triggerTiming
        }. Valid options are: ${validTimings.join(", ")}.`
      );
    }

    const invalidEvents = this.triggerEvents.filter(
      (event) => !validEvents.includes(event.toUpperCase())
    );
    if (invalidEvents.length > 0) {
      throw new Error(
        `Invalid trigger events: ${invalidEvents.join(
          ", "
        )}. Valid options are: ${validEvents.join(", ")}.`
      );
    }

    if (!validForEach.includes(this.forEach.toUpperCase())) {
      throw new Error(
        `Invalid FOR EACH option: ${
          this.forEach
        }. Valid options are: ${validForEach.join(", ")}.`
      );
    }

    if (
      !this.databaseTableName ||
      !this.databaseTriggerName ||
      !this.triggerFunctionName
    ) {
      throw new Error(
        "Missing required properties: databaseTableName, databaseTriggerName, or triggerFunctionName."
      );
    }
  }
}
