<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { _get, getPath } from '@felte/common';
  import { errorStores, warningStores } from './stores';

  export let level = 'error';
  let errorFor;
  export { errorFor as for };

  let errors;
  let errorPath;
  let element;

  function getFormElement() {
    return element.closest('form');
  }

  onMount(() => {
    const path = errorFor;
    errorPath = getPath(element, path);
    const formElement = getFormElement();
    if (!formElement) errors = writable({});
    else if (level === 'error') errors = errorStores[formElement.dataset.felteReporterSvelteId];
    else errors = warningStores[formElement.dataset.felteReporterSvelteId];
  });
  $: messages = errorPath && _get($errors, errorPath)
</script>

<div bind:this={element} style="display: none;" />
{#if !$$slots.placeholder || messages}
  <slot {messages}></slot>
{:else}
  <slot name="placeholder"></slot>
{/if}
