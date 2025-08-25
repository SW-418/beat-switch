import { PrismaClient } from '@prisma/client'
import prisma from "@/data-access/prisma-client";

class UserDb {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async getUserByAccountId(accountId: string): Promise<number | undefined> {
        const user = await this.prisma.user.findFirst({
            where: {
                accounts: {
                    some: {
                        accountId
                    }
                }
            }
        });
        
        return user?.id;
    }

    async createUser(): Promise<number> {
        const user = await this.prisma.user.create({});
        return user.id;
    }
}

export default UserDb;
