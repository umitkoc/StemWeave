export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const apiErrors = {
  badRequest: (code: string, message: string) => new ApiError(400, code, message),
  conflict: (code: string, message: string) => new ApiError(409, code, message),
  forbidden: (message = "Bu işlem için yetkiniz yok.") => new ApiError(403, "FORBIDDEN", message),
  notFound: (message = "Kaynak bulunamadı.") => new ApiError(404, "NOT_FOUND", message),
  unauthorized: (message = "Kimlik doğrulaması gerekli.") =>
    new ApiError(401, "UNAUTHORIZED", message),
} as const;
