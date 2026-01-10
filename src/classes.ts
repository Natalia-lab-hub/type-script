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