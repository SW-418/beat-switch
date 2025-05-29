import SongMappingDb from "@/data-access/db/song-mapping";
import { Track } from "./track";
import { SongMappingWithSong } from "@/app/types/song-mapping";

class SongMappingService {
    private songMappingDb: SongMappingDb;

    constructor() {
        this.songMappingDb = new SongMappingDb();
    }

    async createSongMappings(tracks: Track[], songMap: Record<string, number>, playlistId: number): Promise<void> {
        return await this.songMappingDb.createSongMappings(tracks, songMap, playlistId);
    }

    async getSongMappings(playlistId: number, unmappedOnly: boolean = false): Promise<SongMappingWithSong[]> {
        return await this.songMappingDb.getSongMappings(playlistId, unmappedOnly);
    }
}

export default SongMappingService;
