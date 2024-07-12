/**
 *
 * @param {Array<any>} array1
 * @param {Array<any>} array2
 * @returns
 */
export const containsOnly = (array1, array2) => {
  return array2.every((elem) => array1.includes(elem));
};
