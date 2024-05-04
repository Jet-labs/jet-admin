export class UpdateUserState {
  /**
   *
   * @param {Boolean} isLoading
   * @param {Boolean} success
   * @param {Error} error
   */
  constructor({ isLoading, success, error }) {
    /**
     * @type {Boolean}
     */
    this.isLoading = isLoading;
    /**
     * @type {Boolean}
     */
    this.success = success;
    /**
     * @type {Error}
     */
    this.error = error;
  }
}
