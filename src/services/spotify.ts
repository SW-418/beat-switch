import SpotifyUserApiClient from "@/data-access/spotify/users";
import { Track } from "./Track";
import { SavedTrackObject } from "spotify-api";

class SpotifyService implements IMusicService {
  constructor() { }

  async getSavedTracks(accessToken: string): Promise<Track[]> {
    const savedTracks = new Array<Track>();
    var offset = 0;
    const limit = 50;
    var tracks = await SpotifyUserApiClient.getTracks(accessToken, limit, offset);
    const totalTracks = tracks.total;
    const pages = Math.ceil(totalTracks / limit);
    savedTracks.push(...this.map(tracks.items));

    var trackPromises = new Array<Promise<Track[]>>();
    for (let i = 1; i < pages; i++) {
      trackPromises.push(
        SpotifyUserApiClient.getTracks(accessToken, limit, i * limit)
        .then(t => this.map(t.items))
      );
    }

    const allTracks = await Promise.all(trackPromises);
    savedTracks.push(...allTracks.flat());

    return savedTracks;
  }

  map(tracks: SavedTrackObject[]): Track[] {
    return tracks.map(t => ({
      id: t.track.id,
      name: t.track.name,
      artists: t.track.artists.map(a => a.name),
      album: t.track.album.name,
      isrc: t.track.external_ids.isrc,
      added_at: t.added_at
    }));
  }
}

export default new SpotifyService();

interface IMusicService {
  getSavedTracks(accessToken: string): Promise<Track[]>;
}
