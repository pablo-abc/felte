/**
 * @ignore
 */
export function getIndex(el: HTMLElement) {
  return el.hasAttribute('data-felte-index')
    ? Number(el.dataset.felteIndex)
    : undefined;
}
