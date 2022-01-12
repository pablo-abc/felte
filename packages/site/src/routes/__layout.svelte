<script>
  import 'focus-visible';
  import '../app.postcss';
  import Nav from '$lib/components/Nav.svelte';
  import 'tippy.js/dist/tippy.css';
  import 'highlight.js/styles/a11y-dark.css';

  const currentVersion = import.meta.env.VITE_FELTE_VERSION;
  const altVersion = import.meta.env.VITE_FELTE_ALT_VERSION;
  const altLink = import.meta.env.VITE_FELTE_ALT_LINK;
</script>

<div class="banner mobile">
  If you're looking for the documentation for {altVersion}, <a href="{altLink}" re="external">click here</a>.
</div>
<div class="banner desktop">
  This is the documentation for Felte {currentVersion}. If you're looking for the documentation for {altVersion}, <a href="{altLink}" re="external">click here</a>.
</div>
<Nav />

<slot></slot>

<style>
  .banner {
    background-color: var(--primary-color);
    color: #FFF;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0.5rem;
    text-align: center;
  }

  .banner a {
    color: #FFF;
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
