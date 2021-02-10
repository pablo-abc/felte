import tippy from 'tippy.js';
import type { FormControl } from './types';

export type CurrentForm = {
  form: HTMLFormElement;
  controls: FormControl[];
};

export function tippyReporter(currentForm: CurrentForm): void {
  console.log(tippy(currentForm.form));
  return;
}
