<script>
  import { createEventDispatcher } from 'svelte';
  import SvelteMarkdown from 'svelte-markdown';
  import { session } from '$app/stores';

  export let item;

  $: bodyMatch = item.matches.find((match) => match.key === 'body');

  $: matchIndex = bodyMatch && bodyMatch.indices[0];

  $: bodyValue = bodyMatch && bodyMatch.value;

  $: startIndex = matchIndex && matchIndex[0] >= 20 ? matchIndex[0] - 20 : 0;

  $: endIndex = 60;

  const dispatch = createEventDispatcher();

  function onItemClick(e) {
    dispatch('itemclick', { target: e.target });
  }
</script>

<li>
  <a
    href="/docs/{$session.framework}/{item.item.attributes.id}"
    on:click="{onItemClick}"
  >
    <h2>{item.item.attributes.section}</h2>
    {#if bodyMatch}
     <SvelteMarkdown source={`...${bodyValue.slice(startIndex, endIndex)}...`} />
    {/if}
  </a>
</li>

<style>
  li {
    border-bottom: 2px solid var(--primary-color);
    margin-bottom: 1rem;
  }
</style>
