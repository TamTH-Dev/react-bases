export const VIRTUAL_SCROLL_DATA = (() =>
  [...new Array(100)].map((_, index) => ({
    id: index,
    col1: Math.random(),
    col2: Math.random(),
    col3: Math.random(),
    col4: Math.random(),
    col5: Math.random(),
  })))()
