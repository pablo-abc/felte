/** @ignore */
export function _isPlainObject(value: unknown): boolean {
  return Object.prototype.toString.call(value) === '[object Object]';
}
