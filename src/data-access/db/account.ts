import { PrismaClient } from '@prisma/client'
import { AccountType } from '@/app/types/account-types'
import prisma from "@/data-access/prisma-client";

class AccountDb {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async createAccount(userId: number, accountId: string, accountType: AccountType): Promise<number> {
        const account = await this.prisma.account.create({
            data: {
                accountId,
                user: {
                    connect: { id: userId }
                },
                accountType: {
                    connect: { name: accountType }
                }
            }
        });
        return account.id;
    }

    async getAccountByUserIdAndType(userId: number, accountType: AccountType): Promise<number | undefined> {
        const account = await this.prisma.account.findFirst({
            where: {
                user: {
                    id: userId
                },
                accountType: {
                    name: accountType
                }
            }
        });
        return account?.id;
    }
}

export default AccountDb;
