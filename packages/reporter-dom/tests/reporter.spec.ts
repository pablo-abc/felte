import * as sinon from 'sinon';
import { createForm } from 'felte';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom = require('chai-dom');
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import {
  createDOM,
  cleanupDOM,
  createInputElement,
  createMultipleInputElements,
} from './common';
import reporter from '../src';
use(chaiDom);

const Reporter = suite('Reporter DOM');

Reporter.before.each(createDOM);
Reporter.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

Reporter('sets aria-invalid to input and removes if valid', async () => {
  const mockErrors = {
    test: 'An error',
    multiple: new Array(3).fill('An error'),
  };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form, validate } = createForm({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });
  const multipleInputs = createMultipleInputElements({
    name: 'multiple',
    type: 'text',
  });
  const multipleMessages = multipleInputs.map((el) => {
    const mes = document.createElement('div');
    mes.setAttribute('data-felte-reporter-dom-for', el.name);
    return mes;
  });
  const validationMessageElement = document.createElement('div');
  validationMessageElement.setAttribute('data-felte-reporter-dom-for', 'test');
  formElement.appendChild(inputElement);
  formElement.appendChild(validationMessageElement);
  formElement.append(...multipleInputs, ...multipleMessages);

  const { destroy } = form(formElement);

  await validate();

  await waitFor(() => {
    expect(inputElement).to.have.attribute('aria-invalid');
    multipleInputs.forEach((input) =>
      expect(input).to.have.attribute('aria-invalid')
    );
  });

  mockValidate.returns({} as any);

  await validate();

  await waitFor(() => {
    expect(inputElement).not.to.have.attribute('aria-invalid');
    multipleInputs.forEach((input) =>
      expect(input).not.to.have.attribute('aria-invalid')
    );
  });

  destroy();
});

Reporter(
  'sets error message in list if invalid and removes it if valid',
  async () => {
    type Data = {
      container: {
        test: string;
        multiple: string[];
      };
    };
    const mockErrors = {
      container: {
        test: 'An error',
        multiple: new Array(3).fill('An error'),
      },
    };
    const mockWarnings = {
      container: {
        test: 'A warning',
      },
    };
    const mockValidate = sinon.stub().returns(mockErrors);
    const mockWarn = sinon.stub().returns(mockWarnings);
    const { form, validate } = createForm<Data>({
      onSubmit: sinon.fake(),
      validate: mockValidate,
      warn: mockWarn,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'container.test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'container.test'
    );
    const warningMessageElement = document.createElement('div');
    warningMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'container.test'
    );
    warningMessageElement.setAttribute(
      'data-felte-reporter-dom-level',
      'warning'
    );
    const multipleInputs = createMultipleInputElements({
      name: 'container.multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
      return mes;
    });
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.appendChild(inputElement);
    fieldsetElement.appendChild(validationMessageElement);
    fieldsetElement.appendChild(warningMessageElement);
    fieldsetElement.append(...multipleInputs, ...multipleMessages);
    formElement.appendChild(fieldsetElement);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    multipleInputs.forEach((input) => userEvent.click(input));
    userEvent.click(formElement);

    await waitFor(() => {
      expect(validationMessageElement).to.contain.html(
        '<li data-felte-reporter-dom-list-message="">An error</li>'
      );
      expect(warningMessageElement).to.contain.html(
        '<li data-felte-reporter-dom-list-message="">A warning</li>'
      );
      multipleMessages.forEach((mes) =>
        expect(mes).to.contain.html(
          '<li data-felte-reporter-dom-list-message="">An error</li>'
        )
      );
    });

    mockValidate.returns({} as any);

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.to.contain.text('An error');
      multipleMessages.forEach((mes) =>
        expect(mes).not.to.contain.html(
          '<li data-felte-reporter-dom-list-message="">An error</li>'
        )
      );
    });
  }
);

