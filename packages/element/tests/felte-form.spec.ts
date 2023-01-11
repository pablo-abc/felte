import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, afterEach } from 'vitest';
import { waitFor, screen } from '@testing-library/dom';
import { AssertionError } from 'node:assert';
import userEvent from '@testing-library/user-event';
import { cleanupDOM } from './common';
import '../src/felte-form';
import { prepareForm } from '../src';

expect.extend(matchers);

function waitForReady(form: HTMLFelteFormElement) {
  return new Promise((resolve) => {
    form.onFelteReady = () => resolve(true);
  });
}

describe('FelteForm', () => {
  afterEach(cleanupDOM);
  test('calls on submit', async () => {
    const onSubmit = vi.fn();
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
    expect(onSubmit).not.toHaveBeenCalled();
    expect(felteForm.ready).to.be.false;
    await expect(waitForReady(felteForm)).resolves.toBe(true);
    expect(felteForm.ready).to.be.true;
    felteForm.submit();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  test('sets value with helper', async () => {
    const onSubmit = vi.fn();
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
      throw new AssertionError({ message: 'Should not get here' });
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
    const onTouchedChange = vi.fn();
    const onErrorsChange = vi.fn();
    felteForm.addEventListener('touchedchange', onTouchedChange);
    felteForm.addEventListener('errorschange', onErrorsChange);
    expect(onTouchedChange).not.toHaveBeenCalled();
    expect(onErrorsChange).not.toHaveBeenCalled();
    felteForm.setTouched('email', true);
    await waitFor(() => {
      expect(onTouchedChange).toHaveBeenCalled();
      expect(felteForm.touched.email).to.be.true;
      expect(onErrorsChange).not.toHaveBeenCalled();
      expect(felteForm.errors.email).to.be.null;
    });
    felteForm.setErrors({ email: ['Not an email'] });
    await waitFor(() => {
      expect(onErrorsChange).toHaveBeenCalled();
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
    await waitFor(() => {
      expect(felteForm.isValid).to.be.false;
      expect(felteForm.isValidating).to.be.false;
      expect(felteForm.interacted).to.be.null;
    });
  });

  test('handles submit error event', async () => {
    const onSubmit = vi.fn(() => {
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
    expect(onSubmit).not.toHaveBeenCalled();
    const handleError = vi.fn((e: Event) => {
      e.preventDefault();
    });
    felteForm.addEventListener('felteerror', handleError);
    expect(handleError).not.toHaveBeenCalled();
    await waitForReady(felteForm);
    felteForm.submit();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(handleError).toHaveBeenCalled();
    });
  });

  test('sets configuration using method', async () => {
    const onSubmit = vi.fn();
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
    felteForm.configuration = { onSubmit };
    await waitForReady(felteForm);
    const button = screen.queryByRole('button', {
      name: 'Submit',
    }) as HTMLButtonElement;
    userEvent.click(button);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          email: '',
          password: '',
        },
        expect.anything()
      );
    });
  });

  test('changes configuration after load', async () => {
    const onSubmit = vi.fn();
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
    felteForm.configuration = { onSubmit };
    await waitForReady(felteForm);
    const button = screen.queryByRole('button', {
      name: 'Submit',
    }) as HTMLButtonElement;
    userEvent.click(button);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          email: '',
          password: '',
        },
        expect.anything()
      );
    });

    onSubmit.mockClear();
    const altOnSubmit = vi.fn();
    felteForm.configuration = { onSubmit: altOnSubmit };
    userEvent.click(button);
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(altOnSubmit).toHaveBeenCalled();
    });
  });
});
