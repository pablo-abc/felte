<script>
  export let title;

  let show = false;

  $: id = title.replace(/ /g, '-').toLowerCase();
</script>

<section class="example" aria-labelledby={id}>
  <h2 {id}>{title}</h2>
  {#if show}
    <div class="iframe-container"><slot></slot></div>
  {:else}
    <div class="container">
      <button on:click="{() => (show = true)}" class="primary">
        Load example <span class=sr-only>on {title}</span>
      </button>
    </div>
  {/if}
</section>

<style>
  .example {
    position: relative;
    flex-wrap: wrap;
    max-width: 90%;
    width: 90vw;
    margin: 2rem auto;
  }

  .iframe-container, .container {
    border: 2px solid var(--primary-color);
    background: #222;
  }

  .container {
    height: 500px;
    display: grid;
    place-items: center;
  }

  .container button {
    font-size: 1.1rem;
  }

  @media (min-width: 966px) {
    .example {
      max-width: 60%;
      width: 60vw;
    }
  }
</style>
