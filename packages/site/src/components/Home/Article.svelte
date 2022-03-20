<script>
  export let title;
  export let href;
  export let created;
  export let readingTime;

  $: localeDate = new Date(created).toLocaleDateString('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
</script>

<article>
  <header>
    <h3><a {href} rel="noreferrer">{title}</a></h3>
  </header>
  <div class="stats">
    <span>
      Published on: <time datetime={created}>{localeDate}</time>
    </span>
    <span>
      Reading time: <time datetime="{readingTime}m">{readingTime} minutes</time>
    </span>
  </div>
  <p><slot /></p>
</article>

<style>
  article {
    background: var(--example-background);
    padding: 1rem 2rem;
    border-radius: 10px 30px;
  }

  article p {
    font-style: italic;
    margin: 0.5rem 0;
  }

  article h3 {
    margin-top: 1rem;
  }

  .stats {
    padding-top: 0.2rem;
    font-size: 0.9rem;
    display: flex;
    flex-wrap: wrap;
  }

  .stats span {
    font-style: italic;
    font-weight: 700;
    margin-right: 1.5rem;
  }

  .stats span time {
    font-style: normal;
    font-weight: 400;
  }
</style>
