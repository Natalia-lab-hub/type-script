import { Account, Transaction, AccountManager } from './classes';
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

export class ApplicationController {
    public accountManager: AccountManager;
    private rl: readline.Interface;

    constructor() {
        this.accountManager = new AccountManager();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    // Метод start - главное меню приложения
    async start(): Promise<void> {
        console.clear();
        console.log('=== БЮДЖЕТНЫЙ ТРЕКЕР ===\n');
        
        await this.showMainMenu();
    }

    private async showMainMenu(): Promise<void> {
        console.log('\n=== ГЛАВНОЕ МЕНЮ ===');
        console.log('Список всех счетов:\n');
        
        const accounts = this.accountManager.getAllAccounts();
        
        if (accounts.length === 0) {
            console.log('Счетов нет. Создайте первый счет.\n');
        } else {
            accounts.forEach((account, index) => {
                console.log(`${index + 1}. ${account.getSummaryString()}`);
            });
            console.log();
        }

        console.log('Доступные действия:');
        console.log('1. Выбрать счет для просмотра');
        console.log('2. Создать новый счет');
        console.log('3. Выход из приложения');
        
        const choice = await this.askQuestion('Выберите действие (1-3): ');
        
        switch (choice) {
            case '1':
                if (accounts.length === 0) {
                    console.log('Нет доступных счетов. Создайте счет сначала.');
                    await this.showMainMenu();
                } else {
                    await this.selectAccount();
                }
                break;
            case '2':
                await this.createAccount();
                break;
            case '3':
                console.log('Выход из приложения. До свидания!');
                this.rl.close();
                process.exit(0);
                break;
            default:
                console.log('Неверный выбор. Попробуйте снова.');
                await this.showMainMenu();
        }
    }

    // Создание нового счета
    async createAccount(): Promise<void> {
        console.clear();
        console.log('=== СОЗДАНИЕ НОВОГО СЧЕТА ===\n');
        
        const accountName = await this.askQuestion('Введите название счета: ');
        
        if (!accountName.trim()) {
            console.log('Название счета не может быть пустым.');
            await this.createAccount();
            return;
        }

        // Генерируем уникальный ID
        const accounts = this.accountManager.getAllAccounts();
        const maxId = accounts.length > 0 
            ? Math.max(...accounts.map(a => a.id)) 
            : 0;
        
        const newAccount = new Account(maxId + 1, accountName.trim());
        this.accountManager.addAccount(newAccount);
        
        console.log(`\nСчет "${accountName}" успешно создан! (ID: ${newAccount.id})`);
        
        await this.pressAnyKey();
        await this.showMainMenu();
    }

    // Просмотр выбранного счета
    async watchAccount(accountId?: number): Promise<void> {
        if (accountId === undefined) {
            await this.selectAccount();
            return;
        }

        const account = this.accountManager.getAccountById(accountId);
        if (!account) {
            console.log('Счет не найден.');
            await this.showMainMenu();
            return;
        }

        await this.showAccountMenu(account);
    }

    private async showAccountMenu(account: Account): Promise<void> {
        console.clear();
        console.log(account.toString());
        
        console.log('\n=== МЕНЮ СЧЕТА ===');
        console.log('1. Добавить транзакцию');
        console.log('2. Удалить транзакцию');
        console.log('3. Экспортировать транзакции в CSV');
        console.log('4. Удалить счет');
        console.log('5. Вернуться к списку счетов');
        
        const choice = await this.askQuestion('Выберите действие (1-5): ');
        
        switch (choice) {
            case '1':
                await this.addTransaction(account);
                break;
            case '2':
                await this.removeTransaction(account);
                break;
            case '3':
                await this.exportTransactionsToCSV(account);
                break;
            case '4':
                await this.removeAccount(account);
                break;
            case '5':
                await this.showMainMenu();
                break;
            default:
                console.log('Неверный выбор. Попробуйте снова.');
                await this.showAccountMenu(account);
        }
    }

    // Выбор счета из списка
    private async selectAccount(): Promise<void> {
        const accounts = this.accountManager.getAllAccounts();
        
        console.log('\n=== ВЫБОР СЧЕТА ===');
        accounts.forEach((account, index) => {
            console.log(`${index + 1}. ${account.name} (ID: ${account.id})`);
        });
        
        const choice = await this.askQuestion(`Выберите счет (1-${accounts.length}): `);
        const index = parseInt(choice) - 1;
        
        if (index >= 0 && index < accounts.length) {
            await this.showAccountMenu(accounts[index]);
        } else {
            console.log('Неверный выбор.');
            await this.showMainMenu();
        }
    }

    // Добавление транзакции
    async addTransaction(account: Account): Promise<void> {
        console.clear();
        console.log('=== ДОБАВЛЕНИЕ ТРАНЗАКЦИИ ===\n');
        console.log(`Счет: ${account.name}\n`);
        
        try {
            // Запрашиваем сумму
            const amountStr = await this.askQuestion('Введите сумму (больше 0): ');
            const amount = parseFloat(amountStr);
            
            if (isNaN(amount) || amount <= 0) {
                console.log('Неверная сумма. Должно быть число больше 0.');
                await this.pressAnyKey();
                await this.showAccountMenu(account);
                return;
            }
            
            // Запрашиваем тип
            console.log('\nТип транзакции:');
            console.log('1. Доход (income)');
            console.log('2. Расход (expense)');
            
            const typeChoice = await this.askQuestion('Выберите тип (1-2): ');
            let type: 'income' | 'expense';
            
            if (typeChoice === '1') {
                type = 'income';
            } else if (typeChoice === '2') {
                type = 'expense';
            } else {
                console.log('Неверный выбор типа.');
                await this.pressAnyKey();
                await this.showAccountMenu(account);
                return;
            }
            
            // Запрашиваем дату
            const dateStr = await this.askQuestion('Введите дату (YYYY-MM-DD) [по умолчанию сегодня]: ');
            let date: string;
            
            if (dateStr.trim()) {
                // Проверяем формат даты
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(dateStr)) {
                    console.log('Неверный формат даты. Используйте YYYY-MM-DD.');
                    await this.pressAnyKey();
                    await this.showAccountMenu(account);
                    return;
                }
                date = new Date(dateStr + 'T00:00:00Z').toISOString();
            } else {
                date = new Date().toISOString();
            }
            
            // Запрашиваем описание
            const description = await this.askQuestion('Введите описание: ');
            
            if (!description.trim()) {
                console.log('Описание не может быть пустым.');
                await this.pressAnyKey();
                await this.showAccountMenu(account);
                return;
            }
            
            // Генерируем уникальный ID для транзакции
            const transactions = account.transactions;
            const maxId = transactions.length > 0 
                ? Math.max(...transactions.map(t => t.id)) 
                : 0;
            
            // Создаем и добавляем транзакцию
            const newTransaction = new Transaction(
                maxId + 1,
                amount,
                type,
                date,
                description.trim()
            );
            
            account.addTransaction(newTransaction);
            
            console.log(`\nТранзакция успешно добавлена!`);
            console.log(`ID: ${newTransaction.id}, Тип: ${type}, Сумма: ${amount}`);
            
        } catch (error) {
            console.log('Ошибка при добавлении транзакции:', error);
        }
        
        await this.pressAnyKey();
        await this.showAccountMenu(account);
    }

