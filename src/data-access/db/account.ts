import { PrismaClient } from '../../generated/prisma/client'
import { AccountType } from '@/app/types/account-types'

class AccountDb {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }

    async createAccount(userId: number, accountId: string, accountType: AccountType): Promise<number> {
        const account = await this.prisma.account.create({
            data: {
                accountId,
                User: {
                    connect: { id: userId }
                },
                accountType: {
                    connect: { name: accountType }
                }
            }
        });
        return account.id;
    }
}

export default AccountDb;
