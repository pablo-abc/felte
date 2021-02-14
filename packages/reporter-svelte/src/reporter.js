import { setContext, hasContext } from 'svelte';
import { formKey } from './key';
/**
 *
 * @param {any} currentForm
 */
export function svelteReporter(currentForm) {
  if (hasContext(formKey)) return {};
  setContext(formKey, currentForm.errors);
  return {};
}
