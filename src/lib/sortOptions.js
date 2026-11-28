// Dropdown option lists are always shown A → Z, case-insensitive and with numbers
// compared as numbers ("Item 2" before "Item 10"). Returns a new array.
export const sortAlpha = (list, getKey = (x) => x) =>
  [...(Array.isArray(list) ? list : [])].sort((a, b) =>
    String(getKey(a) ?? '').localeCompare(String(getKey(b) ?? ''), undefined, {
      sensitivity: 'base',
      numeric: true,
    })
  );
