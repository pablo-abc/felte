<script>
  import FlexSearch from 'flexsearch';

  export let items = [];
  export let framework;

  const qs = document.location.search;
  const query = new URLSearchParams(qs);

  $: searchValue = query.get('q');

  $: searchable = items.map((item, index) => {
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
  let searchResults;

  $: searchResults && (searchResults.foundItems = foundItems);

  $: searchResults && (searchResults.bodyLength = 200);
</script>

{#if searchValue}
<h2>Search for: <em>{searchValue}</em></h2>
<search-results bind:this={searchResults} {framework}></search-results>
{:else}
<p>Go on, search something!</p>
{/if}

<style>
  h2 {
    margin-top: 2rem;
  }
</style>