    // Удаление транзакции
    async removeTransaction(account: Account): Promise<void> {
        console.clear();
        console.log('=== УДАЛЕНИЕ ТРАНЗАКЦИИ ===\n');
        console.log(`Счет: ${account.name}\n`);
        
        const transactions = account.transactions;
        
        if (transactions.length === 0) {
            console.log('На этом счету нет транзакций.');
            await this.pressAnyKey();
            await this.showAccountMenu(account);
            return;
        }
        
        console.log('Список транзакций:');
        transactions.forEach((transaction, index) => {
            console.log(`${index + 1}. ${transaction.toString()}`);
        });
        
        const choiceStr = await this.askQuestion(`\nВыберите транзакцию для удаления (1-${transactions.length}): `);
        const index = parseInt(choiceStr) - 1;
        
        if (index >= 0 && index < transactions.length) {
            const transactionToRemove = transactions[index];
            
            console.log(`\nВы выбрали: ${transactionToRemove.toString()}`);
            const confirm = await this.askQuestion('Вы уверены, что хотите удалить эту транзакцию? (да/нет): ');
            
            if (confirm.toLowerCase() === 'да' || confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
                // Удаляем транзакцию по ID
                account.transactions = transactions.filter(t => t.id !== transactionToRemove.id);
                console.log('Транзакция успешно удалена!');
            } else {
                console.log('Удаление отменено.');
            }
        } else {
            console.log('Неверный выбор.');
        }
        
        await this.pressAnyKey();
        await this.showAccountMenu(account);
    }

