<script>
  import HomeExample from '$lib/components/HomeExample.svelte';
  import Features from '$lib/components/Features.svelte';
  import TippyExample from '$lib/components/examples/tippy/Example.svx';
  import DomExample from '$lib/components/examples/dom/Example.svx';
  import SvelteExample from '$lib/components/examples/svelte/Example.svx';
  import Head from '$lib/components/Head.svelte';
  import { setLocale } from 'yup';

  setLocale({
    mixed: {
      default: 'Not valid',
      required: 'Must not be empty',
    },
    string: {
      email: 'Must be a valid email address',
    },
  });
</script>

<Head section="An extensible form library for Svelte, Solid and React" />

<main>
  <div class=row>
    <section class=title>
      <h1>FELTE</h1>
      <h2>
        An extensible <span class=bold>f</span>orm library for Sv<span class=bold>elte</span>, Solid and React
      </h2>
    </section>
    <section>
      <HomeExample />
    </section>
  </div>
  <div class=row>
    <Features />
  </div>
  <div class=row>
    <TippyExample />
  </div>
  <div class=row>
    <DomExample />
  </div>
  <div class=row>
    <SvelteExample />
  </div>
</main>

<style>
  .row {
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;
    min-height: calc(100vh - 6rem);
  }

  .row section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 2rem 1rem;
  }

  .title {
    min-width: min(60%, 600px);
  }

  h1 {
    margin: 0 auto;
    font-size: 4em;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin: 0 0 0.5em 0;
  }

  h2 {
    font-weight: 400;
  }

  .bold {
    font-weight: 700;
  }

  @media (min-width: 971px) {
    h1 {
      font-size: 7em;
    }

    .title {
      min-height: calc(100vh - 10rem);
    }
  }
</style>
