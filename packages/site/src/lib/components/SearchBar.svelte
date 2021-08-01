<script>
  import tippy from 'tippy.js';
  import { onMount, getContext } from 'svelte';
  import SearchResults from './SearchResults.svelte';
  import Fuse from 'fuse.js';
  import 'tippy.js/themes/material.css';

  const items = getContext('items');

  let searchResult;
  let searchInput;
  let searchValue = 'library';
  let tippyInstance;

  function clear() {
    searchValue = '';
  }

  $: searchable = $items.map((item) => {
    const body = item.body.split('\n').slice(1).join('\n');
    return {
      ...item,
      body,
    };
  });

  $: fuse = new Fuse(searchable, {
    includeMatches: true,
    minMatchCharLength: 3,
    keys: ['body'],
  });

  $: foundItems = fuse.search(searchValue).slice(0, 4);

  $: {
    if (searchValue.length < 3) {
      tippyInstance?.hide();
    } else {
      tippyInstance?.show();
    }
  }

  onMount(() => {
    tippyInstance = tippy(searchInput, {
      content: searchResult,
      trigger: 'manual',
      interactive: true,
      theme: 'material',
      arrow: false,
      placement: 'bottom',
    });
  });
</script>

<form>
  <span class="search-input">
    <label class="sr-only" for="search-bar">Search documentation</label>
    <input
      bind:value="{searchValue}"
      bind:this="{searchInput}"
      id="search-bar"
      type="search"
      placeholder="Search documentation"
    />
  </span>
  <button
    type="button"
    class="clear"
    on:click="{clear}"
    class:visible="{!!searchValue}"
  >
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      ></path>
    </svg>
  </button>
  <button type="submit">
    <span class="sr-only">Search</span>
    <svg
      role="img"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      ></path>
    </svg>
  </button>
</form>

<div
  bind:this="{searchResult}"
  class="search-result"
  class:mounted="{!!tippyInstance}"
>
  <SearchResults foundItems="{foundItems}" on:itemclick="{clear}" />
</div>

<style>
  .search-result {
    visibility: hidden;
    padding: 0.5rem;
    color: white;
  }

  .search-result.mounted {
    visibility: visible;
  }

  form {
    grid-area: search;
    margin: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
    border: 1px solid #aaa;
    border-radius: 10px;
    background: var(--on-primary-color);
    height: 3rem;
    width: calc(min(75%, 1200px) - 2rem);
  }

  input {
    background: transparent;
    border: none;
    width: 100%;
  }

  button[type='submit'] {
    color: #555;
    height: 100%;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    border-radius: 0 9px 9px 0;
    transition: background 0.1s;
  }

  button.clear {
    display: none;
    height: 100%;
    padding: 0.2rem;
  }

  button.clear svg {
    height: 1rem;
    width: 1rem;
  }

  button.clear.visible {
    display: flex;
    align-items: center;
    color: #555;
  }

  button:hover {
    background: #ddd;
  }

  svg {
    height: 2rem;
    width: 2rem;
  }

  #search-bar {
    padding-left: 0.5rem;
    height: 100%;
    border-radius: 10px 0 0 10px;
  }

  .search-input {
    flex: 1;
    margin-right: 0.5rem;
    height: 100%;
    border-radius: 10px 0 0 10px;
  }
</style>
