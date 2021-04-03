<script context="module">
  export async function load({ fetch }) {
    const res = await fetch(`/docs.json`);
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

  const next = items[0];

  const renderers = {
    heading: Heading,
    code: Code,
    link: Link,
    list: List,
    blockquote: Blockquote,
  };

</script>

<Head section="Documentation" />

<SvelteMarkdown source={section.body} {renderers} />

<div>
  <a
    aria-label="Next section: Getting started"
    class="next"
    href="/docs/{next.attributes.id}"
    sveltekit:prefetch
    >
    <span class="desktop-only" aria-hidden="true">{next.attributes.section}</span>
    <svg role="img" aria-hidden="true" height="25" width="25" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
  </a>
</div>

<style>
  div {
    position: relative;
    margin: 3rem auto;
    margin-bottom: 6rem;
  }

  a {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem 1rem;
  }

  .next {
    right: 15%;
  }

  svg {
    color: var(--primary-color);
    height: 2.5rem;
    width: 2.5rem;
  }

  .desktop-only {
    display: none;
  }

  a:hover {
    color: var(--primary-font-color);
    background: var(--header-background-hover);
  }

  @media (min-width: 480px) {
    .desktop-only {
      display: inline;
    }

    .next {
      right: 0;
    }

    svg {
      height: 2rem;
      width: 2rem;
    }
  }
</style>
