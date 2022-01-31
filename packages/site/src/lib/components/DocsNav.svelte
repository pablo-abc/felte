<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { browser } from '$app/env';
  import { page } from '$app/stores';
  export let items = [];
  export let framework;

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

<ul class=sections on:click={clickHandler}>
  {#each items as item (item.id)}
    <li>
      <a
        href={`/docs/${framework}/${item.id}`}
        aria-current="{$page.url.pathname === `/docs/${framework}/${item.id}`}"
        sveltekit:prefetch
        >
        {item.section}
      </a>
      {#if item.subsections}
        <ul class=subsections>
          {#each item.subsections as subsection (subsection.id)}
            <li>
              <a
                sveltekit:prefetch
                href={`/docs/${framework}/${item.id}#${subsection.id}`}
                aria-label="{item.section} - {subsection.name}"
                >
                {subsection.name}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </li>
  {/each}
</ul>

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
    transition: background 0.1s;
  }

  a:hover {
    color: var(--primary-font-color);
    background: var(--header-background-hover);
  }

  a[aria-current=true] {
    text-decoration: underline solid var(--primary-color);
    -webkit-text-decoration: underline solid var(--primary-color);
  }
</style>
