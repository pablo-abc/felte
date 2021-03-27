<script>
  export let href = ''
  export let title = undefined
</script>

<a {href} {title}><slot></slot></a>

<style>
  a, a :global(code) {
    color: var(--link-color);
    transition: color 100ms;
  }

  a:hover, a :global(code):hover {
    color: var(--link-color-hover);
  }
</style>
