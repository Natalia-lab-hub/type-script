// 2. Интерфейс ITransaction
export interface ITransaction {
  id: number;
  amount: number;
  type: TransactionType;
  date: string; // ISO format
  description: string;
}