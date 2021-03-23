<script>
  export let href = ''
  export let title = undefined
</script>

<a {href} {title}><slot></slot></a>

<style>
  a {
    color: #1281B3;
    transition: color 100ms;
  }

  a:hover {
    color: #0DB4FF;
  }
</style>
