import { generateRandomString } from "../crypto";

let codeVerifier: string | null = null;

export function getCodeVerifier(): string {
  if (!codeVerifier) {
    codeVerifier = generateRandomString(64);
  }
  return codeVerifier;
}
