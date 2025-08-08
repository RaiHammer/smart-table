import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes)                                    // Получаем ключи из объекта
      .forEach((elementName) => {                        // Перебираем по именам
        elements[elementName].append(                    // в каждый элемент добавляем опции
            ...Object.values(indexes[elementName])        // формируем массив имён, значений опций
                      .map(name => {                        // используйте name как значение и текстовое содержимое
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        return option;                               // @todo: создать и вернуть тег опции
                      })
        )
     })

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action?.name === 'clear') {
            const button = action.target;
            const fieldName = button.dataset.field;
            const parent = button.closest('.filter-group'); // или другой подходящий селектор
            const input = parent?.querySelector('input, select');
            
            if (input) {
                input.value = '';
                state[fieldName] = '';
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        const compare = createComparison(defaultRules);
        return data.filter(row => compare(row, state));
    }
}