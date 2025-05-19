import { BaseApiClient } from "../base";
import { sha256Hash, base64encode } from "@/utils/crypto";
import TokenResponse from "./responses/token-response";
import { getCodeVerifier } from "@/utils/auth/code-verifier";
import { AuthResponse } from "./responses/auth-response";

class SpotifyAccountApiClient extends BaseApiClient {
  private clientId: string;
  private redirectUri: string;
  private responseType: string = 'code';
  private codeChallengeMethod: string = 'S256';
  private grantType: string = 'authorization_code';
  private scope: string = 'user-top-read user-library-read playlist-modify-public playlist-modify-private';

  constructor() {
    super('https://accounts.spotify.com');
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

    if (!clientId || !redirectUri) throw new Error('Missing required environment variables: SPOTIFY_CLIENT_ID and/or SPOTIFY_REDIRECT_URI');

    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  // TODO: Debatable if this should be here - We should separate out client code
  async authorize(): Promise<AuthResponse> {
    const codeVerifier = getCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    const url = new URL('/authorize', this.baseUrl);
    url.searchParams.set('response_type', this.responseType); 
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', this.codeChallengeMethod);
    url.searchParams.set('scope', this.scope);

    return { url: url.toString(), verifier: codeVerifier };
  }

  async token(authorizationCode: string, verifier: string): Promise<TokenResponse> {
    return await this.request<TokenResponse>(`/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: this.grantType,
        code: authorizationCode,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: verifier,
      }),
    });
  }

  private async generateCodeChallenge(codeVerifier: string) {
    const hash = await sha256Hash(codeVerifier);
    return base64encode(hash);
  }
}

// TODO: Must be a better way to do this
const spotifyClient = new SpotifyAccountApiClient();
export default spotifyClient;
