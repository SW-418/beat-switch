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
                Account: {
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
                Account: {
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

    async getUserPlaylists(userId: number): Promise<Playlist[]> {
        const playlists = await this.prisma.playlist.findMany({
            where: {
                Account: {
                    id: userId
                }
            }
        });
        return playlists;
    }

    async getPlaylistById(playlistId: number): Promise<Playlist & { Account: Account } | null> {
        const playlist = await this.prisma.playlist.findUnique({
            where: {
                id: playlistId
            },
            include: {
                Account: true
            }
        });
        return playlist;
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
