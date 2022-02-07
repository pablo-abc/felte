import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom from 'chai-jsdom';
import { waitFor, screen } from '@testing-library/dom';
import { writable, get } from 'svelte/store';
import userEvent from '@testing-library/user-event';
import {
  createInputElement,
  createMultipleInputElements,
  createDOM,
  cleanupDOM,
} from './common';
import { createForm } from '../src';
use(chaiDom);

const Helpers = suite('Helpers');

Helpers.before.each(createDOM);

Helpers.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

Helpers('setFields should update and touch field', async () => {
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
    onSubmit: sinon.fake(),
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

Helpers('setField should update without touching field', () => {
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
    onSubmit: sinon.fake(),
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

Helpers('setFields should set all fields', () => {
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
    onSubmit: sinon.fake(),
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

Helpers('setTouched should touch field', () => {
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
    onSubmit: sinon.fake(),
  });

  expect(get(touched).account.email).to.equal(false);
  setTouched('account.email', true);
  expect(get(touched)).to.deep.equal({
    account: {
      email: true,
    },
  });
});

Helpers('setError should set a field error when touched', () => {
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
    onSubmit: sinon.fake(),
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

Helpers('setWarning should set a field warning', () => {
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
    onSubmit: sinon.fake(),
  });

  expect(get(warnings)?.account?.email).to.be.null;
  setWarnings('account.email', 'Not an email');
  expect(get(warnings)).to.deep.equal({
    account: {
      email: ['Not an email'],
    },
  });
});

Helpers('validate should force validation', async () => {
  type Data = {
    account: {
      email: string;
    };
  };
  const mockErrors = { account: { email: 'Not email' } };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { errors, touched, validate } = createForm<Data>({
    initialValues: {
      account: {
        email: '',
      },
    },
    validate: mockValidate,
    onSubmit: sinon.fake(),
  });

  sinon.assert.calledOnce(mockValidate);
  validate();
  sinon.assert.calledTwice(mockValidate);
  await waitFor(() => {
    expect(get(errors)).to.deep.equal({ account: { email: ['Not email'] } });
    expect(get(touched)).to.deep.equal({
      account: {
        email: true,
      },
    });
  });

  mockValidate.returns({});
  validate();
  sinon.assert.calledThrice(mockValidate);
  await waitFor(() => {
    expect(get(errors)).to.deep.equal({ account: { email: null } });
    expect(get(touched)).to.deep.equal({
      account: {
        email: true,
      },
    });
  });
});

Helpers('reset should reset form to default values', () => {
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
  const { data, touched, reset, form, isDirty, setFields } = createForm<Data>({
    initialValues: {
      account: {
        email: '',
      },
    },
    onSubmit: sinon.fake(),
  });

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

Helpers('setInitialValues sets new initial values', () => {
  type Data = {
    account: {
      email: string;
    };
  };
  const {
    data,
    setInitialValues,
    touched,
    setFields,
    reset,
  } = createForm<Data>({
    initialValues: {
      account: {
        email: '',
      },
    },
    onSubmit: sinon.fake(),
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

Helpers('get gets current value of store', () => {
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

Helpers('unsetField removes a field from all stores', async () => {
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
  const {
    form,
    data,
    touched,
    errors,
    warnings,
    unsetField,
  } = createForm<Data>({
    initialValues: {
      account: {
        email: '',
      },
    },
    onSubmit: sinon.fake(),
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
    expect(inputElement).to.not.have.a.value;
  });
});

Helpers('resetField resets a field to its initial value', async () => {
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
    onSubmit: sinon.fake(),
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
    expect(inputElement).to.have.value.that.equals('zaphod@beeblebrox.com');
  });
});

Helpers(
  'addField and unsetField add and remove fields accordingly',
  async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const multipleInputs = createMultipleInputElements(
      {
        name: 'todos',
      },
      3
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
      onSubmit: sinon.fake(),
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
      expect(multipleInputs[1]).to.have.value.that.equals('Second todo');
      expect(get(data).todos[2].value).to.equal('Third todo');
      expect(get(touched).todos[2].value).to.equal(true);
      expect(get(errors).todos?.[2].value).to.deep.equal(['Invalid']);
      expect(multipleInputs[2]).to.have.value.that.equals('Third todo');
    });

    unsetField('todos.2.');

    await waitFor(() => {
      expect(get(data).todos[1].value).to.equal('Second todo');
      expect(get(touched).todos[1].value).to.equal(false);
      expect(get(errors).todos?.[1].value).to.equal(null);
      expect(multipleInputs[1]).to.have.value.that.equals('Second todo');
      expect(get(data).todos[2].value).to.equal('Fourth todo');
      expect(get(touched).todos[2].value).to.equal(false);
      expect(get(errors).todos?.[2].value).to.equal(null);
      expect(multipleInputs[2]).to.have.value.that.equals('Fourth todo');
    });

    addField('todos', { value: 'Fifth todo' });

    await waitFor(() => {
      expect(get(data).todos[2].value).to.equal('Fourth todo');
      expect(get(touched).todos[2].value).to.equal(false);
      expect(get(errors).todos[2].value).to.equal(null);
      expect(multipleInputs[2]).to.have.value.that.equals('Fourth todo');
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
  }
);

Helpers.run();
