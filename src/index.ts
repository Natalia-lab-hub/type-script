import { Transaction, Account, AccountManager } from './classes';

// Создаем транзакции
const salary = new Transaction(1, 50000, 'income', '2024-01-15', 'Зарплата за январь');
const rent = new Transaction(2, 25000, 'expense', '2024-01-16', 'Аренда квартиры');
const groceries = new Transaction(3, 5000, 'expense', '2024-01-17', 'Продукты');
const freelance = new Transaction(4, 20000, 'income', '2024-01-18', 'Фриланс проект');

// Создаем счета
const mainAccount = new Account(1, 'Основной счет');
const savingsAccount = new Account(2, 'Накопительный счет');

// Добавляем транзакции на основной счет
mainAccount.addTransaction(salary);
mainAccount.addTransaction(rent);
mainAccount.addTransaction(groceries);

// Добавляем транзакции на накопительный счет
savingsAccount.addTransaction(freelance);

// Создаем менеджер счетов
const accountManager = new AccountManager();

// Добавляем счета в менеджер
accountManager.addAccount(mainAccount);
accountManager.addAccount(savingsAccount);

// Тестируем методы
console.log('=== Тестирование класса Transaction ===');
console.log(salary.toString());
console.log(rent.toString());

console.log('\n=== Тестирование класса Account ===');
console.log(mainAccount.getSummaryString());
console.log('\nДетальная информация о счете:');
console.log(mainAccount.toString());

console.log('\n=== Тестирование класса AccountManager ===');
console.log(accountManager.getSummaryString());
console.log('\nДетальная информация о бюджете:');
console.log(accountManager.toString());

// Тестируем поиск счета
console.log('\n=== Поиск счета по ID ===');
const foundAccount = accountManager.getAccountById(1);
if (foundAccount) {
    console.log(`Найден счет: ${foundAccount.name}`);
}

// Тестируем удаление счета
console.log('\n=== Удаление счета ===');
const removed = accountManager.removeAccountById(2);
console.log(`Счет удален: ${removed}`);
console.log(`Осталось счетов: ${accountManager.getAllAccounts().length}`);

// Проверяем итоговый баланс
console.log('\n=== Итоговый баланс ===');
console.log(accountManager.getSummaryString());
