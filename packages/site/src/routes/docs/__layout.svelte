<script context="module">
  export async function load({ fetch, page }) {
    const framework = page.params.framework ?? 'svelte';
    const res = await fetch(`/docs/${framework}/all.json`);
    const data = await res.json();
    if (res.ok) {
      return {
        props: {
          framework,
          data,
        },
      };
    } else {
      return {
        status: res.status,
        error: data.message,
      };
    }
  }
</script>

<script>
  import DocsAside from '$lib/components/DocsAside.svelte';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let framework;
  export let data;

  const items = writable(data);

  setContext('items', items);
</script>

<div class=main-container>
  <main>
    <slot></slot>
  </main>
  <DocsAside {framework} />
</div>

<style>
  .main-container {
    margin-bottom: 4rem;
  }

  main {
    padding: 2rem 1rem;
  }

  @media (min-width: 966px) {
    .main-container {
      display: grid;
      grid-template-areas: "aside main";
      grid-template-columns: minmax(300px, 20%) 1fr;
    }

    main {
      width: min(75%, 1200px);
      grid-area: main;
      padding: 2rem;
    }
  }
</style>
