import { Track } from "../types/responses/track";
import { Playlist } from "../types/responses/playlist";
import { createPlaylist, getSongsByISRC, addSongsToPlaylist } from "../apple/client";
import SyncInitiationFailure from "../types/errors/sync-init-failure";

export class SpotifyClient {
    constructor() { }

    async syncLikedSongs(): Promise<void> {
        const likedSongsUrl = new URL(`/api/v1/spotify/tracks/sync`, window.location.origin);
        const likedSongsResponse = await fetch(likedSongsUrl.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
        if (likedSongsResponse.status !== 202) throw new SyncInitiationFailure();
    }

    // Retrieve all liked Songs from Spotify via our backend
    async getLikedSongs(): Promise<Track[]> {
        // TODO: This is paginated on the BE for calls to Spotify, but could be paginated here as well when calling our backend
        const likedSongsUrl = new URL(`/api/v1/spotify/tracks`, window.location.origin);
        const likedSongsResponse = await fetch(likedSongsUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        return await likedSongsResponse.json();
    }

    async getPlayLists(): Promise<Playlist[]> {
        const playlistsUrl = new URL(`/api/v1/spotify/playlists`, window.location.origin);
        const playlistsResponse = await fetch(playlistsUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })

        return await playlistsResponse.json();
    }

    async getSongsForPlaylist(playlistId: string): Promise<Track[]> {
      const url = new URL(`/api/v1/spotify/playlists/${playlistId}/tracks`, window.location.origin);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      return await response.json();
    }
    
    async transferPlaylist(playlist: Playlist): Promise<void> {
      // Retrieve all tracks from the playlist
      const songs = await this.getSongsForPlaylist(playlist.id);
      
      // Create playlist in Apple Music
      // TODO: We need to better abstract this - This component is doing too much
      const appleMusicPlaylistId = await createPlaylist(playlist);

      // Lookup Apple Music track IDs using ISRC
      const songMappings = await getSongsByISRC(songs);

      // Update song objects with external IDs (if present)
      songs.forEach(song => {
        song.external_id = songMappings[song.isrc];
        if (!song.external_id) console.error(`No external ID found for song: ${song.name} - ${song.artists.map(artist => artist.name).join(', ')}`);
      });

      // Add tracks to the playlist in Apple Music
      await addSongsToPlaylist(songs, appleMusicPlaylistId);
    };
}

export default new SpotifyClient();
