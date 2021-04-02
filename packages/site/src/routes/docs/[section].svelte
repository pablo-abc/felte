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

  export let section;

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
