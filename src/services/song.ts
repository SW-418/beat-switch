import SongDb from "@/data-access/db/song";

class SongService {
    private songDb: SongDb;

    constructor() {
        this.songDb = new SongDb();
    }

    async createSong(name: string, artist: string, album: string, releaseDate: string, isrc: string, duration: number): Promise<number> {
        return await this.songDb.createSong(name, artist, album, releaseDate, isrc, duration);
    }
}

export default SongService;
