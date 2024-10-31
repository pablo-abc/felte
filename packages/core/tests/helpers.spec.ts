import '@testing-library/jest-dom/vitest';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, screen } from '@testing-library/dom';
import { writable } from 'svelte/store';
import { get } from '../src/get';
import userEvent from '@testing-library/user-event';
import {
  createInputElement,
  createMultipleInputElements,
  createDOM,
  cleanupDOM,
  createForm,
} from './common';
import { deepRemoveKey, deepSetKey } from '../src/deep-set-key';

describe('Helpers', () => {
  beforeEach(createDOM);

  afterEach(() => {
    cleanupDOM();
    vi.resetAllMocks();
  });

  test('setFields should update and touch field', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    const inputElement = createInputElement({
      name: 'account.email',
      value: '',
      type: 'text',
    });
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);
    type Data = {
      account: {
        email: string;
      };
    };
    const { form, data, touched, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: vi.fn(),
    });

    expect(get(data).account.email).to.equal('');
    expect(get(touched).account.email).to.equal(false);
    setFields('account.email', 'jacek@soplica.com', true);
    expect(get(data)).to.deep.equal({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(touched)).to.deep.equal({
      account: {
        email: true,
      },
    });

    form(formElement);

    expect(get(data).account.email).to.equal('');
    expect(inputElement.value).to.equal('');

    setFields('account.email', 'jacek@soplica.com', true);
    expect(get(data)).to.deep.equal({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(inputElement.value).to.equal('jacek@soplica.com');
  });

  test('setField should update without touching field', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, touched, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: vi.fn(),
    });

    expect(get(data).account.email).to.equal('');
    expect(get(touched).account.email).to.equal(false);
    setFields('account.email', 'jacek@soplica.com', false);
    expect(get(data)).to.deep.equal({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(touched)).to.deep.equal({
      account: {
        email: false,
      },
    });
  });

  test('setFields should set all fields', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    const inputElement = createInputElement({
      name: 'account.email',
      value: '',
      type: 'text',
    });
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);
    type Data = {
      account: {
        email: string;
      };
    };
    const { form, data, touched, setFields } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: vi.fn(),
    });

    expect(get(data).account.email).to.equal('');
    expect(get(touched).account.email).to.equal(false);
    setFields({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(data)).to.deep.equal({
      account: {
        email: 'jacek@soplica.com',
      },
    });

    form(formElement);

    expect(get(data).account.email).to.equal('');
    expect(inputElement.value).to.equal('');

    setFields({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(get(data)).to.deep.equal({
      account: {
        email: 'jacek@soplica.com',
      },
    });
    expect(inputElement.value).to.equal('jacek@soplica.com');
  });

  test('setTouched should touch field', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { touched, setTouched } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: vi.fn(),
    });

    expect(get(touched).account.email).to.equal(false);
    setTouched('account.email', true);
    expect(get(touched)).to.deep.equal({
      account: {
        email: true,
      },
    });
  });

  test('setError should set a field error when touched', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { errors, touched, setErrors, setTouched } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: vi.fn(),
    });

    expect(get(errors)?.account?.email).to.be.null;
    setErrors('account.email', 'Not an email');
    expect(get(errors)).to.deep.equal({
      account: {
        email: null,
      },
    });
    setTouched('account.email', () => true);
    expect(get(touched).account.email).to.equal(true);
    expect(get(errors)).to.deep.equal({
      account: {
        email: ['Not an email'],
      },
    });
  });

  test('setWarning should set a field warning', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { warnings, setWarnings } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      onSubmit: vi.fn(),
    });

    expect(get(warnings)?.account?.email).to.be.null;
    setWarnings('account.email', 'Not an email');
    expect(get(warnings)).to.deep.equal({
      account: {
        email: ['Not an email'],
      },
    });
  });

  test('validate should force validation', async () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const mockErrors = { account: { email: 'Not email' } };
    const mockValidate = vi.fn().mockReturnValue(mockErrors);
    const { errors, touched, validate } = createForm<Data>({
      initialValues: {
        account: {
          email: '',
        },
      },
      validate: mockValidate,
      onSubmit: vi.fn(),
    });

    expect(mockValidate).toHaveBeenCalledOnce();
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(get(errors)).to.deep.equal({ account: { email: ['Not email'] } });
      expect(get(touched)).to.deep.equal({
        account: {
          email: true,
        },
      });
    });

    mockValidate.mockReturnValue({});
    validate();
    expect(mockValidate).toHaveBeenCalledTimes(3);
    await waitFor(() => {
      expect(get(errors)).to.deep.equal({ account: { email: null } });
      expect(get(touched)).to.deep.equal({
        account: {
          email: true,
        },
      });
    });
  });

  test('reset should reset form to default values', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const accountFieldset = document.createElement('fieldset');
    const emailInput = createInputElement({
      name: 'account.email',
      type: 'text',
      value: '',
    });
    accountFieldset.appendChild(emailInput);
    formElement.appendChild(accountFieldset);
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, touched, reset, form, isDirty, setFields } = createForm<Data>(
      {
        initialValues: {
          account: {
            email: '',
          },
        },
        onSubmit: vi.fn(),
      },
    );

    expect(get(data).account.email).to.equal('');

    setFields('account.email', 'jacek@soplica.com', true);

    expect(get(data).account.email).to.equal('jacek@soplica.com');

    expect(get(touched).account.email).to.equal(true);

    reset();

    expect(get(data)).to.deep.equal({
      account: {
        email: '',
      },
    });

    expect(get(touched)).to.deep.equal({
      account: {
        email: false,
      },
    });

    expect(get(isDirty)).to.equal(false);

    form(formElement);

    expect(get(data)).to.deep.equal({
      account: {
        email: '',
      },
    });

    expect(get(isDirty)).to.equal(false);

    userEvent.click(emailInput);
    userEvent.click(formElement);

    expect(get(isDirty)).to.equal(false);

    userEvent.type(emailInput, 'jacek@soplica.com');
    expect(get(data).account.email).to.equal('jacek@soplica.com');

    expect(get(isDirty)).to.equal(true);

    reset();

    expect(get(data)).to.deep.equal({
      account: {
        email: '',
      },
    });

    expect(get(touched)).to.deep.equal({
      account: {
        email: false,
      },
    });

    expect(get(isDirty)).to.equal(false);

    userEvent.click(emailInput);
    userEvent.click(formElement);

    expect(get(isDirty)).to.equal(false);

    userEvent.type(emailInput, 'jacek@soplica.com');
    expect(get(data).account.email).to.equal('jacek@soplica.com');

    expect(get(isDirty)).to.equal(true);

    formElement.reset();

    expect(get(data)).to.deep.equal({
      account: {
        email: '',
      },
    });

    expect(get(touched)).to.deep.equal({
      account: {
        email: false,
      },
    });

    expect(get(isDirty)).to.equal(false);
  });

  test('setInitialValues sets new initial values', () => {
    type Data = {
      account: {
        email: string;
      };
    };
    const { data, setInitialValues, touched, setFields, reset } =
      createForm<Data>({
        initialValues: {
          account: {
            email: '',
          },
        },
        onSubmit: vi.fn(),
      });

    expect(get(data).account.email).to.equal('');
    expect(get(touched).account.email).to.equal(false);

    setInitialValues({ account: { email: 'zaphod@beeblebrox.com' } });

    expect(get(data).account.email).to.equal('');
    expect(get(touched).account.email).to.equal(false);

    setFields('account.email', 'jacek@soplica.com', true);

    expect(get(data).account.email).to.equal('jacek@soplica.com');
    expect(get(touched).account.email).to.equal(true);

    reset();

    expect(get(data).account.email).to.equal('zaphod@beeblebrox.com');
    expect(get(touched).account.email).to.equal(false);
  });

  test('get gets current value of store', () => {
    const store = writable(true);

    expect(get(store)).to.equal(true);

    const originalSubscribe = store.subscribe;
    const rxStore = {
      subscribe(subscriber: any) {
        const unsubscribe = originalSubscribe(subscriber);
        return { unsubscribe };
      },
    };
    expect(get(rxStore as any)).to.equal(true);
  });

  test('unsetField removes a field from all stores', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    const inputElement = createInputElement({
      name: 'account.email',
      value: '',
      type: 'text',
    });
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);
    type Data = {
      account: {
        email: string;
      };
    };
    const { form, data, touched, errors, warnings, unsetField } =
      createForm<Data>({
        initialValues: {
          account: {
            email: '',
          },
        },
        onSubmit: vi.fn(),
      });

    form(formElement);

    userEvent.type(inputElement, 'zaphod@beeblebrox.com');

    await waitFor(() => {
      expect(get(data).account.email).to.equal('zaphod@beeblebrox.com');
    });

    unsetField('account.email');

    await waitFor(() => {
      expect(get(data)).to.deep.equal({ account: {} });
      expect(get(touched)).to.deep.equal({ account: {} });
      expect(get(errors)).to.deep.equal({ account: {} });
      expect(get(warnings)).to.deep.equal({ account: {} });
      expect(inputElement).not.toHaveValue();
    });
  });

  test('resetField resets a field to its initial value', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    const inputElement = createInputElement({
      name: 'account.email',
      value: '',
      type: 'text',
    });
    fieldsetElement.appendChild(inputElement);
    formElement.appendChild(fieldsetElement);
    type Data = {
      account: {
        email: string;
      };
    };
    const { form, data, touched, errors, resetField } = createForm<Data>({
      initialValues: {
        account: {
          email: 'zaphod@beeblebrox.com',
        },
      },
      onSubmit: vi.fn(),
    });

    form(formElement);

    userEvent.clear(inputElement);
    userEvent.type(inputElement, 'jacek@soplica.com');
    userEvent.click(formElement);

    errors.set({ account: { email: 'Error' } });

    await waitFor(() => {
      expect(get(data).account.email).to.equal('jacek@soplica.com');
      expect(get(touched).account.email).to.equal(true);
      expect(get(errors).account?.email).to.deep.equal(['Error']);
    });

    resetField('account.email');

    await waitFor(() => {
      expect(get(data).account.email).to.equal('zaphod@beeblebrox.com');
      expect(get(touched).account.email).to.equal(false);
      expect(get(errors).account?.email).to.equal(null);
      expect(inputElement).toHaveValue('zaphod@beeblebrox.com');
    });
  });

  test('addField and unsetField add and remove fields accordingly', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const multipleInputs = createMultipleInputElements(
      {
        name: 'todos',
      },
      3,
    );
    formElement.append(...multipleInputs);
    type Data = {
      todos: {
        value: string;
      }[];
    };
    const {
      form,
      data,
      touched,
      errors,
      addField,
      unsetField,
      swapFields,
      moveField,
    } = createForm<Data>({
      initialValues: {
        todos: new Array(3).fill({ value: '' }),
      },
      onSubmit: vi.fn(),
    });

    form(formElement);

    userEvent.type(multipleInputs[0], 'First todo');
    userEvent.type(multipleInputs[1], 'Third todo');
    userEvent.type(multipleInputs[2], 'Fourth todo');

    errors.set({
      todos: [
        {
          value: '',
        },
        {
          value: 'Invalid',
        },
        {
          value: '',
        },
      ],
    });

    await waitFor(() => {
      expect(get(data).todos[1].value).to.equal('Third todo');
      expect(get(touched).todos[1].value).to.equal(true);
      expect(get(errors).todos?.[1].value).to.deep.equal(['Invalid']);
    });

    addField('todos', { value: 'Second todo' }, 1);
    addField('todos.1', 'ignored');

    await waitFor(() => {
      expect(get(data).todos[1].value).to.equal('Second todo');
      expect(get(touched).todos[1].value).to.equal(false);
      expect(get(errors).todos?.[1].value).to.equal(null);
      expect(multipleInputs[1]).toHaveValue('Second todo');
      expect(get(data).todos[2].value).to.equal('Third todo');
      expect(get(touched).todos[2].value).to.equal(true);
      expect(get(errors).todos?.[2].value).to.deep.equal(['Invalid']);
      expect(multipleInputs[2]).toHaveValue('Third todo');
    });

    unsetField('todos.2.');

    await waitFor(() => {
      expect(get(data).todos[1].value).to.equal('Second todo');
      expect(get(touched).todos[1].value).to.equal(false);
      expect(get(errors).todos?.[1].value).to.equal(null);
      expect(multipleInputs[1]).toHaveValue('Second todo');
      expect(get(data).todos[2].value).to.equal('Fourth todo');
      expect(get(touched).todos[2].value).to.equal(false);
      expect(get(errors).todos?.[2].value).to.equal(null);
      expect(multipleInputs[2]).toHaveValue('Fourth todo');
    });

    addField('todos', { value: 'Fifth todo' });

    await waitFor(() => {
      expect(get(data).todos[2].value).to.equal('Fourth todo');
      expect(get(touched).todos[2].value).to.equal(false);
      expect(get(errors).todos[2].value).to.equal(null);
      expect(multipleInputs[2]).toHaveValue('Fourth todo');
      expect(get(data).todos[3].value).to.equal('Fifth todo');
      expect(get(touched).todos[3].value).to.equal(false);
      expect(get(errors).todos[3].value).to.equal(null);
    });

    swapFields('todos', 1, 3);

    await waitFor(() => {
      expect(get(data).todos[3].value).to.equal('Second todo');
      expect(get(touched).todos[3].value).to.equal(false);
      expect(get(errors).todos?.[3].value).to.equal(null);
      expect(get(data).todos[1].value).to.equal('Fifth todo');
      expect(get(touched).todos[1].value).to.equal(false);
      expect(get(errors).todos[1].value).to.equal(null);
    });

    moveField('todos', 3, 0);

    await waitFor(() => {
      expect(get(data).todos[0].value).to.equal('Second todo');
      expect(get(touched).todos[0].value).to.equal(false);
      expect(get(errors).todos?.[0].value).to.equal(null);
      expect(get(data).todos[1].value).to.equal('First todo');
      expect(get(touched).todos[1].value).to.equal(true);
      expect(get(errors).todos?.[1].value).to.equal(null);
    });
  });

  test('deepSetKey sets unique keys to arrays and deepRemoveKey removes them', () => {
    const data = {
      name: 'name',
      todos: {
        internal: [{ value: 'Do something', complete: false }],
        external: [{ value: 'Do something', complete: false }],
      },
    };
    const withKeys = deepSetKey(data);
    expect(withKeys).toStrictEqual({
      name: 'name',
      todos: {
        internal: [
          { value: 'Do something', complete: false, key: expect.any(String) },
        ],
        external: [
          { value: 'Do something', complete: false, key: expect.any(String) },
        ],
      },
    });
    expect(deepRemoveKey(withKeys)).toStrictEqual(data);
  });
});
