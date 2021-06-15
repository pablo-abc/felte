import hljs from 'highlight.js';

function highlighter(code, language) {
  const highlighted = hljs.highlight(code, { language });
  const value = highlighted.value;
  return (
    '{@html `<pre class="hljs ' +
    language +
    '"><code class="hljs">' +
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
