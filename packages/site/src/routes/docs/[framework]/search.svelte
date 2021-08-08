<script>
  import SearchResults from '$lib/components/SearchResults.svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/env';
  import { getContext } from 'svelte';
  import FlexSearch from 'flexsearch';

  const items = getContext('items');

  const qs = browser ? document.location.search : '';
  const query = new URLSearchParams(qs);

  $: searchValue = ($page && $page.query.get('q')) ?? query.get('q');

  $: searchable = $items.map((item, index) => {
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
      id: index,
      body,
    };
  });

  let foundItems = [];
  let doc;

  $: {
    if (searchable && searchable.length > 0) {
      doc = new FlexSearch.Document({
        tokenize: 'forward',
        document: {
          index: ['attributes:section', 'body'],
        },
      });
      searchable.forEach((item) => {
        doc.add(item);
      });
    }
  }

  $: {
    const found = searchValue ? doc.search(searchValue) : [];
    if (found.length > 0) {
      const foundSet = new Set();
      for (const f of found) {
        f.result.forEach((r) => foundSet.add(r));
      }
      foundItems = Array.from(foundSet).map((f) => {
        return searchable[f];
      });
    } else foundItems = [];
  }
</script>

{#if searchValue}
<h2>Search for: <em>{searchValue}</em></h2>
<SearchResults {foundItems} bodyLength="{200}" />
{:else}
<p>Go on, search something!</p>
{/if}
