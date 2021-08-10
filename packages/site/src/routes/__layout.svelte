<script>
  import 'focus-visible';
  import '../app.postcss';
  import Nav from '$lib/components/Nav.svelte';
  import 'tippy.js/dist/tippy.css';
  import 'highlight.js/styles/a11y-dark.css';
</script>

<Nav />

<slot></slot>
