import { BaseApiClient } from "../base";
import { UsersTopTracksResponse, UsersSavedTracksResponse, CreatePlaylistResponse, AddTracksToPlaylistResponse, UserObjectPrivate, ListOfCurrentUsersPlaylistsResponse, PlaylistTracksResponse } from "spotify-api";
import RetryConfig from "./retry-config";

class SpotifyUserApiClient extends BaseApiClient {
  constructor() {
    super('https://api.spotify.com/v1');
  }

  async getProfile(accessToken: string): Promise<UserObjectPrivate> {
    return await this.request<UserObjectPrivate>('/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async getTopTracks(accessToken: string, limit: number = 50, offset: number = 0): Promise<UsersTopTracksResponse> {
    return await this.request<UsersTopTracksResponse>(`/me/top/tracks?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async getTracks(accessToken: string, limit: number = 50, offset: number = 0): Promise<UsersSavedTracksResponse> {
    const retryPolicy: RetryConfig = {
      retryOn: (attempt, error, response) => {
        if (error) return true;
        const shouldRetry = response.status === 429;
        if (shouldRetry) console.log(`Attempt ${attempt}: ${error} - ${response.status}`);
        return shouldRetry;
      },
      retries: 3,
      retryDelay: (attempt, _error, _response) => {
        const baseDelay = Math.pow(2, attempt) * 1000;
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

  async getPlaylists(accessToken: string): Promise<ListOfCurrentUsersPlaylistsResponse[]> {
    return await this.request<ListOfCurrentUsersPlaylistsResponse[]>(`/me/playlists`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async getPlaylistTracks(accessToken: string, playlistId: string, limit: number = 50, offset: number = 0): Promise<PlaylistTracksResponse> {
    return await this.request<PlaylistTracksResponse>(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async createPlaylist(accessToken: string, name: string, userId: string, description: string = "Created by Beat Switch"): Promise<CreatePlaylistResponse> {
    return await this.request<CreatePlaylistResponse>(`/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        public: false,
        description,
      }),
    });
  }

  async addTracksToPlaylist(accessToken: string, playlistId: string, uris: string[]): Promise<AddTracksToPlaylistResponse> {
    return await this.request<AddTracksToPlaylistResponse>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris,
      }),
    });
  }
}

export default new SpotifyUserApiClient();
