<script>
  import SearchResult from './SearchResult.svelte';

  export let foundItems;
  export let bodyLength = 60;
</script>

{#if foundItems.length >= 1}
<ul>
  {#each foundItems as item (item.attributes.section)}
  <SearchResult {bodyLength} {item} on:itemclick />
  {/each}
</ul>
{:else}
<h2>Nothing found :(</h2>
{/if}

<style>
  ul {
    list-style: none;
    color: inherit;
  }
</style>
