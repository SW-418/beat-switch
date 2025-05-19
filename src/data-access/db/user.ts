import { PrismaClient } from '../../generated/prisma/client'

class UserDb {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }

    async getUserByAccountId(accountId: string): Promise<number | undefined> {
        const user = await this.prisma.user.findFirst({
            where: {
                Accounts: {
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
