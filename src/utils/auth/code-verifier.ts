import { generateRandomString } from "./index";

let codeVerifier: string | null = null;

export function getCodeVerifier(): string {
  if (!codeVerifier) {
    codeVerifier = generateRandomString(64);
  }
  return codeVerifier;
}
