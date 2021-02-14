import { setContext } from 'svelte';
import { formKey } from './key';
/**
 *
 * @param {any} currentForm
 */
export function svelteReporter(currentForm) {
  setContext(formKey, currentForm.errors);
  return {};
}
