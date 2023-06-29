import { SvelteComponent } from 'svelte';

export interface ValidationMessageProps {
  level?: 'error' | 'warning';
  for: string;
}

export default class ValidationMessage extends SvelteComponent<
  ValidationMessageProps,
  Record<string, null>,
  {
    default: { messages: string[] | null };
    placeholder: Record<string, never>;
  }
> {}
