<script>
  import HomeExample from '$lib/components/HomeExample.svelte';
  import Features from '$lib/components/Features.svelte';
  import Example from '$lib/components/Example.svelte';
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
    <Example title="Using Svelte">
      <iframe src="https://codesandbox.io/embed/felte-v1-demo-svelte-0egr6?fontsize=14&hidenavigation=1&module=%2FApp.svelte&theme=dark"
              loading="lazy"
              style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
              title="felte-v1-demo-svelte"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              ></iframe>
    </Example>
  </div>
  <div class=row>
    <Example title="Using Solid">
      <iframe src="https://codesandbox.io/embed/felte-v1-demo-solidjs-rt0cm?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fmain.tsx&theme=dark"
              style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
              title="felte-v1-demo-solidjs"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              ></iframe>
    </Example>
  </div>
  <div class=row>
    <Example title="Using React">
      <iframe src="https://codesandbox.io/embed/felte-react-demo-q2xxw?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.js&theme=dark"
              style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
              title="felte-react-demo"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              ></iframe>
    </Example>
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
