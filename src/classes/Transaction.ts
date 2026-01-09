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