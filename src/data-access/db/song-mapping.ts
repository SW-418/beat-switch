import { PrismaClient } from "@prisma/client";
import prisma from "@/data-access/prisma-client";
import { Track } from "@/services/track";
import { SongMappingWithSong } from "@/app/types/song-mapping";
    
class SongMappingDb {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async createSongMappings(tracks: Track[], songMap: Record<string, number>, playlistId: number) {
        await this.prisma.$transaction(async (tx: PrismaClient) => {
            for (let i = 0; i < tracks.length; i++) {
                try {
                    const track = tracks[i];
                    const songId = songMap[track.id];
                    await this.createSongMapping(tx, track, songId, playlistId);
                } catch (error) {
                    console.error(`Failed to create song mapping for track ${tracks[i].name}`, error);
                    throw error;
                }
            }
        });
    }

    async createSongMapping(tx: PrismaClient | undefined, track: Track, songId: number, playlistId: number) {
        const client = tx || this.prisma;
        await client.songMapping.create({
            data: {
                originalPlaylistId: playlistId,
                songId: songId,
                addedAt: track.addedAt ? new Date(track.addedAt) : null,
                originalServiceId: track.id,
                
            }
        });
    }

    async getSongMappings(playlistId: number, unmappedOnly: boolean = false): Promise<SongMappingWithSong[]> {
        return await this.prisma.songMapping.findMany({
            where: {
                originalPlaylistId: playlistId,
                ...(unmappedOnly ? { syncedServiceId: null } : {})
            },
            include:{
                Song: {
                    select: {
                        id: true,
                        name: true,
                        Artists: {
                            select: {
                                name: true
                            }
                        },
                        album: true,
                        isrc: true,
                        releaseDate: true,
                        duration: true
                    }
                }
            }
        });
    }
}

export default SongMappingDb;
