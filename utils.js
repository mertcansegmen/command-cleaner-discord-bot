/**
 * Sleeps for time provided in millisecond
 * @param {number} ms - Amound of time to sleep in milliseconds
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports = { sleep };
