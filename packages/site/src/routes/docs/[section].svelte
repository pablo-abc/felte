<script context="module">
  export async function load({ fetch, page }) {
    const res = await fetch(`/docs/${page.params.section}.json`);
    const section = await res.json();
    if (res.ok) {
      return {
        props: {
          section
        },
      };
    } else {
      return {
        status: res.status,
        error: section.message,
      };
    }
  }
</script>

<script>
  import SvelteMarkdown from 'svelte-markdown';
  import Heading from '$lib/components/renderers/Heading.svelte';
  import Blockquote from '$lib/components/renderers/Blockquote.svelte';
  import Code from '$lib/components/renderers/Code.svelte';
  import Link from '$lib/components/renderers/Link.svelte';
  import List from '$lib/components/renderers/List.svelte';
  import Head from '$lib/components/Head.svelte';
  import { getContext } from 'svelte';

  export let section;

  const items = getContext('items');

  $: index = items.findIndex((item) => item.attributes.id === section.attributes.id);
  $: next = index < (items.length - 1) ? items[index + 1] : undefined;
  $: prev = index > 0 ? items[index - 1] : undefined;

  const renderers = {
    heading: Heading,
    code: Code,
    link: Link,
    list: List,
    blockquote: Blockquote,
  };

</script>

<Head section={section.attributes.section} />

<SvelteMarkdown source={section.body} {renderers} />

<div>
  {#if prev}
    <a class="prev" href="/docs/{prev.attributes.id}" sveltekit:prefetch>
      <svg role="img" aria-hidden="true" height="25" width="25" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
      <span class="sr-only">Previous section:</span>
      {prev.attributes.section}
    </a>
  {/if}
  {#if next}
    <a class="next" href="/docs/{next.attributes.id}" sveltekit:prefetch>
      <span class="sr-only">Next section:</span>
      {next.attributes.section}
      <svg role="img" aria-hidden="true" height="25" width="25" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
    </a>
  {/if}
</div>

<style>
  div {
    position: relative;
    margin: 3rem auto;
  }

  a {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .next {
    right: 0;
  }

  .prev {
    left: 0;
  }

  svg {
    color: var(--primary-color);
    margin: auto 1rem;
  }
</style>
