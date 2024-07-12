export const dateDiff = (a, b) => {
  const date1 = new Date(a);
  const date2 = new Date(b);
  const diffTime = Math.abs(date2 - date1);
  return diffTime;
};
