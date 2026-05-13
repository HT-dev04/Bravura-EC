import "server-only";

const TEMPORARY_DATABASE_ERROR_CODES = ["EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "P2028"];

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    return cause ? `${error.message} ${getErrorMessage(cause)}` : error.message;
  }

  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
}

export function getErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null) return "";

  const code = "code" in error ? String((error as { code?: unknown }).code || "") : "";
  if (code) return code;

  const cause = "cause" in error ? (error as { cause?: unknown }).cause : undefined;
  return cause ? getErrorCode(cause) : "";
}

export function isTemporaryDatabaseError(error: unknown) {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  return TEMPORARY_DATABASE_ERROR_CODES.some((temporaryCode) =>
    code === temporaryCode || message.includes(temporaryCode)
  );
}

export async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  const delays = [300, 800, 1500];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTemporaryDatabaseError(error) || attempt === delays.length) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }

  throw new Error("Database operation failed");
}
