export interface ITransaction {
    id: number;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    description: string;
}

export interface IAccount {
    id: number;
    name: string;
}

export interface ISummary {
    income: number;
    expenses: number;
    balance: number;
}

export interface IAccountManager {
    accounts: IAccount[];
    addAccount(account: IAccount): void;
    removeAccountById(accountId: number): boolean;
    getAccountById(id: number): IAccount | undefined;
    getAllAccounts(): IAccount[];
}

// Класс Transaction
export class Transaction implements ITransaction {
    constructor(
        public id: number,
        public amount: number,
        public type: 'income' | 'expense',
        public date: string,
        public description: string
    ) {}

    toString(): string {
        const sign = this.type === 'income' ? '+' : '-';
        const formattedDate = new Date(this.date).toLocaleDateString();
        return `[${formattedDate}] ${this.description}: ${sign}${this.amount.toFixed(2)} (ID: ${this.id})`;
    }
}

// Класс Account
export class Account implements IAccount, ISummary {
    public transactions: Transaction[] = [];

    constructor(
        public id: number,
        public name: string
    ) {}

    // Геттеры
    get income(): number {
        return this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    get expenses(): number {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    get balance(): number {
        return this.income - this.expenses;
    }

    // Методы
    addTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);
    }

    getSummary(): ISummary {
        return {
            income: this.income,
            expenses: this.expenses,
            balance: this.balance
        };
    }

    getSummaryString(): string {
        return `Счёт "${this.name}": Баланс: ${this.balance.toFixed(2)}, ` +
               `Доходы: ${this.income.toFixed(2)}, ` +
               `Расходы: ${this.expenses.toFixed(2)}, ` +
               `Транзакций: ${this.transactions.length}`;
    }

    toString(): string {
        const summary = this.getSummary();
        let result = `=== Счёт: ${this.name} (ID: ${this.id}) ===\n`;
        result += `Баланс: ${summary.balance.toFixed(2)}\n`;
        result += `Доходы: ${summary.income.toFixed(2)}\n`;
        result += `Расходы: ${summary.expenses.toFixed(2)}\n`;
        result += `Количество транзакций: ${this.transactions.length}\n`;
        
        if (this.transactions.length > 0) {
            result += '\nПоследние транзакции:\n';
            const recentTransactions = this.transactions.slice(-5).reverse();
            recentTransactions.forEach(transaction => {
                result += `  ${transaction.toString()}\n`;
            });
        }
        
        return result;
    }
}

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

    // Методы
    addAccount(account: Account): void {
        this.accounts.push(account);
    }

    removeAccountById(accountId: number): boolean {
        const initialLength = this.accounts.length;
        this.accounts = this.accounts.filter(account => account.id !== accountId);
        return this.accounts.length < initialLength;
    }

    getAccountById(id: number): Account | undefined {
        return this.accounts.find(account => account.id === id);
    }

    getAllAccounts(): Account[] {
        return [...this.accounts];
    }

    getSummary(): ISummary {
        return {
            income: this.income,
            expenses: this.expenses,
            balance: this.balance
        };
    }

    getSummaryString(): string {
        const summary = this.getSummary();
        return `Общий баланс: ${summary.balance.toFixed(2)}, ` +
               `Общие доходы: ${summary.income.toFixed(2)}, ` +
               `Общие расходы: ${summary.expenses.toFixed(2)}, ` +
               `Количество счетов: ${this.accounts.length}`;
    }

    toString(): string {
        const summary = this.getSummary();
        let result = '=== ОБЩИЙ БЮДЖЕТ ===\n';
        result += `Общий баланс: ${summary.balance.toFixed(2)}\n`;
        result += `Общие доходы: ${summary.income.toFixed(2)}\n`;
        result += `Общие расходы: ${summary.expenses.toFixed(2)}\n`;
        result += `Количество счетов: ${this.accounts.length}\n`;
        
        if (this.accounts.length > 0) {
            result += '\nДетали по счетам:\n';
            this.accounts.forEach((account, index) => {
                const accountSummary = account.getSummary();
                result += `\n${index + 1}. ${account.name} (ID: ${account.id})\n`;
                result += `   Баланс: ${accountSummary.balance.toFixed(2)}\n`;
                result += `   Транзакций: ${account.transactions.length}\n`;
            });
        }
        
        return result;
    }
}