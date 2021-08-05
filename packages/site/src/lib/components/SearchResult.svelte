<script>
  import { createEventDispatcher } from 'svelte';
  import { session } from '$app/stores';

  export let item;

  $: bodyMatch = item.matches.find((match) => match.key === 'body');

  $: matchIndex = bodyMatch && bodyMatch.indices[0];

  $: bodyValue = bodyMatch && bodyMatch.value

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
    <div>
      <h2>{item.item.attributes.section}</h2>
      {#if bodyValue}
        <div class="content">
          ...{bodyValue.substr(startIndex, endIndex)}...
        </div>
      {/if}
    </div>
  </a>
</li>

<style>
  a {
    display: block;
    color: #ffffff;
    padding: 0.5rem;
    border-radius: 10px 10px 0 0;
  }

  a:hover {
    background: hsl(204, 3%, 42%);
  }

  li {
    border-bottom: 2px solid var(--primary-color);
    margin-bottom: 1rem;
  }

  .content {
    margin-left: 0.5rem;
    font-weight: 300;
  }
</style>
