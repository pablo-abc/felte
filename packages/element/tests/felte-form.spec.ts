import { suite } from 'uvu';
import { unreachable } from 'uvu/assert';
import * as sinon from 'sinon';
import { expect } from 'uvu-expect';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { cleanupDOM } from './common';
import { prepareForm } from '../src';

const FelteForm = suite('FelteForm');

function waitForReady(form: HTMLFelteFormElement) {
  return new Promise((resolve) => {
    form.onfelteready = () => resolve(true);
  });
}

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
  expect(felteForm.ready).to.be.false;
  await expect(waitForReady(felteForm)).resolves.to.true;
  expect(felteForm.ready).to.be.true;
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
  const html = /* HTML */ `
    <felte-form id="test-form">
      <form>
        <input name="email" />
        <input name="password" />
      </form>
    </felte-form>
  `;
  document.body.innerHTML = html;
  const felteForm = document.querySelector(
    'felte-form'
  ) as HTMLFelteFormElement;
  expect(felteForm).to.not.be.null;
  try {
    felteForm.setInitialValues({});
    unreachable();
  } catch (err) {
    expect(err)
      .to.have.property('message')
      .that.equals(
        'Can\'t call "setInitialValues" on HTMLFelteFormElement. The element is not ready yet.'
      );
  }
  await new Promise((resolve) => {
    const onReady = () => {
      resolve(true);
      felteForm.removeEventListener('felteready', onReady);
    };
    felteForm.addEventListener('felteready', onReady);
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
  const html = /* HTML */ `
    <felte-form id="test-form">
      <form>
        <input name="email" />
        <input name="password" />
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
  await waitForReady(felteForm);
  felteForm.submit();
  await waitFor(() => {
    expect(onSubmit).to.have.been.called;
    expect(handleError).to.have.been.called;
  });
});

FelteForm('sets configuration using method', async () => {
  const onSubmit = sinon.fake();
  const html = /* HTML */ `
    <felte-form>
      <form>
        <input name="email" />
        <input name="password" />
        <button type="submit">Submit</button>
      </form>
    </felte-form>
  `;
  document.body.innerHTML = html;
  const felteForm = document.querySelector(
    'felte-form'
  ) as HTMLFelteFormElement;
  expect(felteForm).to.not.be.null;
  felteForm.setConfiguration({ onSubmit });
  await waitForReady(felteForm);
  const button = screen.queryByRole('button', {
    name: 'Submit',
  }) as HTMLButtonElement;
  userEvent.click(button);
  await waitFor(() => {
    expect(onSubmit).to.have.been.called.with(
      {
        email: '',
        password: '',
      },
      expect.match.any
    );
  });
});

FelteForm('changes configuration after load', async () => {
  const onSubmit = sinon.fake();
  const html = /* HTML */ `
    <felte-form>
      <form>
        <input name="email" />
        <input name="password" />
        <button type="submit">Submit</button>
      </form>
    </felte-form>
  `;
  document.body.innerHTML = html;
  const felteForm = document.querySelector(
    'felte-form'
  ) as HTMLFelteFormElement;
  expect(felteForm).to.not.be.null;
  felteForm.setConfiguration({ onSubmit });
  await waitForReady(felteForm);
  const button = screen.queryByRole('button', {
    name: 'Submit',
  }) as HTMLButtonElement;
  userEvent.click(button);
  await waitFor(() => {
    expect(onSubmit).to.have.been.called.with(
      {
        email: '',
        password: '',
      },
      expect.match.any
    );
  });

  onSubmit.resetHistory();
  const altOnSubmit = sinon.fake();
  felteForm.setConfiguration({ onSubmit: altOnSubmit });
  userEvent.click(button);
  await waitFor(() => {
    expect(onSubmit).to.have.not.been.called;
    expect(altOnSubmit).to.have.been.called;
  });
});

FelteForm.run();
