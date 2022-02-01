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
    <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
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
