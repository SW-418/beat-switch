import { SyncPlaylist } from "@/app/types/api/responses/sync-playlist";
import { SongMappingWithSong } from "../types/song-mapping";
import { getSongMappingsByISRC } from "../apple/client";
import { SongMappingState } from "@/generated/prisma";
import SongMapper from "../../utils/song-mapper";
import PlaylistClient from "@/app/playlist/client";

class TransferClient {
    private readonly playlistClient: PlaylistClient;

    constructor() {
        this.playlistClient = new PlaylistClient();
    }

    async mapPlaylistSongs(playlist: SyncPlaylist) {
        if (playlist.status !== 'MAPPING') return;

        // TODO: Pagination for this endpoint
        const url = `/api/v1/playlists/${playlist.id}/songs?states=READY_TO_MAP`;
        const response = await fetch(url);
        const songsToMap:SongMappingWithSong[] = await response.json();
        let mapped = 0;
        let unmapped = 0;

        // Retrieve potential mappings in batches of 50
        for (let i = 0; i < songsToMap.length; i+=50) {
            const batch = songsToMap.slice(i, i + 50);
            const isrcList = batch.map((song: SongMappingWithSong) => song.song.isrc);

            const potentialMappings = await getSongMappingsByISRC(isrcList);
            console.log(`Retrieved ISRC Mappings for ${Object.keys(potentialMappings).length}/${batch.length} songs`)

            // TODO: Utilize Record for constant lookup
            batch.forEach((song: SongMappingWithSong) => {
                console.log(song, potentialMappings[song.song.isrc])
                try {
                    const mappedSong = SongMapper.map(song, potentialMappings[song.song.isrc]);
                    this.playlistClient.mapPlaylistSong(playlist.id, song.id, mappedSong.id.toString())
                    song.state = SongMappingState.MAPPED;
                    mapped++;
                } catch (error) {
                    unmapped++;
                    this.playlistClient.updatePlaylistSongMappingState(playlist.id, song.id, SongMappingState.MANUAL_MAPPING_REQUIRED)
                    song.state = SongMappingState.MANUAL_MAPPING_REQUIRED;
                }
            });
            console.log(`Attempted mapping ${i}/${songsToMap.length} songs`)
            console.log(`Mapped:${mapped} Unmapped:${unmapped}`)
        }
        console.log(`Mapped ${mapped}/${songsToMap.length} songs`)
        console.log(`Manual mapping needed for ${unmapped}/${songsToMap.length} songs`)
    }

    async transferPlaylist(playlist: SyncPlaylist) {
        // Get all mapped songs for the playlist
        const url = `/api/v1/playlists/${playlist.id}/songs?states=MAPPED`;
        const response = await fetch(url);
        const mappedSongs: SongMappingWithSong[] = await response.json();
        
        console.log(`Retrieved ${mappedSongs.length} mapped songs for transfer`);
        
        // TODO: Implement the actual transfer logic here
        // This should create the playlist in Apple Music and add the mapped songs
        
        return mappedSongs;
    }
}

export default TransferClient;
