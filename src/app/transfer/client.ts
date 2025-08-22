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
        const url = `/api/v1/playlists/${playlist.id}/songs?unmappedOnly=true`;
        const response = await fetch(url);
        const songs:SongMappingWithSong[] = await response.json();

        // TODO: Probably want enum and use a separate model here for SongMappingWithSong
        const songsToMap = songs.filter((mapping: SongMappingWithSong) => mapping.state === "READY_TO_MAP");
        let mapped = 0;
        let unmapped = 0;

        // Retrieve potential mappings in batches of 50
        for (let i = 0; i < songsToMap.length; i+=50) {
            const batch = songsToMap.slice(i, i + 50);
            const isrcList = batch.map((song: SongMappingWithSong) => song.Song.isrc);

            const potentialMappings = await getSongMappingsByISRC(isrcList);
            console.log(`Retrieved ISRC Mappings for ${Object.keys(potentialMappings).length}/${batch.length} songs`)

            // TODO: Utilize Record for constant lookup
            batch.forEach((song: SongMappingWithSong) => {
                console.log(song, potentialMappings[song.Song.isrc])
                try {
                    const mappedSong = SongMapper.map(song, potentialMappings[song.Song.isrc]);
                    this.playlistClient.mapPlaylistSongMapping(playlist.id, song.id, mappedSong.id.toString())
                    song.state = SongMappingState.MAPPED;
                    mapped++;
                } catch (error) {
                    unmapped++;
                    song.state = SongMappingState.MANUAL_MAPPING_REQUIRED;
                }
            });
            console.log(`Attempted mapping ${i}/${songsToMap.length} songs`)
            console.log(`Mapped:${mapped} Unmapped:${unmapped}`)
        }
        console.log(`Mapped ${mapped}/${songsToMap.length} songs`)
        console.log(`Manual mapping needed for ${unmapped}/${songsToMap.length} songs`)
    }
}

export default TransferClient;
