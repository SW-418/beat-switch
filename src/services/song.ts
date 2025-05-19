import SongDb from "@/data-access/db/song";
import { Track } from "./track";

class SongService {
    private songDb: SongDb;

    constructor() {
        this.songDb = new SongDb();
    }

    async createSong(track: Track): Promise<number> {
        return await this.songDb.createSong(track);
    }
}

export default SongService;
