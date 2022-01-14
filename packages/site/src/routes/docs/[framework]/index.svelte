<script context="module">
  export async function load({ params }) {
    const framework = params.framework ?? 'svelte';
    return {
      status: 307,
      redirect: `/docs/${framework}/getting-started`,
    };
  }
</script>
