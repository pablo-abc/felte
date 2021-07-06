import { CurrentForm, Obj, ExtenderHandler } from '@felte/common';

export function svelteReporter<Data extends Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data>;
