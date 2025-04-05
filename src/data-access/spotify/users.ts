import { BaseApiClient } from "../base";
import ProfileResponse from "./responses/profile-response";
import { UsersTopTracksResponse, UsersSavedTracksResponse } from "spotify-api";
import RetryConfig from "./retry-config";

class SpotifyUserApiClient extends BaseApiClient {
  constructor() {
    super('https://api.spotify.com/v1');
  }

  async getProfile(accessToken: string): Promise<ProfileResponse> {
    return await this.request<ProfileResponse>('/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async getTopTracks(accessToken: string): Promise<UsersTopTracksResponse> {
    return await this.request<UsersTopTracksResponse>('/me/top/tracks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async getTracks(accessToken: string, limit: number = 50, offset: number = 0): Promise<UsersSavedTracksResponse> {
    const retryPolicy: RetryConfig = {
      retryOn: [429],
      retries: 3,
      retryDelay: (attempt, error, response) => {
        const baseDelay = Math.pow(2, attempt) * 100;
        const jitter = Math.random() * 100;
        return baseDelay + jitter;
      }
    };

    return await this.requestWithRetry<UsersSavedTracksResponse>(`/me/tracks?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    }, retryPolicy);
  }
}

export default new SpotifyUserApiClient();
