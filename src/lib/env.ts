export class MissingRequiredEnvError extends Error {
  constructor(public readonly variableName: string) {
    super(`Missing required environment variable: ${variableName}`);
    this.name = "MissingRequiredEnvError";
  }
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new MissingRequiredEnvError(name);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  return process.env[name] || undefined;
}

export function isMissingRequiredEnvError(
  error: unknown,
): error is MissingRequiredEnvError {
  return error instanceof MissingRequiredEnvError;
}
