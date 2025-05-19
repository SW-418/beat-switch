import AccountDb from "@/data-access/db/account";
import { AccountType } from "@/app/types/account-types";

class AccountService {
    private accountDb: AccountDb;
    constructor() {
        this.accountDb = new AccountDb();
    }

    async createAccount(userId: number, accountId: string, accountType: AccountType): Promise<number> {
        return await this.accountDb.createAccount(userId, accountId, accountType);
    }

    async getSpotifyAccount(userId: number): Promise<number | undefined> {
        const accountId = await this.accountDb.getAccountByUserIdAndType(userId, AccountType.SPOTIFY);
        return accountId;
    }
}

export default AccountService;
