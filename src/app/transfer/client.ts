import { SyncPlaylist } from "../types/responses/sync-playlist";
import { SongMappingWithSong } from "../types/song-mapping";
import { getSongMappingsByISRC } from "../apple/client";
import { SongMappingState } from "@/generated/prisma";
import SongMapper from "../../utils/song-mapper";

class TransferClient {
    constructor() { }

    async mapPlaylistSongs(playlist: SyncPlaylist) {
        // Check playlist status is mapping else return
        if (playlist.status !== 'MAPPING') return;

        const url = `/api/v1/playlists/${playlist.id}/tracks?unmappedOnly=true`;
        const response = await fetch(url);
        const tracks = await response.json();

        // TODO: Probably want enum and use a separate model here for SongMappingWithSong
        const tracksToMap = tracks.filter((mapping: SongMappingWithSong) => mapping.state === "READY_TO_MAP");

        // Retrieve potential mappings in batches of 50
        for (var i = 0; i < tracksToMap.length; i+=50) {
            const batch = tracksToMap.slice(i, i + 50);
            const potentialMappings = await getSongMappingsByISRC(batch.map((track: SongMappingWithSong) => track.isrc));

            // TODO: Utilize Record for constant lookup
            batch.forEach((track: SongMappingWithSong) => {
                const potentialMapping = potentialMappings[track.isrc];
                if (potentialMapping.length === 0) {
                    track.state = SongMappingState.MANUAL_MAPPING_REQUIRED;
                    return;
                }
                try {
                    const mappedSong = SongMapper.map(track, potentialMapping);
                    track.state = SongMappingState.MAPPED;
                } catch (error) {
                    console.error(`Failed to map song: ${track.name}`);
                    track.state = SongMappingState.MANUAL_MAPPING_REQUIRED;
                }
            });
        }
        
        
    }
    
}

export default TransferClient;
