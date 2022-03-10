import * as sinon from 'sinon';
import { suite } from 'uvu';
import { unreachable } from 'uvu/assert';
import { expect } from 'uvu-expect';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import {
  createDOM,
  cleanupDOM,
  createInputElement,
  createMultipleInputElements,
  createForm,
} from './common';
import { reporter } from '../src';

const Reporter = suite('Reporter DOM');

Reporter.before.each(createDOM);
Reporter.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

const template = `
<template>
  <ul>
    <li part="item"></li>
  </ul>
</template>
`;

Reporter('sets aria-invalid to input and removes if valid', async () => {
  const mockErrors = {
    test: 'An error',
    multiple: new Array(3).fill({ value: 'An error' }),
  };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form, validate } = createForm({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter,
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
    const mes = document.createElement('felte-validation-message');
    mes.innerHTML = template;
    mes.setAttribute('for', el.name);
    return mes;
  });
  const validationMessageElement = document.createElement(
    'felte-validation-message'
  );
  validationMessageElement.innerHTML = template;
  validationMessageElement.setAttribute('for', 'test');
  formElement.appendChild(inputElement);
  formElement.appendChild(validationMessageElement);
  formElement.append(...multipleInputs, ...multipleMessages);

  const { destroy } = form(formElement);

  await validate();

  await waitFor(() => {
    expect(inputElement).to.be.invalid;
    multipleInputs.forEach((input) => expect(input).to.be.invalid);
  });

  mockValidate.returns({} as any);

  await validate();

  await waitFor(() => {
    expect(inputElement).to.be.valid;
    multipleInputs.forEach((input) => expect(input).to.be.valid);
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
        multiple: new Array(3).fill({ value: 'An error' }),
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
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'container.test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.innerHTML = template;
    validationMessageElement.setAttribute('for', 'container.test');
    const warningMessageElement = document.createElement(
      'felte-validation-message'
    );
    warningMessageElement.innerHTML = template;
    warningMessageElement.setAttribute('for', 'container.test');
    warningMessageElement.setAttribute('level', 'warning');
    const multipleInputs = createMultipleInputElements({
      name: 'container.multiple',
      type: 'text',
    });
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('felte-validation-message');
      mes.innerHTML = template;
      mes.setAttribute('for', el.name);
      return mes;
    });
    const fieldsetElement = document.createElement('fieldset');

    const validElement = createInputElement({
      name: 'container.valid',
      type: 'text',
      id: 'test',
    });
    const validMessageElement = document.createElement(
      'felte-validation-message'
    );
    validMessageElement.innerHTML = template;
    validMessageElement.setAttribute('for', 'container.valid');
    fieldsetElement.appendChild(inputElement);
    fieldsetElement.appendChild(validationMessageElement);
    fieldsetElement.appendChild(warningMessageElement);
    fieldsetElement.append(...multipleInputs, ...multipleMessages);
    fieldsetElement.append(validElement, validMessageElement);
    formElement.appendChild(fieldsetElement);

    form(formElement);

    await validate();
    userEvent.click(inputElement);
    multipleInputs.forEach((input) => userEvent.click(input));
    userEvent.click(formElement);

    await waitFor(() => {
      expect(
        validationMessageElement.renderRoot.querySelector('ul')
      ).to.contain.html('<li part="item">An error</li>');
      expect(
        warningMessageElement.renderRoot.querySelector('ul')
      ).to.contain.html('<li part="item">A warning</li>');
      multipleMessages.forEach((mes) =>
        expect(mes.renderRoot.querySelector('ul')).to.contain.html(
          '<li part="item">An error</li>'
        )
      );
    });

    mockValidate.returns({} as any);

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).to.have.text.that.does.not.contain(
        'An error'
      );
      multipleMessages.forEach((mes) =>
        expect(mes).not.to.contain.html(
          '<li data-felte-reporter-dom-list-message="">An error</li>'
        )
      );
    });
  }
);

const spanTemplate = `
<template>
  <span part="item"></span>
</template>`;

