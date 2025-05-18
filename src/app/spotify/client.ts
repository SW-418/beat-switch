import { getSongMappingsByISRC, getSongMappingsByNames } from "../apple/client";
import { Track } from "../types/responses/track";
import { SongMapping } from "../types/song-mapping";
import SongMapper from "../../utils/song-mapper";

export class SpotifyClient {
    private likedSongsCache: Track[];
    private isrcMappingsCache: Record<string, SongMapping[]>;

    constructor() { 
        // Temp cache to prevent pull from Spotify every time - Will likely have a DB in the future
        this.likedSongsCache = [];
        // Temp cache to prevent pull from Apple Music every time - Will likely have a DB in the future
        this.isrcMappingsCache = {};
    }

    async transferLikedSongs() {
        const songsInCache = this.likedSongsCache.length > 0;
        const likedSongs = songsInCache ? this.likedSongsCache : await this.getLikedSongs();
        if (!songsInCache) this.likedSongsCache = likedSongs;

        const isrcMappingsInCache = Object.keys(this.isrcMappingsCache).length > 0;
        const songMappings = isrcMappingsInCache ? this.isrcMappingsCache : await getSongMappingsByISRC(likedSongs);
        if (!isrcMappingsInCache) this.isrcMappingsCache = songMappings;

        const unmappableSongs: Track[] = [];
        for (const song of likedSongs) {
            const potentialMappings = songMappings[song.isrc];
            try {
                const mappedSong = SongMapper.map(song, potentialMappings);
            } catch (error) {
                unmappableSongs.push(song);
            }
        }

        console.log(unmappableSongs);

        const unmappableSongsByNames: Track[] = [];
        for (const song of unmappableSongs) {
            const potentialMappings = await getSongMappingsByNames(song);
            console.log(song);
            console.log(potentialMappings);
            try {
                const mappedSong = SongMapper.map(song, potentialMappings);
            } catch (error) {
                unmappableSongsByNames.push(song);
            }
        }

        console.log(unmappableSongsByNames);
    }

    // Retrieve all liked Songs from Spotify via our backend
    async getLikedSongs() {
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
}

export default new SpotifyClient();
