<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { descendantsKey } from '$lib/utils/descendants';
  import { session } from '$app/stores';

  export let item;
  export let bodyLength = 60;

  const activeDescendant = getContext(descendantsKey);

  $: id = `result-${item.attributes.section}`;

  const dispatch = createEventDispatcher();

  function onItemClick(e) {
    dispatch('itemclick', { target: e.target });
  }
</script>

<li {id} data-combobox-option class:active="{$activeDescendant === id}">
  <a
    href="/docs/{$session.framework}/{item.attributes.id}"
    on:click="{onItemClick}"
  >
    <div>
      <strong>{item.attributes.section}</strong>
      <div class="content">{item.body.substr(0, bodyLength)}...</div>
    </div>
  </a>
</li>

<style>
  strong {
    font-size: 1.2rem;
    font-weight: 700;
  }

  a {
    display: block;
    padding: 0.5rem;
    border-radius: 10px;
  }

  li {
    margin-bottom: 1rem;
  }

  .content {
    margin-left: 0.5rem;
    font-weight: 300;
  }

  .active {
    background: var(--header-background-hover);
  }
</style>
