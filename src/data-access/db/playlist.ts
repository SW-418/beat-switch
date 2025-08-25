import { PrismaClient } from '@prisma/client';
import prisma from "@/data-access/prisma-client";
import { Account, Playlist, PlaylistSyncState } from '@/generated/prisma';

class PlaylistDb {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = prisma;
    }

    async createPlaylist(accountId: number, name: string): Promise<number> {
        const playlist = await this.prisma.playlist.create({
            data: {
                account: {
                    connect: { id: accountId }
                },
                name,
            }
        });
        return playlist.id;
    }

    async getSavedPlaylist(accountId: number): Promise<number | undefined> {
        const playlist = await this.prisma.playlist.findFirst({
            where: {
                account: {
                    id: accountId
                },
                name: 'SAVED'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return playlist?.id;
    }

    async getUserPlaylists(userId: number): Promise<(Playlist & { mappingCounts: { readyToMap: number, mapped: number, manualMappingRequired: number, skipped: number } })[]> {
        const playlists = await this.prisma.playlist.findMany({
            where: {
                account: {
                    id: userId
                }
            }
        });

        const playlistsWithCounts = await Promise.all(
            playlists.map(async (playlist) => {
                const mappingCounts = await this.prisma.songMapping.groupBy({
                    by: ['state'],
                    where: {
                        originalPlaylistId: playlist.id
                    },
                    _count: {
                        state: true
                    }
                });

                const counts = {
                    readyToMap: 0,
                    mapped: 0,
                    manualMappingRequired: 0,
                    skipped: 0
                };

                mappingCounts.forEach(item => {
                    switch (item.state) {
                        case 'READY_TO_MAP':
                            counts.readyToMap = item._count.state;
                            break;
                        case 'MAPPED':
                            counts.mapped = item._count.state;
                            break;
                        case 'MANUAL_MAPPING_REQUIRED':
                            counts.manualMappingRequired = item._count.state;
                            break;
                        case 'SKIPPED':
                            counts.skipped = item._count.state;
                            break;
                    }
                });

                return {
                    ...playlist,
                    mappingCounts: counts
                };
            })
        );

        return playlistsWithCounts;
    }

    async getPlaylistById(playlistId: number): Promise<Playlist & { account: Account, mappingCounts: { readyToMap: number, mapped: number, manualMappingRequired: number, skipped: number } } | null> {
        const playlist = await this.prisma.playlist.findUnique({
            where: {
                id: playlistId
            },
            include: {
                account: true
            }
        });

        if (!playlist) {
            return null;
        }

        const mappingCounts = await this.prisma.songMapping.groupBy({
            by: ['state'],
            where: {
                originalPlaylistId: playlistId
            },
            _count: {
                state: true
            }
        });

        const counts = {
            readyToMap: 0,
            mapped: 0,
            manualMappingRequired: 0,
            skipped: 0
        };

        mappingCounts.forEach(item => {
            switch (item.state) {
                case 'READY_TO_MAP':
                    counts.readyToMap = item._count.state;
                    break;
                case 'MAPPED':
                    counts.mapped = item._count.state;
                    break;
                case 'MANUAL_MAPPING_REQUIRED':
                    counts.manualMappingRequired = item._count.state;
                    break;
                case 'SKIPPED':
                    counts.skipped = item._count.state;
                    break;
            }
        });

        return {
            ...playlist,
            mappingCounts: counts
        };
    }

    async updatePlaylistStatus(playlistId: number, status: PlaylistSyncState): Promise<void> {
        await this.prisma.playlist.update({
            where: {
                id: playlistId
            },
            data: {
                status
            }
        });
    }
}

export default PlaylistDb;