    // Экспорт транзакций в CSV
    async exportTransactionsToCSV(account: Account): Promise<void> {
        console.clear();
        console.log('=== ЭКСПОРТ ТРАНЗАКЦИЙ В CSV ===\n');
        console.log(`Счет: ${account.name}\n`);
        
        const transactions = account.transactions;
        
        if (transactions.length === 0) {
            console.log('На этом счету нет транзакций для экспорта.');
            await this.pressAnyKey();
            await this.showAccountMenu(account);
            return;
        }
        
        const fileName = await this.askQuestion('Введите имя файла (без расширения): ');
        
        if (!fileName.trim()) {
            console.log('Имя файла не может быть пустым.');
            await this.pressAnyKey();
            await this.showAccountMenu(account);
            return;
        }
        
        const fullFileName = fileName.trim() + '.csv';
        const filePath = path.join(process.cwd(), fullFileName);
        
        try {
            // Создаем CSV содержимое
            let csvContent = 'ID,Дата,Тип,Сумма,Описание\n';
            
            transactions.forEach(transaction => {
                const formattedDate = new Date(transaction.date).toLocaleDateString();
                const typeRu = transaction.type === 'income' ? 'Доход' : 'Расход';
                
                csvContent += `${transaction.id},"${formattedDate}",${typeRu},${transaction.amount},"${transaction.description}"\n`;
            });
            
            // Записываем файл
            fs.writeFileSync(filePath, csvContent, 'utf-8');
            
            console.log(`\nЭкспорт успешно завершен!`);
            console.log(`Файл сохранен: ${filePath}`);
            console.log(`Экспортировано транзакций: ${transactions.length}`);
            
        } catch (error) {
            console.log('Ошибка при экспорте в CSV:', error);
        }
        
        await this.pressAnyKey();
        await this.showAccountMenu(account);
    }

    // Удаление счета
    async removeAccount(account: Account): Promise<void> {
        console.clear();
        console.log('=== УДАЛЕНИЕ СЧЕТА ===\n');
        console.log(`Вы собираетесь удалить счет: ${account.name}`);
        console.log(`ID: ${account.id}, Баланс: ${account.balance.toFixed(2)}`);
        console.log(`Транзакций: ${account.transactions.length}\n`);
        
        const confirm = await this.askQuestion('Вы уверены, что хотите удалить этот счет? (да/нет): ');
        
        if (confirm.toLowerCase() === 'да' || confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            const removed = this.accountManager.removeAccountById(account.id);
            
            if (removed) {
                console.log('\nСчет успешно удален!');
            } else {
                console.log('\nНе удалось удалить счет.');
            }
        } else {
            console.log('\nУдаление отменено.');
        }
        
        await this.pressAnyKey();
        await this.showMainMenu();
    }

    // Вспомогательные методы
    private askQuestion(question: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    private async pressAnyKey(): Promise<void> {
        console.log('\nНажмите Enter для продолжения...');
        await this.askQuestion('');
    }
}

// Функция для начального заполнения данными (как в примере)
export function setInitialState(controller: ApplicationController): void {
    const personalAccount = new Account(1, 'Личный бюджет');
    personalAccount.addTransaction(new Transaction(1, 1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата'));
    personalAccount.addTransaction(new Transaction(2, 200, 'expense', '2023-01-05T00:00:00Z', 'Продукты'));
    personalAccount.addTransaction(new Transaction(3, 150, 'expense', '2023-01-09T00:00:00Z', 'Коммунальные услуги'));
    controller.accountManager.addAccount(personalAccount);

    const vacationAccount = new Account(2, 'Копилка на отпуск');
    vacationAccount.addTransaction(new Transaction(1, 500, 'income', '2023-04-01T00:00:00Z', 'Премия'));
    vacationAccount.addTransaction(new Transaction(2, 600, 'income', '2023-01-01T00:00:00Z', 'Возврат долга'));
    vacationAccount.addTransaction(new Transaction(3, 300, 'expense', '2023-01-05T00:00:00Z', 'Билеты на самолёт'));
    vacationAccount.addTransaction(new Transaction(4, 200, 'expense', '2023-01-09T00:00:00Z', 'Номер в отеле'));
    controller.accountManager.addAccount(vacationAccount);
}