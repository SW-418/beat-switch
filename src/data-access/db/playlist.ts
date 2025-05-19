
import { PrismaClient } from '../../generated/prisma/client';

class PlaylistDb {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
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
            }
        });
        return playlist?.id;
    }
}

export default PlaylistDb;
