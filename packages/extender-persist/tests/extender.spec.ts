import { createForm } from 'felte';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createDOM, cleanupDOM, createInputElement } from './common';
import { extender } from '../src';
import uvuDOM from 'uvu-expect-dom';
import { get } from 'svelte/store';
import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, extend } from 'uvu-expect';
extend(uvuDOM);

const Extender = suite('Extender persist');

Extender.before.each(createDOM);
Extender.after.each(cleanupDOM);

Extender('updates localStorage', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  type Data = {
    account: {
      email: string;
      password: string;
      confirmPassword: string;
      someSecret: string;
    };
  };
  const { form } = createForm<Data>({
    initialValues: {
      account: {
        email: '',
        password: '',
        confirmPassword: '',
        someSecret: '',
      },
    },
    onSubmit: sinon.fake(),
    extend: extender({
      id: 'test-update',
      ignore: ['account.someSecret', 'account.password'],
    }),
  });

  const fieldsetElement = document.createElement('fieldset');
  const emailInput = createInputElement({
    name: 'account.email',
  });
  const passwordInput = createInputElement({
    type: 'password',
    name: 'account.password',
  });
  const confirmPasswordInput = createInputElement({
    type: 'text',
    name: 'account.confirmPassword',
  });
  confirmPasswordInput.setAttribute('data-felte-extender-persist-ignore', '');
  const someSecretInput = createInputElement({
    type: 'text',
    name: 'account.someSecret',
  });
  fieldsetElement.appendChild(emailInput);
  fieldsetElement.appendChild(passwordInput);
  fieldsetElement.appendChild(confirmPasswordInput);
  fieldsetElement.appendChild(someSecretInput);
  formElement.appendChild(fieldsetElement);

  const { destroy } = form(formElement);

  setTimeout(() => {
    userEvent.type(emailInput, 'jacek@soplica.com');
    userEvent.type(passwordInput, 'password');
    userEvent.type(confirmPasswordInput, 'password');
    userEvent.type(someSecretInput, 'secret');
  });
  await waitFor(() => {
    const stringData = localStorage.getItem('test-update');
    const data = stringData ? JSON.parse(stringData) : {};
    expect(data).to.deep.equal({
      account: {
        email: 'jacek@soplica.com',
      },
    });
  });
  destroy();
});

Extender('restores from localStorage', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;

  localStorage.setItem(
    'test-restore',
    JSON.stringify({
      account: { email: 'jacek@soplica.com', password: 'password' },
    })
  );
  type Data = {
    account: {
      email: string;
      password: string;
    };
  };
  const { form, data } = createForm<Data>({
    initialValues: {
      account: {
        email: '',
        password: '',
      },
    },
    onSubmit: sinon.fake(),
    extend: extender({ id: 'test-restore' }),
  });

  const emailInput = createInputElement({
    name: 'account.email',
  });
  const passwordInput = createInputElement({
    type: 'password',
    name: 'account.password',
  });
  formElement.appendChild(emailInput);
  formElement.appendChild(passwordInput);

  form(formElement);

  await waitFor(() => {
    expect(get(data)).to.deep.equal({
      account: { email: 'jacek@soplica.com', password: 'password' },
    });
    expect(emailInput.value).to.equal('jacek@soplica.com');
    expect(passwordInput.value).to.equal('password');
  });
});

Extender.run();
