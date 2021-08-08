<script>
  import SearchResult from './SearchResult.svelte';
  import { getContext } from 'svelte';
  import { descendantsKey } from '$lib/utils/descendants';

  export let foundItems;
  export let bodyLength = 60;

  const activeDescendant = getContext(descendantsKey);
</script>

{#if foundItems.length >= 1}
<ul>
  {#each foundItems as item (item.attributes.section)}
  <SearchResult {bodyLength} {item} on:itemclick />
  {/each}
</ul>
{:else}
<h2
  class:active="{$activeDescendant === 'nothing-found-search'}"
  id="nothing-found-search"
  data-combobox-option
>
  Nothing found :(
</h2>
{/if}

<style>
  h2 {
    padding: 1rem;
  }

  ul {
    list-style: none;
    color: inherit;
  }

  .active {
    background: var(--header-background-hover);
  }
</style>
