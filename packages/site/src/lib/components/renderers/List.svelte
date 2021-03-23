<script>
  export let ordered
  export let start
</script>

{#if ordered}
  <ol {start}><slot></slot></ol>
{:else}
  <ul><slot></slot></ul>
{/if}

<style>
  ul, ol {
    margin-left: 1.5rem;
  }
</style>
