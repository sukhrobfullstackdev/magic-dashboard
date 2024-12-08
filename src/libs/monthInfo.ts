export const getMonthDateDisplayString = (d: Date) => {
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
};
