<script>
  import { onMount } from 'svelte';
  import tippy from 'tippy.js';

  export let text;
  let button;
  let instance;
  let copied = false;

  function onClick() {
    navigator
      .clipboard
      .writeText(text)
      .then(() => {
        copied = true;
        instance.setContent('Copied!');
        setTimeout(() => {
          copied = false;
          instance.setContent('Copy to clipboard');
        }, 500);
      });
  }

  onMount(() => {
    instance = tippy(button, {
      content: 'Copy to clipboard',
      placement: 'left',
    });
  });
</script>

<button bind:this={button} type="button" aria-label="Copy to clipboard" on:click={onClick}>
  {#if !copied}
  <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
  {:else}
  <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
  {/if}
</button>

<style>
  button {
    position: absolute;
    font-size: 1rem;
    height: 42px;
    width: 42px;
    top: 1rem;
    right: 1rem;
    border-radius: 10px;
    padding: 6px;
    color: #FFFFF0;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  button:active {
    background: rgba(255, 255, 255, 0.5);
  }
</style>
