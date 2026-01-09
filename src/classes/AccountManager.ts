// Класс AccountManager
export class AccountManager implements IAccountManager, ISummary {
    public accounts: Account[] = [];

    // Геттеры
    get income(): number {
        return this.accounts.reduce((sum, account) => sum + account.income, 0);
    }

    get expenses(): number {
        return this.accounts.reduce((sum, account) => sum + account.expenses, 0);
    }

    get balance(): number {
        return this.accounts.reduce((sum, account) => sum + account.balance, 0);
    }
}