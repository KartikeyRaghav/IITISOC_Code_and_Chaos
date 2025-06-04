// This file defines a utility class for creating standardized API responses.
class ApiResponse {
  constructor(statusCode, message = "Success", data = null) {
    this.status = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
