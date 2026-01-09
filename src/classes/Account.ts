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
