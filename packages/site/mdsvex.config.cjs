const hljs = require('highlight.js');

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

module.exports = {
  extensions: [".svx", ".md"],
  highlight: {
    highlighter,
  },
};
