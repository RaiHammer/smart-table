import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // @todo: #5.1 — настроить компаратор
    const comparator = createComparison(
        [rules.skipEmptyTargetValues],  // Skip items where search fields are empty
        rules.searchMultipleFields (searchField, ['date', 'customer', 'seller'], false)  // Search in these fields
    );

    return (data, state, action) => {
        // Apply search only if there's a search term
        if (state.search) {
            return data.filter(item => comparator(state, item));
        }
        return data;
    };
}