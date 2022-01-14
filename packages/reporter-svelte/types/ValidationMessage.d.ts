import { SvelteComponentTyped } from 'svelte';

export interface ValidationMessageProps {
  index?: string | number;
  level?: 'error' | 'warning';
  for: string;
}

export default class ValidationMessage extends SvelteComponentTyped<
  ValidationMessageProps,
  Record<string, never>,
  {
    default: { messages: string | string[] | undefined };
    placeholder: Record<string, never>;
  }
> {}
