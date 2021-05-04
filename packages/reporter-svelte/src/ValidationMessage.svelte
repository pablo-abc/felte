<script>
  import { getContext, onMount } from 'svelte';
  import { formKey } from './key';
  import { _get, isFieldSetElement } from '@felte/common';

  export let index;
  let errorFor;
  export { errorFor as for };

  const errors = getContext(formKey);
  let errorPath;
  let element;

  function getPath() {
    let path = errorFor;
    path = typeof index === 'undefined' ? path : `${path}[${index}]`;
    let parent = element.parentNode;
    if (!parent) return path;
    while (parent && parent.nodeName !== 'FORM') {
      if (isFieldSetElement(parent) && parent.name) {
        const fieldsetName = parent.name;
        path = `${fieldsetName}.${path}`;
      }
      parent = parent.parentNode;
    }
    return path;
  }
  onMount(() => (errorPath = getPath()));
  $: messages = errorPath && _get($errors, errorPath)
</script>

<div bind:this={element} style="display: none;" />
{#if errorPath && (messages || !$$slots.placeholder)}
  <slot {messages}></slot>
{:else if errorPath}
  <slot name="placeholder"></slot>
{/if}
