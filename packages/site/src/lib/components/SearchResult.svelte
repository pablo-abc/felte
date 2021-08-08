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
      <h2>{item.attributes.section}</h2>
      <div class="content">{item.body.substr(0, bodyLength)}...</div>
    </div>
  </a>
</li>

<style>
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
