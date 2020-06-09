export function isUrl(url: string) {
  try {
    return /^(http(s)?:)?\/\//ig.test(url);
  } catch (error) {
    return false;
  }
}

export function isFunction(o: any) {
  return typeof o === 'function';
}
