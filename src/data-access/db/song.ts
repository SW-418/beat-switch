import { Track } from "@/services/track";
import { PrismaClient, Prisma } from "@prisma/client"
import HashGenerator from "@/data-access/hash-generator";
import prisma from "@/data-access/prisma-client";

class SongDb {
    private prisma: PrismaClient;
    private hashGenerator: HashGenerator;

    constructor() {
        this.prisma = prisma;
        this.hashGenerator = new HashGenerator();
    }

    async createSong(track: Track, tx?: PrismaClient): Promise<number> {
        try {
            const client = tx || this.prisma;
            const hash = await this.hashGenerator.generateTrackHash(track);
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
                        connectOrCreate: track.artists.map(artistName => ({
                            where: { name: artistName },
                            create: { name: artistName }
                        }))
                    }
                },
                update: {}
            });
            return song.id;
        } catch(error: any) {
            console.error("Failed to create song", error.code);
            throw error;
        }
    }

    async createSongs(tracks: Track[]): Promise<Record<string, number>> {
        const trackMap: Record<string, number> = {};
        
        const allArtists = Array.from(new Set(tracks.flatMap(track => track.artists)));

        // Create artists and songs in transaction for atomicity, but worse performance
        // TODO: Extract artist creation to ArtistDb
        await this.prisma.$transaction(async (tx: PrismaClient) => {
            await tx.artist.createMany({
                data: allArtists.map(artistName => ({ name: artistName })),
                skipDuplicates: true
            }).catch((error: any) => {
                console.error("Failed to create artists", error.code);
                throw error;
            });

            for (let i = 0; i < tracks.length; i++) {
                const track = tracks[i];
                const id = await this.createSong(track, tx);
                trackMap[track.id] = id;
            }
        }, {
            timeout: 30000
        });

        return trackMap;
    }
}

export default SongDb;
