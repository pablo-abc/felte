import { SvelteComponentTyped } from 'svelte';

export interface ValidationMessageProps {
  level?: 'error' | 'warning';
  for: string;
}

export default class ValidationMessage extends SvelteComponentTyped<
  ValidationMessageProps,
  Record<string, never>,
  {
    default: { messages: string[] | null };
    placeholder: Record<string, never>;
  }
> {}
