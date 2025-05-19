import { PrismaClient } from "@prisma/client";

class SongDb {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }

    async createSong(name: string, artist: string, album: string, releaseDate: string, isrc: string, duration: number): Promise<number> {
        // TODO: Need to check if song already exists by checking ISRC, name, artist, album
        const song = await this.prisma.song.create({
            data: {
                name,
                artist,
                album,
                releaseDate,
                isrc,
                duration
            }
        });
        return song.id;
    }
}

export default SongDb;
