import SpotifyUserApiClient from "@/data-access/spotify/users";
import { Track } from "./track";
import { SavedTrackObject, UsersTopTracksResponse, CreatePlaylistResponse, AddTracksToPlaylistResponse, ListOfCurrentUsersPlaylistsResponse, PlayListTrackObject, ArtistObjectSimplified } from "spotify-api";
import { Playlist } from "@/app/types/responses/playlist";
import AccountService from "./account";
import AccountNotFoundError from "@/app/types/errors/account-not-found";
import PlaylistService from "./playlist";
import SongService from "./song";

class SpotifyService implements IMusicService {
  private accountService: AccountService;
  private playlistService: PlaylistService;
  private songService: SongService;

  constructor() {
    this.accountService = new AccountService();
    this.playlistService = new PlaylistService();
    this.songService = new SongService();
  }

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
      artists: t.track.artists.map((a: ArtistObjectSimplified) => a.name),
      album: t.track.album.name,
      isrc: t.track.external_ids.isrc,
      addedAt: t.added_at,
      countryCode: t.track.external_ids.isrc.slice(0, 2),
      releaseDate: t.track.album.release_date,
      duration: t.track.duration_ms
    }));
  }

  mapTopTracks(tracks: UsersTopTracksResponse[]): Track[] {
    return tracks.map(t => ({
      id: t.id,
      name: t.name,
      artists: t.artists.map((a: ArtistObjectSimplified) => a.name),
      album: t.album.name,
      isrc: t.external_ids.isrc,
      countryCode: t.external_ids.isrc.slice(0, 2),
      releaseDate: t.album.release_date,
      duration: t.duration_ms
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
      artists: t.track.artists.map((a: ArtistObjectSimplified) => a.name),
      album: t.track.album.name,
      isrc: t.track.external_ids.isrc,
      addedAt: t.added_at,
      countryCode: t.track.external_ids.isrc.slice(0, 2),
      releaseDate: t.track.album.release_date,
      duration: t.track.duration_ms
    }));
  }

  async getSavedTracks(accessToken: string, limit: number, offset: number): Promise<Track[]> {
    return await SpotifyUserApiClient.getTracks(accessToken, limit, offset).then(t => this.mapSavedTracks(t.items));
  }

  async syncSavedTracks(userId: number, accessToken: string): Promise<void> {
    const savedTracks = await this.getAllSavedTracks(accessToken);
    const spotifyAccountId = await this.accountService.getSpotifyAccount(userId);
    if (!spotifyAccountId) throw new AccountNotFoundError();

    let savedPlaylistId = await this.playlistService.getSavedPlaylist(spotifyAccountId);
    if (!savedPlaylistId) {
      savedPlaylistId = await this.playlistService.createPlaylist(spotifyAccountId, 'SAVED');
    }
    
    // Save songs to Song table and Artists to Artists table
    const songMap = await this.songService.createSongs(savedTracks);
    
    // Create mapping for each song and add to Song Mapping table
    
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
  syncSavedTracks(userId: number, accessToken: string): Promise<void>;
  getTopTracks(accessToken: string, limit: number, offset: number): Promise<Track[]>;
  getPlaylists(accessToken: string): Promise<Playlist[]>;
  getAllPlaylistTracks(accessToken: string, playlistId: string): Promise<Track[]>;
  createPlaylist(accessToken: string, name: string, userId: string, description: string): Promise<CreatePlaylistResponse>;
  addTracksToPlaylist(accessToken: string, playlistId: string, uris: string[]): Promise<AddTracksToPlaylistResponse>;
}
