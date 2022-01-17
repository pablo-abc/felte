<script>
  import Lazy from 'svelte-lazy';
  import Loader from './Loader.svelte';

  export let title;
</script>

<div class="example">
  <h2>{title}</h2>
  <Lazy height="500px" placeholder={Loader} placeholderProps={{}} fadeOption={{ duration: 0 }}>
    <div class="iframe-container"><slot></slot></div>
  </Lazy>
</div>

<style>
  .example {
    position: relative;
    flex-wrap: wrap;
    max-width: 90%;
    width: 90vw;
    margin: 2rem auto;
  }

  .example :global(.svelte-lazy-placeholder) {
    position: absolute;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    top: 50%;
  }

  .iframe-container {
    border: 2px solid var(--primary-color);
    background: var(--example-background);
  }

  @media (min-width: 966px) {
    .example {
      max-width: 60%;
      width: 60vw;
    }
  }
</style>
