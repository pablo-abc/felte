import './style.css';
import '@felte/element/felte-form';
import '@felte/element/felte-field';
import '@felte/reporter-element/felte-validation-message';
import { reporter } from '@felte/reporter-element';
import { prepareForm } from '@felte/element';

type Data = {
  email: string;
  password: string;
};

prepareForm<Data>('signin', {
  onSubmit: (values) => {
    const submittedSection = document.getElementById('submitted');
    if (!submittedSection) return;
    submittedSection.innerHTML = `
           <h2>Submitted:</h2>
           <pre>${JSON.stringify(values, null, 2)}</pre>
         `;
  },
  validate(values) {
    const errors: {
      email: string[];
      password: string[];
    } = {
      email: [],
      password: [],
    };
    if (!values.email) errors.email.push('Must not be empty');
    if (!/[a-zA-Z][^@]*@[a-zA-Z][^@.]*\.[a-z]{2,}/.test(values.email))
      errors.email.push('Must be a valid email');
    if (!values.password) errors.password.push('Must not be empty');
    return errors;
  },
  extend: [reporter],
});

const form = document.querySelector('form');
const submitted = document.getElementById('submitted');
form?.addEventListener('reset', function () {
  if (!submitted) return;
  submitted.innerHTML = '';
});
