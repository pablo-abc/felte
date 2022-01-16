<script>
  import Lazy from 'svelte-lazy';

  export let title;
</script>

<div class="example">
  <h2>{title}</h2>
  <Lazy height="500px">
    <slot></slot>
  </Lazy>
</div>

<style>
  .example {
    flex-wrap: wrap;
    max-width: 90%;
    width: 90vw;
    margin: 2rem auto;
  }

  @media (min-width: 966px) {
    .example {
      max-width: 60%;
      width: 60vw;
    }
  }
</style>
