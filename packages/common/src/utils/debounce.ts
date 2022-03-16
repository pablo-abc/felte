export function debounce<T extends unknown[]>(
  this: any,
  func: (...v: T) => any,
  timeout?: number
) {
  let timer: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