Reporter(
  'sets error message in span if invalid and removes it if valid',
  async () => {
    const mockErrors = {
      test: 'An error',
      multiple: new Array(3).fill('An error'),
    };
    const mockValidate = sinon.stub().returns(mockErrors);
    const { form, validate } = createForm({
      onSubmit: sinon.fake(),
      validate: mockValidate,
      extend: reporter({ single: true }),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    const multipleInputs = createMultipleInputElements({
      name: 'multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('div');
      mes.setAttribute('data-felte-reporter-dom-for', el.name);
      return mes;
    });
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);
    formElement.append(...multipleInputs, ...multipleMessages);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    multipleInputs.forEach((input) => userEvent.click(input));
    userEvent.click(formElement);

    await waitFor(() => {
      expect(validationMessageElement).to.contain.html(
        '<span aria-live="polite" data-felte-reporter-dom-single-message="">An error</span>'
      );
      multipleMessages.forEach((mes) =>
        expect(mes).to.contain.html(
          '<span aria-live="polite" data-felte-reporter-dom-single-message="">An error</span>'
        )
      );
    });

    mockValidate.returns({} as any);

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).not.to.contain.text('An error');
      multipleMessages.forEach((mes) =>
        expect(mes).not.to.contain.html(
          '<span aria-live="polite" data-felte-reporter-dom-single-message="">An error</span>'
        )
      );
    });
  }
);

Reporter(
  'focuses first invalid input and shows validation message on submit',
  async () => {
    const mockErrors = { test: 'A test error' };
    const mockValidate = sinon.fake(() => mockErrors);
    const { form } = createForm({
      onSubmit: sinon.fake(),
      validate: mockValidate,
      extend: reporter(),
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement('div');
    validationMessageElement.setAttribute(
      'data-felte-reporter-dom-for',
      'test'
    );
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).to.equal(document.activeElement);
      expect(validationMessageElement).to.contain.text('A test error');
    });
  }
);

Reporter('sets classes for reporter list elements', async () => {
  type Data = {
    container: {
      test: string;
    };
  };
  const mockErrors = { container: { test: 'An error' } };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form, validate } = createForm<Data>({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter({
      listItemAttributes: {
        class: 'li-class',
      },
      listAttributes: {
        class: 'ul-class',
      },
    }),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'container.test',
    type: 'text',
    id: 'test',
  });
  const validationMessageElement = document.createElement('div');
  validationMessageElement.setAttribute(
    'data-felte-reporter-dom-for',
    'container.test'
  );
  const fieldsetElement = document.createElement('fieldset');
  fieldsetElement.appendChild(inputElement);
  fieldsetElement.appendChild(validationMessageElement);
  formElement.appendChild(fieldsetElement);

  form(formElement);

  await validate();
  userEvent.click(inputElement);
  userEvent.click(formElement);

  await waitFor(() => {
    const listElement = validationMessageElement.querySelector('ul');
    const messageElement = validationMessageElement.querySelector('li');
    expect(listElement).to.have.class('ul-class');
    expect(messageElement).to.have.class('li-class');
  });

  mockValidate.returns({});

  await validate();

  await waitFor(() => {
    expect(validationMessageElement).not.to.contain.text('An error');
  });
});

Reporter('sets classes for reporter single elements', async () => {
  type Data = {
    container: {
      test: string;
    };
  };
  const mockErrors = { container: { test: 'An error' } };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form, validate } = createForm<Data>({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter({
      single: true,
      singleAttributes: {
        class: 'span-class',
      },
    }),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'container.test',
    type: 'text',
    id: 'test',
  });
  const validationMessageElement = document.createElement('div');
  validationMessageElement.setAttribute(
    'data-felte-reporter-dom-for',
    'container.test'
  );
  const fieldsetElement = document.createElement('fieldset');
  fieldsetElement.appendChild(inputElement);
  fieldsetElement.appendChild(validationMessageElement);
  formElement.appendChild(fieldsetElement);

  form(formElement);

  await validate();
  userEvent.click(inputElement);
  userEvent.click(formElement);

  await waitFor(() => {
    const messageElement = validationMessageElement.querySelector('span');
    expect(messageElement).to.have.class('span-class');
  });

  mockValidate.returns({});

  await validate();

  await waitFor(() => {
    expect(validationMessageElement).not.to.contain.text('An error');
  });
});

Reporter.run();
