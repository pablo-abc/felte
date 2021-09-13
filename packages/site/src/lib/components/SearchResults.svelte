<script>
  import SearchResult from './SearchResult.svelte';
  import { getContext } from 'svelte';
  import { descendantsKey } from '$lib/utils/descendants';

  export let foundItems;
  export let isListbox = false;
  export let bodyLength = 60;
  export let id = undefined;

  const activeDescendant = getContext(descendantsKey);
</script>

<ul
  {id}
  role="{isListbox ? 'listbox' : undefined}"
  on:mouseleave="{() => $activeDescendant = undefined}"
  >
  {#if foundItems.length >= 1}
    {#each foundItems as item (item.attributes.section)}
      <SearchResult
        role={isListbox ? 'option' : undefined}
        {bodyLength}
        {item}
        on:itemclick
        />
    {/each}
  {:else}
    <li
      class:active="{$activeDescendant === 'nothing-found-search'}"
      id="nothing-found-search"
      data-combobox-option
      on:mouseenter="{() => ($activeDescendant = 'nothing-found-search')}"
      role="{isListbox ? 'option' : undefined}"
      aria-selected="{isListbox ? $activeDescendant === 'nothing-found-search' : undefined}"
      >
      <strong>Nothing found :(</strong>
    </li>
  {/if}
</ul>

<style>
  ul {
    list-style: none;
    color: inherit;
  }

  strong {
    font-size: 1.2rem;
    padding: 1rem;
  }

  .active {
    background: var(--header-background-hover);
  }
</style>
