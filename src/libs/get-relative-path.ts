export const getRelativePathFromUrl = (url: string) => {
  const parsedUrl = new URL(url);
  return parsedUrl.pathname.slice(1);
};
