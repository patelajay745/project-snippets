export class ApiResponse {
  constructor(message = "", data = {}) {
    this.message = message;
    this.data = data;
  }
}
