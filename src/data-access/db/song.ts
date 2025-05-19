import { Track } from "@/services/track";
import { PrismaClient } from "@prisma/client";
import HashGenerator from "@/data-access/hash-generator";

class SongDb {
    private prisma: PrismaClient;
    private hashGenerator: HashGenerator;

    constructor() {
        this.prisma = new PrismaClient();
        this.hashGenerator = new HashGenerator();
    }

    async createSong(track: Track): Promise<number> {
        const hash = await this.hashGenerator.generateTrackHash(track);
        const song = await this.prisma.song.upsert({
            where: {
                hash: hash
            },
            create: {
                name: track.name,
                album: track.album,
                releaseDate: track.releaseDate,
                isrc: track.isrc,
                duration: track.duration,
                hash: hash,
                artists: {
                    connectOrCreate: track.artists.map(artistName => ({
                        where: { name: artistName },
                        create: { name: artistName }
                    }))
                }
            },
            update: {}
        });
        return song.id;
    }
}

export default SongDb;
