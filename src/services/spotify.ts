import SpotifyUserApiClient from "@/data-access/spotify/users";
import { Track } from "./track";
import { SavedTrackObject, UsersTopTracksResponse, CreatePlaylistResponse, AddTracksToPlaylistResponse, ListOfCurrentUsersPlaylistsResponse, PlayListTrackObject } from "spotify-api";
import { Playlist } from "@/app/types/responses/playlist";

class SpotifyService implements IMusicService {
  constructor() { }

  async getAllSavedTracks(accessToken: string): Promise<Track[]> {
    const savedTracks = new Array<Track>();
    const offset = 0;
    const limit = 50;
    const tracks = await SpotifyUserApiClient.getTracks(accessToken, limit, offset);
    const totalTracks = tracks.total;
    const pages = Math.ceil(totalTracks / limit);
    savedTracks.push(...this.mapSavedTracks(tracks.items));

    const trackPromises = new Array<Promise<Track[]>>();
    for (let i = 1; i < pages; i++) {
      trackPromises.push(
        SpotifyUserApiClient.getTracks(accessToken, limit, i * limit)
        .then(t => this.mapSavedTracks(t.items))
      );
    }

    const allTracks = await Promise.all(trackPromises);
    savedTracks.push(...allTracks.flat());

    return savedTracks;
  }

  mapSavedTracks(tracks: SavedTrackObject[]): Track[] {
    return tracks.map(t => ({
      id: t.track.id,
      name: t.track.name,
      artists: t.track.artists,
      album: t.track.album.name,
      isrc: t.track.external_ids.isrc,
      added_at: t.added_at
    }));
  }

  mapTopTracks(tracks: UsersTopTracksResponse[]): Track[] {
    return tracks.map(t => ({
      id: t.id,
      name: t.name,
      artists: t.artists,
      album: t.album.name,
      isrc: t.external_ids.isrc,
    }));
  }

  mapPlaylists(playlists: ListOfCurrentUsersPlaylistsResponse[]): Playlist[] {
    return playlists.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrls: p.images.map(i => i.url)
    }));
  }

  mapPlaylistTracks(tracks: PlayListTrackObject[]): Track[] {
    return tracks.map(t => ({
      id: t.track.id,
      name: t.track.name,
      artists: t.track.artists,
      album: t.track.album.name,
      isrc: t.track.external_ids.isrc,
      added_at: t.added_at
    }));
  }

  async getSavedTracks(accessToken: string, limit: number, offset: number): Promise<Track[]> {
    return await SpotifyUserApiClient.getTracks(accessToken, limit, offset).then(t => this.mapSavedTracks(t.items));
  }

  async getTopTracks(accessToken: string, limit: number, offset: number): Promise<Track[]> {
    return await SpotifyUserApiClient.getTopTracks(accessToken, limit, offset).then(t => this.mapTopTracks(t.items));
  }

  async getPlaylists(accessToken: string): Promise<Playlist[]> {
    return await SpotifyUserApiClient.getPlaylists(accessToken).then(t => this.mapPlaylists(t.items));
  }

  async getAllPlaylistTracks(accessToken: string, playlistId: string): Promise<Track[]> {
    const tracks = new Array<PlayListTrackObject>();
    let hasNextPage = true;
    do {
      const playlistTracksResponse = await SpotifyUserApiClient.getPlaylistTracks(accessToken, playlistId, 50, tracks.length);
      tracks.push(...this.mapPlaylistTracks(playlistTracksResponse.items));
      hasNextPage = playlistTracksResponse.next !== null;
    } while (hasNextPage);
    return tracks;
  }

  async createPlaylist(accessToken: string, name: string, userId: string, description: string): Promise<CreatePlaylistResponse> {
    return await SpotifyUserApiClient.createPlaylist(accessToken, name, userId, description);
  }

  async addTracksToPlaylist(accessToken: string, playlistId: string, uris: string[]): Promise<AddTracksToPlaylistResponse> {
    return await SpotifyUserApiClient.addTracksToPlaylist(accessToken, playlistId, uris);
  }
}

const spotifyService = new SpotifyService();
export default spotifyService;

interface IMusicService {
  getAllSavedTracks(accessToken: string): Promise<Track[]>;
  getSavedTracks(accessToken: string, limit: number, offset: number): Promise<Track[]>;
  getTopTracks(accessToken: string, limit: number, offset: number): Promise<Track[]>;
  getPlaylists(accessToken: string): Promise<Playlist[]>;
  getAllPlaylistTracks(accessToken: string, playlistId: string): Promise<Track[]>;
  createPlaylist(accessToken: string, name: string, userId: string, description: string): Promise<CreatePlaylistResponse>;
  addTracksToPlaylist(accessToken: string, playlistId: string, uris: string[]): Promise<AddTracksToPlaylistResponse>;
}
