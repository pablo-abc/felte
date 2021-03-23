<div class=features>
  <section class=feat>
    <h2>Validation!</h2>
    <p>
      Use your favorite validation library (or create your own strategy). As long as the validation messages are in the shape Felte expects, you'll be able to use it.
    </p>
  </section>
  <section class="feat feat-center">
    <h2>Error reporting!</h2>
    <p>
      With Felte's built-in reporting capabilities you'll need minimal set up to handle your errors! Use any of our reporter packages or build your own to suit your needs.
    </p>
  </section>
  <section class="feat feat-final">
    <h2>Easy styling!</h2>
    <p>
      No fighting with custom components or CSS variables. Felte works with plain HTML tags. Write your form as you would any HTML5 form!
    </p>
  </section>
</div>

<style>
  .features {
    min-height: 100vh;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .feat {
    max-width: min(30%, 500px);
    min-width: 300px;
    min-height: 250px;
    margin: 1rem;
    padding: 2rem;
    background: rgba(255, 62, 0, 0.2);
    border-radius: 10px 30px;
  }

  .feat-center {
    background: rgba(13, 255, 62, 0.2);
  }

  .feat-final {
    background: rgba(13, 180, 255, 0.2);
  }
</style>
