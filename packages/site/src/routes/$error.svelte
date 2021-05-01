<script context="module">
  export function load(props) {
    return { props };
  }
</script>

<script>
  import Head from '$lib/components/Head.svelte';
  export let status;
  export let error;

  const dev = import.meta.env.NODE_ENV !== 'production';
</script>

<style>
  h1, p {
    margin: 0 auto;
  }

  h1 {
    font-size: 2.8em;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  p {
    margin: 1em auto;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>

<Head section={status} />

<h1>{status}</h1>

<p>{error.message}</p>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}
