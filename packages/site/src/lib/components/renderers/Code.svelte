<script>
  import Prism from 'prismjs';
  import 'prismjs/components/prism-bash.js';
  import 'prismjs/components/prism-typescript.js';
  import 'prismjs/components/prism-jsx.js';
  import 'prismjs/components/prism-tsx.js';
  import 'prism-svelte';
  export let lang;
  export let text;

  let langKey = lang;
  if (lang === 'sh') langKey = 'bash';
  let language = Prism.languages[langKey];
  let code = Prism.highlight(text, language, langKey);
</script>

<pre class={`prism language-${lang}`}><code class=prism>{@html code}</code></pre>

<style>
  pre {
    margin: 1rem 0;
    border: 2px solid var(--primary-color);
    border-radius: 10px 30px;
  }
</style>
