<script>
  import { onMount } from 'svelte';
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
    setTimeout(() => {
      const path = errorFor;
      errorPath = getPath(element, path);
      const formElement = getFormElement();
      if (level === 'error') errors = errorStores[formElement.dataset.felteReporterSvelteId];
      else errors = warningStores[formElement.dataset.felteReporterSvelteId];
    })
  });
  $: messages = errorPath && _get($errors, errorPath)
</script>

<div bind:this={element} style="display: none;"></div>
{#if !$$slots.placeholder || messages}
  <slot {messages}></slot>
{:else}
  <slot name="placeholder"></slot>
{/if}
