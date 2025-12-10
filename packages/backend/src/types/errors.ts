/**
 * Custom Error Classes
 * Provides structured error handling with safe messages for clients
 */

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class OllamaError extends AppError {
  constructor(message: string) {
    super(503, `Ollama service error: ${message}`);
    Object.setPrototypeOf(this, OllamaError.prototype);
  }
}

export class ToolExecutionError extends AppError {
  constructor(toolName: string, originalError: string) {
    super(500, `Tool '${toolName}' execution failed: ${originalError}`);
    Object.setPrototypeOf(this, ToolExecutionError.prototype);
  }
}
