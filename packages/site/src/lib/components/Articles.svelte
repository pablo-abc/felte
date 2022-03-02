<script>
  import Article from './Article.svelte';
</script>

<section aria-labelledby="articles-title">
  <header>
    <h2 id="articles-title">Articles</h2>
  </header>
  <ul>
    <li>
      <Article
        title="Announcing Felte 1.0: A form library for Svelte, Solid and React"
        href="https://dev.to/pabloabc/announcing-felte-10-a-form-library-for-svelte-solid-and-react-5ble"
        created="2022-02-14"
        readingTime="5"
        >
        After more than a year of work, v1 is here!
      </Article>
    </li>
    <li>
      <Article
        title="Felte: An extensible form library for React"
        href="https://dev.to/pabloabc/felte-an-extensible-form-library-for-react-3bje"
        created="2022-02-14"
        readingTime="8"
        >
        A flexible way to handle your forms in React
      </Article>
    </li>
    <li>
      <Article
        title="Felte: An extensible form library for Solid"
        href="https://dev.to/pabloabc/felte-an-extensible-form-library-for-solid-4cde"
        created="2021-12-08"
        readingTime="8"
        >
        A flexible way to handle your forms in Solid
      </Article>
    </li>
    <li>
      <Article
        title="Felte: An extensible form library for Svelte"
        href="https://dev.to/pabloabc/felte-an-extensible-form-library-for-svelte-3m78"
        created="2021-12-08"
        readingTime="8"
        >
        A flexible way to handle your forms in Svelte
      </Article>
    </li>
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
