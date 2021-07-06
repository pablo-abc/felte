/// <reference types="svelte" />
import { SvelteComponentTyped } from 'svelte';

export interface ValidationMessageProps {
  index?: string | number;
  for: string;
}

export default class ValidationMessage extends SvelteComponentTyped<
  ValidationMessageProps,
  {},
  { default: { messages: string | string[] | undefined }; placeholder: {} }
> {}
