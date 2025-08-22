import { Track } from "@/services/track";
import { PrismaClient } from "@prisma/client"
import HashGenerator from "@/data-access/hash-generator";
import prisma from "@/data-access/prisma-client";
import ArtistDb from "@/data-access/db/artist";

class SongDb {
    private prisma: PrismaClient;
    private hashGenerator: HashGenerator;
    private artistDb: ArtistDb;

    constructor() {
        this.prisma = prisma;
        this.hashGenerator = new HashGenerator();
        this.artistDb = new ArtistDb();
    }

    async createSongWithHash(track: Track, hash: string, tx?: PrismaClient): Promise<number> {
        try {
            const client = tx || this.prisma;
            const song = await client.song.upsert({
                where: {
                    hash: hash
                },
                create: {
                    name: track.name,
                    album: track.album,
                    releaseDate: track.releaseDate ? new Date(track.releaseDate) : null,
                    isrc: track.isrc,
                    duration: track.duration,
                    hash: hash,
                    Artists: {
                        connect: track.artists.map(artistName => ({
                            name: artistName
                        }))
                    }
                },
                update: {}
            });
            return song.id;
        } catch(error) {
            console.error("Failed to create song", error);
            throw error;
        }
    }

    async createSongs(tracks: Track[]): Promise<Record<string, number>> {
        const trackMap: Record<string, number> = {};
        
        // Pre-compute expensive operations outside transaction
        const allArtists = Array.from(new Set(tracks.flatMap(track => track.artists)));
        const trackHashes = await Promise.all(
            tracks.map(track => this.hashGenerator.generateTrackHash(track))
        );

        // Fast transaction with pre-computed data
        await this.prisma.$transaction(async (tx: PrismaClient) => {
            await this.artistDb.createArtists(allArtists, tx);

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                const hash = trackHashes[i];
                const id = await this.createSongWithHash(track, hash, tx);
                trackMap[track.id] = id;
            }
        }, {
            timeout: 60000
        });

        return trackMap;
    }
}

export default SongDb;
