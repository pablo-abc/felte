import Prism from 'prismjs';
import 'prismjs/components/prism-shell-session.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-tsx.js';
import 'prism-svelte';

function highlighter(code, language) {
  const value = Prism.highlight(code, Prism.languages[language]);
  return (
    '{@html `<pre class="prism language-' +
    language +
    '"><code class="prism">' +
    value +
    '</code></pre>`}'
  );
}

const config = {
  extensions: ['.svx', '.md'],
  highlight: {
    highlighter,
  },
};

export default config;
