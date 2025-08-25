import { PrismaClient } from "@prisma/client";
import prisma from "@/data-access/prisma-client";
import { Track } from "@/services/track";
import { SongMappingWithSong } from "@/app/types/song-mapping";
import {$Enums, Prisma} from "@/generated/prisma";
import SongMappingCreateManyInput = Prisma.SongMappingCreateManyInput;
import SongMappingState = $Enums.SongMappingState;
import SongMappingUpdateInput = Prisma.SongMappingUpdateInput;
    
class SongMappingDb {
    private readonly prisma: PrismaClient;
    private readonly BATCH_SIZE = 1000;

    constructor() {
        this.prisma = prisma;
    }

    async createSongMappings(tracks: Track[], songMap: Record<string, number>, playlistId: number) {
        const songMappings: SongMappingCreateManyInput[] = tracks.map(track => {
            return {
                originalPlaylistId: playlistId,
                songId: songMap[track.id],
                addedAt: track.addedAt ? new Date(track.addedAt) : null,
                originalServiceId: track.id
            } as SongMappingCreateManyInput;
        });

        await this.prisma.$transaction(async (tx: PrismaClient) => {
            for (let i = 0; i < songMappings.length; i+= this.BATCH_SIZE) {
                try {
                    const batch = songMappings.slice(i, i + this.BATCH_SIZE);
                    await this.persistSongMappings(tx, batch)
                } catch (error) {
                    console.error(`Failed to create song mapping for track ${tracks[i].name}`, error);
                    throw error;
                }
            }
        });
    }

    async persistSongMappings(tx: PrismaClient | undefined, tracks: SongMappingCreateManyInput[]) {
        if (tracks.length == 0) return;

        const client = tx || this.prisma;
        await client.songMapping.createMany({
            data: [
                ...tracks
            ]
        });
    }

    async getSongMappings(playlistId: number, states: string[] = []): Promise<SongMappingWithSong[]> {
        return this.prisma.songMapping.findMany({
            where: {
                originalPlaylistId: playlistId,
                ...(states.length > 0 ? { state: { in: states as SongMappingState[] } } : {})
            },
            include: {
                song: {
                    select: {
                        id: true,
                        name: true,
                        artists: {
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

    async updateSongMapping(playlistId: number, songMappingId: number, mappedSongId?: string, songMappingState?: SongMappingState): Promise<void> {
        const songMappingUpdate: SongMappingUpdateInput = {}

        if (typeof mappedSongId === 'string' && mappedSongId.trim().length > 0) { songMappingUpdate.syncedServiceId = mappedSongId }
        if (songMappingState) { songMappingUpdate.state = songMappingState }

        await this.prisma.$transaction(async (tx: PrismaClient) => {
            await tx.songMapping.update({
                where: {
                    id: songMappingId,
                    originalPlaylistId: playlistId,
                },
                data: songMappingUpdate
            });
        })
    }
}

export default SongMappingDb;
