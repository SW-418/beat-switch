
class AccountNotFoundError extends Error {
    constructor() {
      super('Account not found');
    }
  }
  
export default AccountNotFoundError;
