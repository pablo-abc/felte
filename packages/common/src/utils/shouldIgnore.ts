/**
 * @category Helper
 */
export function shouldIgnore(el: HTMLElement): boolean {
  let parent: HTMLElement | null = el;
  while (parent && parent.nodeName !== 'FORM') {
    if (parent.hasAttribute('data-felte-ignore')) return true;
    parent = parent.parentElement;
  }
  return false;
}
