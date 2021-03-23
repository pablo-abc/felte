<script>
  export let depth;
  export let raw;
  export let text;
  const id = text.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
</script>

<span>
  {#if depth === 2 || depth === 3}
    <a name={id} href={`docs#${id}`} aria-hidden=true>
      <img src="icons/link.svg" alt="" />
    </a>
  {/if}
  {#if depth === 1}
    <h1><slot></slot></h1>
  {:else if depth === 2}
    <h2><slot></slot></h2>
  {:else if depth === 3}
    <h3><slot></slot></h3>
  {:else if depth === 4}
    <h4><slot></slot></h4>
  {:else if depth === 5}
    <h5><slot></slot></h5>
  {:else if depth === 6}
    <h6><slot></slot></h6>
  {:else}
    {raw}
  {/if}
</span>

<style>
  span {
    position: relative;
    display: flex;
    align-items: center;
  }

  a {
    opacity: 0;
    position: absolute;
    left: -2rem;
    transition: opacity 300ms;
  }

  img {
    height: 1.6rem;
  }

  a:hover {
    opacity: 1;
  }

  h2 {
    font-size: 3rem;
  }

  h3 {
    font-size: 2rem;
  }

  h4 {
    font-size: 1.4rem;
  }
</style>
