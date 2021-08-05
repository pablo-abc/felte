<script>
  import tippy from 'tippy.js';
  import { onMount, getContext, onDestroy } from 'svelte';
  import { session } from '$app/stores';
  import SearchResults from './SearchResults.svelte';
  import Fuse from 'fuse.js';

  const items = getContext('items');

  let searchResult;
  let searchInput;
  let searchValue = '';
  let tippyInstance;

  function clear() {
    searchValue = '';
  }

  $: searchable = $items.map((item) => {
    const body = item.body
      .split('\n')
      .slice(1)
      .join('\n')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/```.*/g, '')
      .replace(/> /g, '')
      .replace(/#+ /g, '')
      .replace(/__?([^_]+)__?/g, '$1')
      .replace(/\*\*?([^\*]+)\*\*?/g, '$1');
    return {
      ...item,
      body,
    };
  });

  let fuse;
  let foundItems = [];

  $: {
    fuse = new Fuse(searchable, {
      includeMatches: true,
      ignoreFieldNorm: true,
      minMatchCharLength: searchValue.replace(/ /g, '').length,
      ignoreLocation: true,
      keys: [
        {
          name: 'body',
          weight: 1,
        },
        {
          name: 'attributes.section',
          weight: 3,
        },
        {
          name: 'attributes.subsections',
          weight: 2,
        },
      ],
    });

    foundItems = fuse.search(searchValue, { limit: 4 });
  }

  $: {
    if (searchValue.length < 3) {
      tippyInstance?.hide();
    } else {
      tippyInstance?.show();
    }
  }

  function handleKeyDown(event) {
    if (event.key !== '/') return;
    event.preventDefault();
    searchInput.focus();
  }

  function handleSubmit(event) {
    if (searchValue.length !== 0) return;
    event.preventDefault();
  }

  onMount(() => {
    tippyInstance = tippy(searchInput, {
      content: searchResult,
      trigger: 'manual',
      interactive: true,
      arrow: false,
      placement: 'bottom',
    });

    document.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    if (typeof document === 'undefined') return;
    document.removeEventListener('keydown', handleKeyDown);
  });
</script>

<form action="/docs/{$session.framework}/search" on:submit="{handleSubmit}">
  <span class="search-input">
    <label class="sr-only" for="search-bar"> Search documentation </label>
    <input
      name="q"
      autocomplete="off"
      bind:value="{searchValue}"
      bind:this="{searchInput}"
      on:focus="{() => searchValue.length >= 3 && tippyInstance?.show()}"
      id="search-bar"
      type="search"
      placeholder="Search docs"
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
  <button type="submit" aria-disabled="{searchValue.length === 0}">
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
  }

  .search-result.mounted {
    visibility: visible;
  }

  form {
    grid-area: search;
    margin: 2rem;
    margin-left: auto;
    margin-bottom: 0;
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

  @media only screen and (min-width: 966px) {
    form {
      margin-left: 2rem;
    }
  }

  form :global(.tippy-box) {
    background: var(--header-background-hover);
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
    cursor: pointer;
  }

  button[type='submit'][aria-disabled='true'] {
    cursor: not-allowed;
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
    height: 100%;
    border-radius: 10px 0 0 10px;
  }

  input::-webkit-search-cancel-button {
    -webkit-appearance: none;
    display: none;
  }
</style>
