import '@testing-library/jest-dom/extend-expect';
import { waitFor } from '@testing-library/dom';
import { cleanupDOM, createInputElement } from './common';
import { createForms } from '../src';
import { get } from 'svelte/store';

function createLoginForm() {
  const formElement = document.createElement('form');
  const emailInput = createInputElement({ name: 'email', type: 'email' });
  const passwordInput = createInputElement({
    name: 'password',
    type: 'password',
  });
  const submitInput = createInputElement({ type: 'submit' });
  const accountFieldset = document.createElement('fieldset');
  accountFieldset.name = 'account';
  accountFieldset.append(emailInput, passwordInput);
  formElement.append(accountFieldset, submitInput);
  document.body.appendChild(formElement);
  return { formElement, emailInput, passwordInput, submitInput };
}

type Data = {
  account: {
    email: string;
    password: string;
  };
};

describe('Multi Step', () => {
  afterEach(cleanupDOM);

  test('handles step changes on submit', async () => {
    const {
      step,
      pages: [page1, page2],
    } = createForms<[Data, Data]>({
      pages: [
        { onSubmit: ({ increaseStep }) => increaseStep() },
        { onSubmit: ({ decreaseStep }) => decreaseStep() },
      ],
    });

    const form1 = createLoginForm();
    const form2 = createLoginForm();

    page1.form(form1.formElement);
    page2.form(form2.formElement);

    expect(get(step)).toBe(0);

    form1.formElement.submit();

    await waitFor(() => {
      expect(get(step)).toBe(1);
    });

    form2.formElement.submit();

    await waitFor(() => {
      expect(get(step)).toBe(0);
    });
  });

  test('passes correct data on submit', async () => {
    const onSubmit1 = jest.fn();
    const onSubmit2 = jest.fn();
    const {
      pages: [page1, page2],
    } = createForms<[Data, Data]>({
      pages: [
        {
          onSubmit: onSubmit1,
          initialValues: { account: { email: '', password: '' } },
        },
        {
          onSubmit: onSubmit2,
          initialValues: { account: { email: '', password: '' } },
        },
      ],
    });

    const form1 = createLoginForm();
    const form2 = createLoginForm();

    page1.form(form1.formElement);
    page2.form(form2.formElement);

    const data1 = {
      account: {
        email: 'first@email.com',
        password: 'password',
      },
    };

    const data2 = {
      account: {
        email: 'second@email.com',
        password: 'password',
      },
    };

    page1.data.set(data1);
    form1.formElement.submit();

    await waitFor(() => {
      expect(onSubmit1).toHaveBeenCalledWith(
        expect.objectContaining({
          values: data1,
        })
      );
    });

    page2.data.set(data2);
    form2.formElement.submit();

    await waitFor(() => {
      expect(onSubmit2).toHaveBeenCalledWith(
        expect.objectContaining({
          values: data2,
          allValues: [data1, data2],
        })
      );
    });
  });
});
