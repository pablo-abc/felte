<script>
  import Article from './Article.svelte';

  export let articles = [];
</script>

<section aria-labelledby="articles-title">
  <header>
    <h2 id="articles-title">Articles</h2>
  </header>
  <ul>
    {#each articles as { title, href, created, readingTime, description } (title)}
      <li>
        <Article {title} {href} {created} {readingTime}>
          {description}
        </Article>
      </li>
  {/each}
  </ul>
</section>

<style>
  section {
    max-width: 90%;
    width: 90vw;
    margin: 2rem auto;
  }

  @media (min-width: 966px) {
    section {
      max-width: 60%;
      width: 60vw;
    }
  }

  li {
    list-style: none;
    margin-top: 1rem;
  }
</style>
