export class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

export class DecryptionError extends Error {
  constructor(message = "Failed to decrypt message") {
    super(message);
    this.name = "DecryptionError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export function toUserMessage(err: unknown): string {
  if (err instanceof AuthError) return err.message;
  if (err instanceof DecryptionError) return "Message could not be decrypted.";
  if (err instanceof NetworkError) return "Connection error. Check your network.";

  if (err instanceof Error) {
    if (
      err.message.includes("operation") ||
      err.message.includes("decrypt") ||
      err.message.includes("OperationError")
    ) {
      return "Incorrect password or corrupted key.";
    }

    if (
      err.message.includes("fetch") ||
      err.message.includes("network") ||
      err.message.includes("Failed to fetch")
    ) {
      return "Could not reach the server. Check your connection.";
    }

    if (err.message.length < 120) return err.message;
  }

  return "Something went wrong. Please try again.";
}
