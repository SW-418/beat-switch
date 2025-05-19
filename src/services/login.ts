import UserDb from "../data-access/db/user";
import { AccountType } from '@/app/types/account-types'
import AccountService from "./account";

class LoginService {
    private userDb: UserDb;
    private accountService: AccountService;
    
    constructor() {
        this.userDb = new UserDb();
        this.accountService = new AccountService();
    }

    async loginUser(accountId: string, accountType: AccountType): Promise<number> {
        let userId = await this.userDb.getUserByAccountId(accountId);
        if (userId) return userId;
        
        userId = await this.createUser();
        await this.accountService.createAccount(userId, accountId, accountType);
        
        return userId;
    }

    async createUser(): Promise<number> {
        return await this.userDb.createUser();
    }
}

export default new LoginService();
