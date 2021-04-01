<script context="module">

  export async function load({ fetch }) {
    const res = await fetch('docs.json');
    const data = await res.json();
    if (res.ok) {
      return {
        props: {
          data
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
  import SvelteMarkdown from 'svelte-markdown';
  import Heading from '$lib/components/renderers/Heading.svelte';
  import Blockquote from '$lib/components/renderers/Blockquote.svelte';
  import Code from '$lib/components/renderers/Code.svelte';
  import DocsAside from '$lib/components/DocsAside.svelte';
  import Link from '$lib/components/renderers/Link.svelte';
  import List from '$lib/components/renderers/List.svelte';
  import Head from '$lib/components/Head.svelte';

  export let data = [];

  const renderers = {
    heading: Heading,
    code: Code,
    link: Link,
    list: List,
    blockquote: Blockquote,
  };

  let asideItems = data.map(section => ({
    id: section.attributes.id,
    section: section.attributes.section,
    subsections: section.attributes.subsections,
  }));

  let content = data.map(section => section.body).join('\n\n');
</script>

<Head section="Documentation" />

<div class=main-container>
  <main>
    <SvelteMarkdown source={content} {renderers} />
  </main>
  <DocsAside items={asideItems} />
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
