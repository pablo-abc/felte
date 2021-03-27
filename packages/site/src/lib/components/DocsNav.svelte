<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { browser } from '$app/env';
  export let items;

  const dispatch = createEventDispatcher();

  function clickHandler(event) {
    if (event.target.nodeName !== 'A') return;
    dispatch('close');
  }

  function escHandler(event) {
    if (event.key !== 'Escape') return;
    dispatch('close');
  }

  onMount(() => {
    browser && document.addEventListener('keyup', escHandler);
  });

  onDestroy(() => {
    browser && document.removeEventListener('keyup', escHandler);
  });
</script>

<nav on:click={clickHandler}>
  <ul class=sections>
    {#each items as item (item.id)}
      <li>
        <a href={`docs#${item.id}`}>
          {item.section}
        </a>
      </li>
      {#if item.subsections}
        <ul class=subsections>
          {#each item.subsections as subsection (subsection.id)}
            <li>
              <a href={`docs#${subsection.id}`}>
                {subsection.name}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    {/each}
  </ul>
</nav>

<style>
  .sections {
    padding: 0;
    font-size: 1.2rem;
  }
  @media (min-width: 966px) {
    .sections {
      padding: 1rem 0;
    }
  }

  .sections, .subsections {
    list-style-type: none;
  }

  .subsections a {
    padding-left: 3rem;
  }

  a {
    display: inline-block;
    padding: 0.4rem 0;
    padding-left: 1.5rem;
    width: 100%;
    height: 100%;
  }

  a:hover {
    background: var(--header-background-hover);
  }
</style>
