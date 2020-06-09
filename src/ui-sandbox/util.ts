export function isRootSelector(selector) {
  return typeof selector === 'string' &&
    ['html', 'head', 'body'].indexOf(selector.toLowerCase()) > -1;
}
