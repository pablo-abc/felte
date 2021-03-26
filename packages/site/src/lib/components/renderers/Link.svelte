<script>
  export let href = ''
  export let title = undefined
</script>

<a {href} {title}><slot></slot></a>

<style>
  a, a :global(code) {
    color: #0F73A0;
    transition: color 100ms;
  }

  a:hover, a :global(code):hover {
    color: #0DB4FF;
  }
</style>
