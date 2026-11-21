/**
 * Small async helpers used at I/O boundaries.
 */

/**
 * Resolve/reject a promise with a bounded wall-clock time.
 *
 * The original promise always gets a rejection handler attached, so a late
 * rejection after the timeout cannot become an unhandled rejection.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} label - Error message used when the timeout wins.
 * @returns {Promise<T>}
 */
function withTimeout(promise, ms, label = "Operation timed out") {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(label)), ms);
    if (typeof timer.unref === "function") timer.unref();

    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

module.exports = { withTimeout };
