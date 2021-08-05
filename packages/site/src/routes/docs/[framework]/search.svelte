<script>
  import Fuse from 'fuse.js';
  import SearchResults from '$lib/components/SearchResults.svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/env';
  import { getContext } from 'svelte';

  const items = getContext('items');

  const qs = browser ? document.location.search : '';
  const query = new URLSearchParams(qs);

  $: searchValue = $page.query.get('q') ?? query.get('q');

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
    if (searchValue) {
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

      foundItems = fuse.search(searchValue);
    }
  }
</script>

{#if searchValue}
<SearchResults {foundItems} bodyLength="{200}" />
{:else}
<p>Go on, search something!</p>
{/if}
