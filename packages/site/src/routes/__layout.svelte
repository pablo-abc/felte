<script>
  import 'focus-visible';
  import '../app.postcss';
  import Nav from '$lib/components/Nav.svelte';
  import 'tippy.js/dist/tippy.css';
  import { onMount } from 'svelte';

  const currentVersion = import.meta.env.VITE_FELTE_VERSION;
  const altVersion = import.meta.env.VITE_FELTE_ALT_VERSION;
  const altLink = import.meta.env.VITE_FELTE_ALT_LINK;
</script>

<aside class="banner mobile">
  If you're looking for the documentation for {altVersion}, <a href="{altLink}" re="external">click here</a>.
</aside>
<aside class="banner desktop">
  This is the documentation for Felte {currentVersion}. If you're looking for the documentation for {altVersion}, <a href="{altLink}" re="external">click here</a>.
</aside>
<Nav />

<slot></slot>

<style>
  .banner {
    background-color: var(--highlight-background);
    color: #FFF;
    font-size: 0.9rem;
    padding: 0.5rem;
    text-align: center;
  }

  .banner a {
    color: #FFF;
    font-weight: 700;
  }

  .banner :global(a:focus-visible) {
    outline: 3px solid #FFF;
    outline-offset: 2px;
  }

  .desktop {
    display: none;
  }

  @media only screen and (min-width: 900px) {
    .desktop {
      display: block;
    }

    .mobile {
      display: none;
    }
  }
</style>
