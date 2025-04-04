import { BaseApiClient } from "../base";
import ProfileResponse from "./responses/profile-response";
import { UsersTopTracksResponse, UsersSavedTracksResponse } from "spotify-api";

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
    return await this.request<UsersSavedTracksResponse>(`/me/tracks?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
  }
}

export default new SpotifyUserApiClient();
