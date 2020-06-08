export function isUrl(url: string) {
  try {
    return /^(http(s)?:)?\/\//ig.test(url);
  } catch (error) {
    return false;
  }
}
