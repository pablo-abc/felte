<script context="module">
  export async function load({ fetch, page }) {
    const framework = page.params.framework ?? 'svelte';
    return {
      status: 307,
      redirect: `/docs/${framework}/getting-started`,
    };
  }
</script>
