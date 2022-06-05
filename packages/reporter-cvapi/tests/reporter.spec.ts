import * as sinon from 'sinon';
import { createForm } from 'felte';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import { createDOM, cleanupDOM, createInputElement } from './common';
import reporter from '../src';

const Reporter = suite('Reporter CVAPI');

Reporter.before.each(createDOM);
Reporter.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

Reporter('sets input to invalid', async () => {
  const mockErrors = { test: 'An error' };
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
  formElement.appendChild(inputElement);

  const { destroy } = form(formElement);

  await validate();

  await waitFor(() => {
    expect(inputElement.checkValidity()).to.be.false;
    expect(inputElement.validationMessage).to.equal(mockErrors.test);
  });

  mockValidate.returns({});

  await validate();

  await waitFor(() => {
    expect(inputElement.checkValidity()).to.be.true;
  });

  destroy();
});

Reporter('focuses first invalid input and sets validity', async () => {
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
  });
  const submitElement = createInputElement({ type: 'submit' });
  formElement.appendChild(inputElement);
  formElement.appendChild(submitElement);

  form(formElement);

  userEvent.click(submitElement);

  await waitFor(() => {
    expect(inputElement).to.be.focused;
    expect(inputElement.validationMessage).to.equal(mockErrors.test);
  });
});

Reporter('does not focus first invalid input and sets validity', async () => {
  const mockErrors = { test: 'A test error' };
  const mockValidate = sinon.fake(() => mockErrors);
  const { form } = createForm({
    onSubmit: () => undefined,
    validate: mockValidate,
    extend: reporter({ preventFocusOnError: true }),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });
  const submitElement = createInputElement({ type: 'submit' });
  formElement.appendChild(inputElement);
  formElement.appendChild(submitElement);

  form(formElement);

  userEvent.click(submitElement);

  await waitFor(() => {
    expect(inputElement).to.not.be.focused;
    expect(inputElement.validationMessage).to.equal(mockErrors.test);
  });
});

Reporter.run();