Reporter(
  'sets error message in span if invalid and removes it if valid',
  async () => {
    const mockErrors = {
      test: 'An error',
      multiple: new Array(3).fill({ value: 'An error' }),
    };
    const mockValidate = sinon.stub().returns(mockErrors);
    const { form, validate } = createForm({
      onSubmit: sinon.fake(),
      validate: mockValidate,
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.innerHTML = spanTemplate;
    validationMessageElement.setAttribute('for', 'test');
    const multipleInputs = createMultipleInputElements({
      name: 'multiple',
      type: 'text',
    });
    const templateElement = document.createElement('template');
    templateElement.id = 'validation-message';
    templateElement.innerHTML = '<span part="item"></span>';
    formElement.appendChild(templateElement);
    const multipleMessages = multipleInputs.map((el) => {
      const mes = document.createElement('felte-validation-message');
      mes.templateId = templateElement.id;
      mes.setAttribute('for', el.name);
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
      expect(
        validationMessageElement.renderRoot.querySelector('span')
      ).to.be.html('<span part="item">An error</span>');
      multipleMessages.forEach((mes) => {
        expect(mes.renderRoot.querySelector('span')).to.contain.html(
          '<span part="item">An error</span>'
        );
      });
    });

    mockValidate.returns({} as any);

    await validate();

    await waitFor(() => {
      expect(validationMessageElement).to.have.text.that.does.not.contain(
        'An error'
      );
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
      extend: reporter,
    });

    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
      id: 'test',
    });
    const validationMessageElement = document.createElement(
      'felte-validation-message'
    );
    validationMessageElement.setAttribute('for', 'test');
    validationMessageElement.setAttribute('max', '1');
    validationMessageElement.innerHTML = spanTemplate;
    formElement.appendChild(inputElement);
    formElement.appendChild(validationMessageElement);

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(inputElement).to.equal(document.activeElement);
      expect(
        validationMessageElement.renderRoot.querySelector('span')
      ).to.have.text.that.contains('A test error');
    });
  }
);

Reporter('throws error when no `for` attribute is given', async () => {
  const element = document.createElement('felte-validation-message');
  try {
    (element as any)._start('test-id');
    unreachable();
  } catch (err: any) {
    expect(err.message).to.equal(
      '<felte-validation-message> requires a `for` attribute'
    );
  }
});

Reporter('throws error when not a child of a form', () => {
  const element = document.createElement('felte-validation-message');
  element.setAttribute('for', 'email');
  const template = document.createElement('template');
  element.appendChild(template);
  const span = document.createElement('span');
  span.setAttribute('part', 'item');
  template.content.appendChild(span);
  try {
    element.connectedCallback();
    unreachable();
  } catch (err) {
    expect(err)
      .to.have.property('message')
      .that.equals(
        '<felte-validation-message> must be a child of a <form> element'
      );
  }
});

Reporter('calls start on load event', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const element = document.createElement('felte-validation-message');
  const spy = sinon.stub(element as any, '_start').returns(true);

  (element as any)._handleLoad({
    currentTarget: formElement,
  });

  expect(spy).to.not.have.been.called;

  formElement.dataset.felteReporterElementId = 'test-id';
  (element as any)._handleLoad({
    currentTarget: formElement,
  });
  await waitFor(() => {
    expect(spy).to.have.been.called.once;
  });

  spy.resetHistory();

  (element as any).formElement = formElement;
  (element as any)._handleLoad({
    currentTarget: formElement,
  });
  await waitFor(() => {
    expect(spy).to.have.been.called.once;
  });
});

Reporter('does not fail without a template', () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const element = document.createElement('felte-validation-message');
  formElement.appendChild(element);
  element.setAttribute('for', 'email');

  expect(element.connectedCallback()).to.be.undefined;
});

Reporter('does not fail without an item', () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const element = document.createElement('felte-validation-message');
  const template = document.createElement('template');
  element.appendChild(template);
  formElement.appendChild(element);
  element.setAttribute('for', 'email');

  expect(element.connectedCallback()).to.be.undefined;
});

Reporter('does not fail with a template on a parent shadow root', () => {
  const div = document.createElement('div');
  div.attachShadow({ mode: 'open' });
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const element = document.createElement('felte-validation-message');
  element.setAttribute('templateid', 'template');
  const template = document.createElement('template');
  template.id = 'template';
  div.shadowRoot?.append(formElement, template);
  formElement.appendChild(element);
  element.setAttribute('for', 'email');

  expect(element.connectedCallback()).to.be.undefined;
});

Reporter.run();
