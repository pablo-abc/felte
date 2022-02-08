import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect } from 'chai';
import { waitFor, screen } from '@testing-library/dom';
import { createForm, FelteSubmitError } from '../src';
import { createDOM, cleanupDOM, createInputElement } from './common';
import { createRoot } from 'solid-js';

function createLoginForm() {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const emailInput = createInputElement({
    name: 'account.email',
    type: 'email',
  });
  const passwordInput = createInputElement({
    name: 'account.password',
    type: 'password',
  });
  const submitInput = createInputElement({ type: 'submit' });
  const accountFieldset = document.createElement('fieldset');
  accountFieldset.append(emailInput, passwordInput);
  formElement.append(accountFieldset, submitInput);
  return { formElement, emailInput, passwordInput, submitInput };
}

const CreateForm = suite('createForm');

CreateForm.before.each(createDOM);
CreateForm.after.each(cleanupDOM);

CreateForm('calls onSubmit without a a form', async () => {
  const mockSubmit = sinon.fake();
  const { createSubmitHandler } = createRoot(() =>
    createForm({ onSubmit: mockSubmit })
  );
  const submit = createSubmitHandler();
  sinon.assert.notCalled(mockSubmit);
  submit();
  await waitFor(() => {
    sinon.assert.called(mockSubmit);
  });
});

CreateForm('calls onSubmit with a form ref', async () => {
  const mockSubmit = sinon.fake();
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const { form } = createForm({ onSubmit: mockSubmit });
  form(formElement);
  sinon.assert.notCalled(mockSubmit);
  formElement.submit();
  await waitFor(() => {
    sinon.assert.called(mockSubmit);
  });
});

CreateForm('sets value with helper', () => {
  const mockSubmit = sinon.fake();
  const { setTouched, errors, setErrors } = createRoot(() =>
    createForm({
      onSubmit: mockSubmit,
      initialValues: { email: '' },
    })
  );
  setTouched('email', true);
  expect(errors()).to.deep.equal({ email: null });
  setErrors({ email: ['not an email'] });
  expect(errors()).to.deep.equal({ email: ['not an email'] });
});

CreateForm('updates value with helper', () => {
  type Data = {
    email: string;
  };
  const mockSubmit = sinon.fake();
  const { setTouched, setErrors, errors } = createRoot(() =>
    createForm<Data>({ onSubmit: mockSubmit, initialValues: { email: '' } })
  );
  setTouched('email', true);
  expect(errors()).to.deep.equal({ email: null });
  setErrors({ email: ['not an email'] });
  expect(errors()).to.deep.equal({ email: ['not an email'] });
  setErrors((oldErrors) => ({
    ...oldErrors,
    email: oldErrors.email?.[0].toUpperCase(),
  }));
  expect(errors()).to.deep.equal({ email: ['NOT AN EMAIL'] });
  setErrors('email', (email) => (email as string).toLowerCase());
  expect(errors()).to.deep.equal({ email: ['not an email'] });
});

CreateForm('submits with default action and file input', async () => {
  window.fetch = sinon.stub().resolves({ ok: true });
  const { form } = createRoot(() => createForm());
  const { formElement } = createLoginForm();
  formElement.action = '/example';
  formElement.method = 'post';
  const fileInput = createInputElement({ name: 'profilePic', type: 'file' });
  formElement.appendChild(fileInput);
  form(formElement);
  formElement.submit();

  await waitFor(() => {
    sinon.assert.calledWith(
      window.fetch as any,
      sinon.match('/example'),
      sinon.match({
        body: sinon.match.instanceOf(FormData),
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  });
});

CreateForm('submits with default action and throws', async () => {
  window.fetch = sinon.stub().resolves({ ok: false });
  const onError = sinon.fake();
  const eventOnError = sinon.fake();
  const { form } = createRoot(() => createForm({ onError }));
  const { formElement } = createLoginForm();
  formElement.action = '/example';
  formElement.method = 'post';
  formElement.addEventListener('felteerror', eventOnError);
  form(formElement);
  formElement.submit();

  await waitFor(() => {
    sinon.assert.calledWith(
      window.fetch as any,
      sinon.match('/example'),
      sinon.match({
        body: sinon.match.instanceOf(URLSearchParams),
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    );
    sinon.assert.calledWith(
      onError,
      sinon.match.instanceOf(FelteSubmitError),
      sinon.match.any
    );
    sinon.assert.calledWith(
      eventOnError,
      sinon.match({
        detail: sinon.match({
          error: sinon.match.instanceOf(FelteSubmitError),
        }),
      })
    );
  });
});

CreateForm.run();
