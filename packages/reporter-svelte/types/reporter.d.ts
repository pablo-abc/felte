import { CurrentForm, Obj, ExtenderHandler } from '@felte/common';

export function reporter<Data extends Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data>;
