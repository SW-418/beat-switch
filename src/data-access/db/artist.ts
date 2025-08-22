import { PrismaClient } from "@prisma/client";
import prisma from "@/data-access/prisma-client";

class ArtistDb {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async createArtists(artistNames: string[], tx?: PrismaClient): Promise<void> {
        try {
            const client = tx || this.prisma;
            await client.artist.createMany({
                data: artistNames.map(artistName => ({ name: artistName })),
                skipDuplicates: true
            });
        } catch (error) {
            console.error("Failed to create artists", error);
            throw error;
        }
    }
}

export default ArtistDb;
