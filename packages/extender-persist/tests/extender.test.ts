import '@testing-library/jest-dom/extend-expect';
import { createForm } from 'felte';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { createDOM, cleanupDOM, createInputElement } from './common';
import { extender } from '../src';
import { get } from 'svelte/store';

describe('Extender persist', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('updates localStorage', async () => {
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
      onSubmit: jest.fn(),
      extend: extender({ id: 'test-update', ignore: ['account.someSecret'] }),
    });

    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'account';
    const emailInput = createInputElement({
      name: 'email',
    });
    const passwordInput = createInputElement({
      type: 'password',
      name: 'password',
    });
    const confirmPasswordInput = createInputElement({
      type: 'text',
      name: 'confirmPassword',
    });
    confirmPasswordInput.setAttribute('data-felte-extender-persist-ignore', '');
    const someSecretInput = createInputElement({
      type: 'text',
      name: 'someSecret',
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
      expect(data).toEqual({
        account: {
          email: 'jacek@soplica.com',
        },
      });
    });
    destroy();
  });

  test('restores from localStorage', async () => {
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
      onSubmit: jest.fn(),
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
      expect(get(data)).toEqual({
        account: { email: 'jacek@soplica.com', password: 'password' },
      });
      expect(emailInput.value).toBe('jacek@soplica.com');
      expect(passwordInput.value).toBe('password');
    });
  });
});
