// Часть 1. Интерфейсы

export interface Identifiable {
    id: number;
}

export interface Describable {
    describe(): string;
}

// Часть 2. Универсальный класс GenericStorage<T>

export class GenericStorage<T extends Identifiable> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    removeById(id: number): boolean {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== id);
        return this.items.length < initialLength;
    }

    getById(id: number): T | undefined {
        return this.items.find(item => item.id === id);
    }

    getAll(): T[] {
        return [...this.items];
    }

    // Часть 3. Дополнительный функционал
    describeAll(): void {
        this.items.forEach(item => {
            const describableItem = item as any;
            if (describableItem.describe && typeof describableItem.describe === 'function') {
                console.log(describableItem.describe());
            } else {
                console.log(`Элемент id: ${item.id} не содержит описания.`);
            }
        });
    }
}

// Часть 4. Класс Product

export class Product implements Identifiable, Describable {
    constructor(
        public id: number,
        public name: string,
        public price: number
    ) {}

    describe(): string {
        return `Product #${this.id}: ${this.name}, price: $${this.price.toFixed(2)}`;
    }
}

// Проверка решения
export function testGenerics(): void {
    console.log('=== Тестирование GenericStorage и Product ===\n');

    // Создаем хранилище для продуктов
    const productStorage = new GenericStorage<Product>();

    // Создаем и добавляем продукты
    const product1 = new Product(1, 'Laptop', 999.99);
    const product2 = new Product(2, 'Mouse', 29.99);
    const product3 = new Product(3, 'Keyboard', 79.99);

    productStorage.add(product1);
    productStorage.add(product2);
    productStorage.add(product3);

    console.log('1. Добавлены 3 продукта:');
    productStorage.describeAll();
    console.log();

    // Тестируем другие методы
    console.log('2. Получение продукта по ID (ID: 2):');
    const foundProduct = productStorage.getById(2);
    if (foundProduct) {
        console.log(`   Найден: ${foundProduct.describe()}`);
    }
    console.log();

    console.log('3. Удаление продукта по ID (ID: 1):');
    const removed = productStorage.removeById(1);
    console.log(`   Удален продукт с ID 1: ${removed}`);
    console.log();

    console.log('4. Все продукты после удаления:');
    productStorage.describeAll();
    console.log();

    // Тестируем с объектом, который не реализует Describable
    console.log('5. Добавление объекта без метода describe():');
    
    // Создаем объект, который только реализует Identifiable
    const simpleObject = { id: 4, someProperty: 'test' } as Product;
    productStorage.add(simpleObject);
    
    console.log('6. Все элементы после добавления объекта без describe():');
    productStorage.describeAll();

    // Показываем, что другие методы все еще работают
    console.log('\n7. Проверка метода getAll():');
    const allItems = productStorage.getAll();
    console.log(`   Всего элементов: ${allItems.length}`);
    allItems.forEach(item => {
        console.log(`   - ID: ${item.id}`);
    });
}