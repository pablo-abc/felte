import { css } from 'lit';

const styles = css`
  :host {
    --primary-color: rgb(255, 62, 0);
    --on-primary-color: #fffff9;
    --primary-color-hover: rgb(255, 113, 51);
    --error-color: #ff3a43;
    --primary-font-color: #fffff0;
    --header-background: #222222;
    --example-background: var(--header-background);
  }

  * {
    box-sizing: border-box;
  }

  h1,
  h2 {
    font-family: 'Cabin', sans-serif;
    margin: 1rem;
    font-weight: 700;
    line-height: 1.2;
  }

  p {
    margin: 1.5rem 0;
  }

  h1 {
    font-size: 2.1rem;
  }

  h2 {
    font-size: 1.8rem;
  }

  section {
    margin: 1rem;
    margin-top: 2rem;
  }

  input[type='email'],
  [contenteditable],
  input[type='password'] {
    font-size: 1em;
    border: 1px solid #aaa;
    border-radius: 10px;
    padding: 0.3rem 1rem;
    background: var(--on-primary-color);
    height: 3rem;
    width: 18rem;
    color: black;
  }

  [contenteditable][aria-invalid='true'] {
    border: 2px solid var(--error-color);
  }

  *:focus-visible {
    outline: 2px solid lightgreen;
    outline-offset: 2px;
  }

  fieldset {
    width: 400px;
    border: 2px solid var(--primary-color);
    display: block;
    font-size: 1.2em;
    background: var(--example-background);
    padding: 2rem;
    border-radius: 10px 30px;
  }

  button {
    margin-top: 0.7em;
    font-size: 0.8em;
    font-weight: 700;
    padding: 0.7em;
    background: var(--primary-color);
    border-radius: 10px;
    border: none;
    color: var(--on-primary-color);
    transition: transform 0.1s;
  }

  button:not([aria-disabled='true']):hover {
    cursor: pointer;
    background: var(--primary-color-hover);
  }

  button:not([aria-disabled='true']):active {
    transform: scale(0.95);
  }

  button[aria-disabled='true'] {
    background: var(--primary-color-hover);
    cursor: not-allowed;
  }

  felte-validation-message::part(container) {
    color: var(--error-color);
    margin: 0;
    padding: 0;
  }

  label {
    display: block;
  }

  felte-validation-message::part(item) {
    list-style: disc inside;
  }
`;

export default styles;
