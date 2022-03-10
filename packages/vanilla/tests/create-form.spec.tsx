import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { waitFor } from '@testing-library/dom';
import { get } from 'svelte/store';
import { createForm } from '../src';

const UseForm = suite('createForm');

UseForm('calls onSubmit without a form ref', async () => {
  const mockSubmit = sinon.fake();
  const { createSubmitHandler } = createForm({ onSubmit: mockSubmit });
  const submit = createSubmitHandler();
  sinon.assert.notCalled(mockSubmit);
  submit();
  await waitFor(() => {
    sinon.assert.called(mockSubmit);
  });
});

UseForm('calls onSubmit with a form ref', async () => {
  const mockSubmit = sinon.fake();
  const { form } = createForm({ onSubmit: mockSubmit });
  const formElement = document.createElement('form');
  form(formElement);
  sinon.assert.notCalled(mockSubmit);
  formElement.submit();
  await waitFor(() => {
    sinon.assert.called(mockSubmit);
  });
});

UseForm('sets value with helper', () => {
  const mockSubmit = sinon.fake();
  const { form, setTouched, setErrors, errors } = createForm({
    onSubmit: mockSubmit,
    initialValues: { email: '' },
  });
  const formElement = document.createElement('form');
  const { destroy } = form(formElement);
  setTouched('email', true);
  expect(get(errors)).to.deep.equal({ email: null });
  setErrors({ email: ['not an email'] });
  expect(get(errors)).to.deep.equal({ email: ['not an email'] });
  destroy?.();
});

UseForm('updates value with helper', () => {
  type Data = {
    email: string;
  };
  const mockSubmit = sinon.fake();
  const { form, setTouched, errors, setErrors } = createForm<Data>({
    onSubmit: mockSubmit,
    initialValues: { email: '' },
  });
  const formElement = document.createElement('form');
  form(formElement);
  setTouched('email', true);
  expect(get(errors)).to.deep.equal({ email: null });
  setErrors({ email: ['not an email'] });
  expect(get(errors)).to.deep.equal({ email: ['not an email'] });
  setErrors((oldErrors) => ({
    ...oldErrors,
    email: oldErrors.email?.[0].toUpperCase(),
  }));
  expect(get(errors)).to.deep.equal({ email: ['NOT AN EMAIL'] });
  setErrors('email', (email) => (email as string).toLowerCase());
  expect(get(errors)).to.deep.equal({ email: ['not an email'] });
});

UseForm.run();
