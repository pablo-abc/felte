export function debounce<T extends unknown[]>(
  this: any,
  func: (...v: T) => any,
  timeout?: number,
  { onInit, onEnd }: { onInit?: () => void; onEnd?: () => void } = {}
) {
  let timer: NodeJS.Timeout | undefined;
  return (...args: T) => {
    if (!timer) onInit?.();
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
      timer = undefined;
      onEnd?.();
    }, timeout);
  };
}
