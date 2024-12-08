export const compactObject = (obj: object) => {
  const compacted = Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined),
  );
  return compacted;
};
