<script>
  import Prism from 'prismjs';
  import 'prismjs/components/prism-bash.js';
  import 'prismjs/components/prism-typescript.js';
  import 'prismjs/components/prism-jsx.js';
  import 'prismjs/components/prism-tsx.js';
  import 'prism-svelte';

  Prism.manual = true;

  export let lang;
  export let text;

  let langKey = lang;
  if (lang === 'sh') langKey = 'bash';
  let language = Prism.languages[langKey];
  let code = language ? Prism.highlight(text, language, langKey) : text;
</script>

<div class="container">
  <pre
    class="{language ? `prism language-${lang}` : 'prism language-'}"
    tabindex="0"
  ><code class=prism>{@html code}</code></pre>
  <copy-button {text}></copy-button>
</div>

<style>
  pre {
    margin: 1rem 0;
    border: 2px solid var(--primary-color);
    border-radius: 10px 30px;
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .container {
    position: relative;
  }
</style>
