const { sqliteDB } = require("../../db/sqlite");

const Logger = require("../../utils/logger");
class PolicyService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @returns {any|null}
   */
  static getAllPolicies = async () => {
    Logger.log("info", {
      message: "PolicyService:getAllPolicies:init",
    });
    try {
      const stmt = sqliteDB.prepare(`
        SELECT *
        FROM tbl_pm_policy_objects
      `);
      const policies = stmt.all();
      Logger.log("success", {
        message: "PolicyService:getAllPolicies:policies",
        params: {
          policies,
        },
      });
      return policies;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:getAllPolicies:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   * Fetches a policy from the database by its ID.
   *
   * @param {object} param0 - The options object.
   * @param {number} param0.pmPolicyObjectID - The ID of the policy to fetch.
   * @returns {any|null} The policy object if found, or null if not found or an error occurs.
   */
  static getPolicyByID = async ({ pmPolicyObjectID }) => {
    Logger.log("info", {
      message: "PolicyService:getPolicyByID:init",
      params: {
        pmPolicyObjectID,
      },
    });

    try {
      const stmt = sqliteDB.prepare(`
      SELECT *
      FROM tbl_pm_policy_objects
      WHERE pm_policy_object_id = ?
    `);

      const policy = stmt.get(parseInt(pmPolicyObjectID));

      if (policy) {
        Logger.log("success", {
          message: "PolicyService:getPolicyByID:policyFound",
          params: {
            policy,
          },
        });
      } else {
        Logger.log("info", {
          message: "PolicyService:getPolicyByID:noPolicyFound",
          params: {
            pmPolicyObjectID,
          },
        });
      }

      return policy;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:getPolicyByID:catch-1",
        params: { error },
      });

      throw error;
    }
  };
  /**
   *
   * @param {object} param0
   * @param {String} param0.pmPolicyObjectTitle
   * @param {object} param0.pmPolcyObject
   * @returns {any|null}
   */
  static addPolicy = async ({ pmPolicyObjectTitle, pmPolcyObject }) => {
    Logger.log("info", {
      message: "PolicyService:addPolicy:params",
      params: {
        pmPolicyObjectTitle,
        pmPolcyObject,
      },
    });
    try {
      const stmt = sqliteDB.prepare(`
      INSERT INTO tbl_pm_policy_objects (
      title, policy, created_at, updated_at
      ) VALUES (
      ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      `);
      const newPolicy = stmt.run(
        String(pmPolicyObjectTitle),
        JSON.stringify(pmPolcyObject)
      );
      Logger.log("success", {
        message: "PolicyService:addPolicy:newPolicy",
        params: {
          pmPolicyObjectTitle,
          pmPolcyObject,
          newPolicy,
        },
      });
      return newPolicy;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:addPolicy:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   * Fetches a policy from the database by its ID.
   *
   * @param {object} param0 - The options object.
   * @param {number} param0.pmPolicyObjectID - The ID of the policy to fetch.
   * @returns {any|null} The policy object if found, or null if not found or an error occurs.
   */
  static duplicatePolicy = async ({ pmPolicyObjectID }) => {
    Logger.log("info", {
      message: "PolicyService:duplicatePolicy:params",
      params: {
        pmPolicyObjectID,
      },
    });
    try {
      const policy = await this.getPolicyByID({ pmPolicyObjectID });
      Logger.log("info", {
        message: "PolicyService:duplicatePolicy:policy",
        params: {
          policy,
        },
      });
      const newPolicy = await this.addPolicy({
        pmPolicyObjectTitle: `${policy.title} copy`,
        pmPolcyObject: JSON.parse(policy.policy),
      });
      Logger.log("success", {
        message: "PolicyService:duplicatePolicy:newPolicy",
        params: {
          newPolicy,
        },
      });
      return newPolicy;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:duplicatePolicy:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmPolicyObjectID
   * @param {String} param0.pmPolicyObjectTitle
   * @param {Boolean} param0.isDisabled
   * @param {String} param0.disableReason
   * @param {any} param0.pmPolcyObject
   * @returns {any|null}
   */
  static updatePolicy = async ({
    pmPolicyObjectID,
    pmPolicyObjectTitle,
    pmPolcyObject,
    isDisabled,
    disableReason,
  }) => {
    Logger.log("info", {
      message: "PolicyService:updatePolicy:params",
      params: {
        pmPolicyObjectID,
        pmPolicyObjectTitle,
        pmPolcyObject,
      },
    });
    try {
      const stmt = sqliteDB.prepare(`
      UPDATE tbl_pm_policy_objects
      SET
        title = COALESCE(?, title),
        policy = COALESCE(?, policy),
        is_disabled = COALESCE(?, is_disabled),
        disable_reason = COALESCE(?, disable_reason)
      WHERE
        pm_policy_object_id = ?
      `);

      const updatedPolicy = stmt.run(
        pmPolicyObjectTitle ? String(pmPolicyObjectTitle) : null,
        pmPolcyObject ? JSON.stringify(pmPolcyObject) : null,
        isDisabled !== undefined ? (Boolean(isDisabled) ? 1 : 0) : null,
        disableReason ? String(disableReason) : null,
        parseInt(pmPolicyObjectID)
      );

      Logger.log("success", {
        message: "PolicyService:updatePolicy:updatedPolicy",
        params: {
          updatedPolicy,
        },
      });
      return updatedPolicy;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:updatePolicy:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmPolicyObjectID
   * @returns {any|null}
   */
  static deletePolicy = async ({ pmPolicyObjectID }) => {
    Logger.log("info", {
      message: "PolicyService:deletePolicy:params",
      params: {
        pmPolicyObjectID,
      },
    });
    try {
      const stmt = sqliteDB.prepare(`
          DELETE FROM tbl_pm_policy_objects
          WHERE pm_policy_object_id = ?
        `);

      const deletedPolicy = stmt.run(parseInt(pmPolicyObjectID));
      Logger.log("success", {
        message: "PolicyService:deletePolicy:success",
        params: {
          pmPolicyObjectID,
        },
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:deletePolicy:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { PolicyService };
