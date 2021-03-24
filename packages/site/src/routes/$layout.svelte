<script>
  import Nav from '$lib/components/Nav.svelte';
  import 'tippy.js/dist/tippy.css';
  import 'highlight.js/styles/a11y-dark.css';
  import { onMount } from 'svelte';

  onMount(() => {
    if (location.hash) {
      location.replace(`${location.pathname}${location.hash}`);
    }
  });
</script>

<Nav />

<slot></slot>
