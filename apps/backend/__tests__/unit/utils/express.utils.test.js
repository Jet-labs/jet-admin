const { validationResult } = require("express-validator");
const { errorUtils } = require("../../../utils/error.util");
const { expressUtils } = require("../../../utils/express.utils");

// Mock dependencies
jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}), { virtual: true });

jest.mock("../../../utils/error.util", () => ({
  errorUtils: {
    extractError: jest.fn(),
  },
}));

describe("expressUtils", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    req = {};
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("sendResponse", () => {
    it("should send a basic success response", () => {
      expressUtils.sendResponse(res, true);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
      });
      expect(errorUtils.extractError).not.toHaveBeenCalled();
    });

    it("should send a success response with data", () => {
      const data = { id: 1, name: "Test" };
      expressUtils.sendResponse(res, true, data);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        id: 1,
        name: "Test",
      });
      expect(errorUtils.extractError).not.toHaveBeenCalled();
    });

    it("should send a response with an error", () => {
      const mockError = new Error("Test error");
      const extractedError = { code: "ERROR", message: "Test error" };
      errorUtils.extractError.mockReturnValue(extractedError);

      expressUtils.sendResponse(res, false, {}, mockError);

      expect(errorUtils.extractError).toHaveBeenCalledWith(mockError);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: extractedError,
      });
    });

    it("should combine success, data, and error", () => {
      const data = { fallbackData: true };
      const mockError = { message: "Partial failure" };
      const extractedError = { code: "PARTIAL", message: "Partial failure" };
      errorUtils.extractError.mockReturnValue(extractedError);

      expressUtils.sendResponse(res, true, data, mockError);

      expect(errorUtils.extractError).toHaveBeenCalledWith(mockError);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        fallbackData: true,
        error: extractedError,
      });
    });
  });

  describe("sendError", () => {
    it("should send an error response with appropriate status and extracted error", () => {
      const mockError = { message: "Custom error" };
      const extractedError = { code: "CUSTOM", message: "Custom error" };
      errorUtils.extractError.mockReturnValue(extractedError);

      expressUtils.sendError(res, 404, mockError);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(errorUtils.extractError).toHaveBeenCalledWith(mockError);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: extractedError,
      });
    });
  });

  describe("validationChecker", () => {
    it("should call next() if there are no validation errors", () => {
      // Mock validationResult to return empty array
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });

      expressUtils.validationChecker(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should send a 400 error response if validation fails", () => {
      const validationErrors = [
        { msg: "Invalid field", param: "testField", location: "body" },
      ];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors,
      });

      const extractedError = { code: "VALIDATION_ERROR", message: "Invalid field" };
      errorUtils.extractError.mockReturnValue(extractedError);

      expressUtils.validationChecker(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).not.toHaveBeenCalled();
      expect(errorUtils.extractError).toHaveBeenCalledWith(validationErrors);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: extractedError,
      });
    });
  });
});
