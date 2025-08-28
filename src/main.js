import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";


// @todo: подключение


// Исходные данные используемые в render()
const api = initData(sourceData);
const {data, ...indexes} = api;

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    const rowsPerPage = parseInt(state.rowsPerPage);    // приведём количество страниц к числу
    const page = parseInt(state.page ?? 1);                // номер страницы по умолчанию 1 и тоже число

    return {                                            // расширьте существующий return вот так
        ...state,
        rowsPerPage,
        page
    }; 
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query = {}; // заменяем копирование данных на объект запроса
    
    // @todo: использование
    /*
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);
    */ 
    query = applySearching(query, state, action); // result заменяем на query
    query = applyFiltering(query, state, action); // result заменяем на query
    query = applySorting(query, state, action); // result заменяем на query
    query = applyPagination(query, state, action); // обновляем query
    
    
    
    const { total, items } = await api.getRecords(query);
    
    updatePagination(total, query); // перерисовываем пагинатор
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация



const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
); 

const applySorting = initSorting([        // Нам нужно передать сюда массив элементов, которые вызывают сортировку, чтобы изменять их визуальное представление
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
    
]);


const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements, {    // передаём элементы фильтра
    searchBySeller: indexes.sellers                                    // для элемента с именем searchBySeller устанавливаем массив продавцов
});


const applySearching = initSearching(sampleTable.search.elements.searchField);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

async function init() {
    const indexes = await api.getIndexes();

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

init().then(render);




const tasks = [
  { data: 'A', delay: 1000 },
  { data: 'B', delay: 500 },
  { data: 'C', delay: 1500 },
  { data: 'D', delay: 200 }
];

function fetchWithDelay(data, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.9) resolve({ data, status: 'ok' });
      else reject({ data, error: 'Failed' });
    }, delay);
  });
}

async function runParallel(tasks, maxConcurrent) {
  const results = [];
  const executing = [];
  let index = 0;

  for (const task of tasks) {
    const currentIndex = index++;
    const promise = fetchWithDelay(task.data, task.delay)
      .then(result => {
        results[currentIndex] = result;
      })
      .catch(error => {
        results[currentIndex] = error;
        throw error; // Прерываем цепочку при ошибке
      });

    executing.push(promise);
    promise.finally(() => executing.splice(executing.indexOf(promise), 1));

    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

runParallel(tasks, 2)
  .then(console.log)  // При успехе: [{data: 'A', status: 'ok'}, ...]
  .catch(console.error);  // При ошибке: {data: 'X', error: 'Failed'}