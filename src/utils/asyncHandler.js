/**
 * @module AsyncHandler
 * @description Higher-order function to wrap async Express routes and forward errors to the central handler.
 */

/**
 * Wraps an async function to catch any errors and pass them to next().
 * @param {Function} requestHandler - The async Express route handler.
 * @returns {Function} A wrapped version of the handler.
 */
export const asyncHandler = (requestHandler) => (httpRequest, httpResponse, next) => {
  Promise.resolve(requestHandler(httpRequest, httpResponse, next)).catch(next);
};
