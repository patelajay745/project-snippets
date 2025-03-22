export class ApiResponse {
  constructor(statusCode = 200, message = "", data = {}) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
