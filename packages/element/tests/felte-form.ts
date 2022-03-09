import { suite } from 'uvu';
import * as sinon from 'sinon';
import { expect } from 'uvu-expect';
import { waitFor } from '@testing-library/dom';
import { cleanupDOM } from './common';
import { prepareForm } from '../src';

const FelteForm = suite('FelteForm');

FelteForm.after.each(cleanupDOM);

FelteForm('calls on submit', async () => {
  const onSubmit = sinon.fake();
  prepareForm('test-form', {
    onSubmit,
  });
  const html = `
<felte-form id="test-form">
  <form>
    <input name="email">
    <input name="password">
  </form>
</felte-form>
`;
  document.body.innerHTML = html;
  const felteForm = document.querySelector(
    'felte-form'
  ) as HTMLFelteFormElement;
  expect(felteForm).to.not.be.null;
  expect(onSubmit).to.have.not.been.called;
  await expect(felteForm.ready).resolves.to.true;
  felteForm.submit();
  await waitFor(() => {
    expect(onSubmit).to.have.been.called;
  });
});

FelteForm('sets value with helper', async () => {
  const onSubmit = sinon.fake();
  prepareForm('test-form', {
    onSubmit,
  });
  const html = `
<felte-form id="test-form">
  <form>
    <input name="email">
    <input name="password">
  </form>
</felte-form>
`;
  document.body.innerHTML = html;
  const felteForm = document.querySelector(
    'felte-form'
  ) as HTMLFelteFormElement;
  expect(felteForm).to.not.be.null;
  felteForm.setInitialValues({});
  felteForm.createSubmitHandler({})();
  felteForm.setIsSubmitting(false);
  felteForm.validate();
  felteForm.setInteracted(null);
  felteForm.setData({});
  felteForm.setErrors({});
  felteForm.setFields({});
  felteForm.setTouched({});
  felteForm.setIsDirty(true);
  felteForm.addField('a', {});
  felteForm.unsetField('a');
  felteForm.moveField('a', 0, 1);
  felteForm.swapFields('a', 0, 1);
  felteForm.reset();
  felteForm.resetField('a');
  felteForm.submit();
  await new Promise((resolve) => {
    const onReady = () => {
      resolve(true);
      felteForm.removeEventListener('ready', onReady);
    };
    felteForm.addEventListener('ready', onReady);
  });
  const onTouchedChange = sinon.fake();
  const onErrorsChange = sinon.fake();
  felteForm.addEventListener('touchedchange', onTouchedChange);
  felteForm.addEventListener('errorschange', onErrorsChange);
  expect(onTouchedChange).to.have.not.been.called;
  expect(onErrorsChange).to.have.not.been.called;
  felteForm.setTouched('email', true);
  await waitFor(() => {
    expect(onTouchedChange).to.have.been.called;
    expect(felteForm.touched.email).to.be.true;
    expect(onErrorsChange).to.have.not.been.called;
    expect(felteForm.errors.email).to.be.null;
  });
  felteForm.setErrors({ email: ['Not an email'] });
  await waitFor(() => {
    expect(onErrorsChange).to.have.been.called;
    expect(felteForm.errors.email).to.deep.equal(['Not an email']);
  });
  felteForm.setData('email', 'zaphod@beeblebrox.com');
  await waitFor(() => {
    expect(felteForm.data.email).to.equal('zaphod@beeblebrox.com');
  });

  felteForm.setWarnings({ email: ['Not an email'] });
  await waitFor(() => {
    expect(felteForm.warnings.email).to.deep.equal(['Not an email']);
  });

  felteForm.setIsSubmitting(true);
  await waitFor(() => {
    expect(felteForm.isSubmitting).to.deep.equal(true);
  });
  felteForm.setIsDirty(true);
  await waitFor(() => {
    expect(felteForm.isDirty).to.deep.equal(true);
  });
  expect(felteForm.isValid).to.be.false;
  expect(felteForm.isValidating).to.be.false;
  expect(felteForm.interacted).to.be.null;
});

FelteForm('handles submit error event', async () => {
  const onSubmit = sinon.fake(() => {
    throw new Error('failed');
  });
  prepareForm('test-form', {
    onSubmit,
  });
  const html = `
<felte-form id="test-form">
  <form>
    <input name="email">
    <input name="password">
  </form>
</felte-form>
`;
  document.body.innerHTML = html;
  const felteForm = document.querySelector(
    'felte-form'
  ) as HTMLFelteFormElement;
  expect(felteForm).to.not.be.null;
  expect(onSubmit).to.have.not.been.called;
  const handleError = sinon.fake((e: Event) => {
    e.preventDefault();
  });
  felteForm.addEventListener('felteerror', handleError);
  expect(handleError).to.have.not.been.called;
  await expect(felteForm.ready).resolves.to.true;
  felteForm.submit();
  await waitFor(() => {
    expect(onSubmit).to.have.been.called;
    expect(handleError).to.have.been.called;
  });
});

FelteForm.run();
