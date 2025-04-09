import { Profile } from "./types/responses/profile";
import UnauthorizedError from "./types/errors/unauthorized";

async function handleLogin(): Promise<void> {
    try {
      const authUrl = new URL('/api/v1/spotify/authorize', window.location.origin);
      const response = await fetch(authUrl.toString(), {
        method: 'GET' ,
        headers: {
            'Content-Type': 'application/json',
          },
      })

      if (response.status !== 200) {
        throw new Error('Failed to get authorization URL');
      }

      const { url, verifier } = await response.json();

      window.location.href = url;
      window.localStorage.setItem('code_verifier', verifier);
    } catch (error) {
      console.error('Failed to get authorization URL:', error); 
    }
}

function getCodeQueryParameter(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('code');

    return urlCode;
}

function removeCodeQueryParameter(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    window.history.replaceState({}, document.title, url.pathname);
}

function getCodeVerifier(): string | null {
    const codeVerifier = window.localStorage.getItem('code_verifier');
    if (codeVerifier) window.localStorage.removeItem('code_verifier');

    return codeVerifier;
}

async function getAccessToken(code: string, codeVerifier: string): Promise<void> {
    const url = new URL('/api/v1/spotify/token', window.location.origin);
    url.searchParams.set('code', code);
    url.searchParams.set('verifier', codeVerifier);

    await fetch(url.toString(), {
        method: 'GET' ,
        headers: {
            'Content-Type': 'application/json',
          },
    })
}

async function getUserProfile(): Promise<Profile> {
    const profileUrl = new URL('/api/v1/spotify/profile', window.location.origin);
    const profileResponse = await fetch(profileUrl.toString(), {
      method: 'GET' ,
      headers: {
          'Content-Type': 'application/json',
        },
      })

      if (profileResponse.status === 200) {
        return await profileResponse.json();
      }

      if (profileResponse.status === 401) {
        throw new UnauthorizedError();
      }

      throw new Error('Failed to get user profile');
}

export { handleLogin, getCodeQueryParameter, removeCodeQueryParameter, getCodeVerifier, getAccessToken, getUserProfile };