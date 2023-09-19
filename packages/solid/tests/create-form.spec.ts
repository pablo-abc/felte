import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, screen } from '@testing-library/dom';
import { createForm, FelteSubmitError } from '../src';
import { createDOM, cleanupDOM, createInputElement } from './common';
import { createRoot } from 'solid-js';
import h from 'solid-js/h';

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

describe('createForm', () => {
  beforeEach(createDOM);
  afterEach(cleanupDOM);

  test('calls onSubmit without a a form', async () => {
    const mockSubmit = vi.fn();
    const { createSubmitHandler } = createRoot(() =>
      createForm({ onSubmit: mockSubmit })
    );
    const submit = createSubmitHandler();
    expect(mockSubmit).not.toHaveBeenCalled();
    submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('calls onSubmit with a form ref', async () => {
    const mockSubmit = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const { form } = createForm({ onSubmit: mockSubmit });
    form(formElement);
    expect(mockSubmit).not.toHaveBeenCalled();
    formElement.submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('sets value with helper', () => {
    const mockSubmit = vi.fn();
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

  test('sets value with props', async () => {
    const mockSubmit = vi.fn();

    const expected = { email: 'name@domain.com' };

    const { form, data, createSubmitHandler } = createRoot(() =>
      createForm({
        onSubmit: mockSubmit,
      })
    );

    createRoot<HTMLFormElement>(
      h('form', { ref: form }, [
        h('input', { type: 'email', name: 'email', value: expected.email }),
      ])
    );

    expect(data()).toMatchObject(expected);

    const submit = createSubmitHandler();
    await submit();

    expect(mockSubmit).toHaveBeenCalledOnce();
    expect(mockSubmit.mock.lastCall[0]).toMatchObject(expected);
  });

  test('updates value with helper', () => {
    type Data = {
      email: string;
    };
    const mockSubmit = vi.fn();
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

  test('submits with default action and file input', async () => {
    window.fetch = vi.fn().mockResolvedValue({ ok: true });
    const { form } = createRoot(() => createForm());
    const { formElement } = createLoginForm();
    formElement.action = '/example';
    formElement.method = 'post';
    const fileInput = createInputElement({ name: 'profilePic', type: 'file' });
    formElement.appendChild(fileInput);
    form(formElement);
    formElement.submit();

    await waitFor(() => {
      expect(window.fetch as any).toHaveBeenCalledWith(
        expect.stringContaining('/example'),
        expect.objectContaining({
          body: expect.any(FormData),
          method: 'post',
          headers: expect.objectContaining({}),
        })
      );
    });
  });

  test('submits with default action and throws', async () => {
    window.fetch = vi.fn().mockResolvedValue({ ok: false });
    const onError = vi.fn();
    const eventOnError = vi.fn();
    const { form } = createRoot(() => createForm({ onError }));
    const { formElement } = createLoginForm();
    formElement.action = '/example';
    formElement.method = 'post';
    formElement.addEventListener('felteerror', eventOnError);
    form(formElement);
    formElement.submit();

    await waitFor(() => {
      expect(window.fetch as any).toHaveBeenCalledWith(
        expect.stringContaining('/example'),
        expect.objectContaining({
          body: expect.any(URLSearchParams),
          method: 'post',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
      expect(onError).toHaveBeenCalledWith(
        expect.any(FelteSubmitError),
        expect.anything()
      );
      expect(eventOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            error: expect.any(FelteSubmitError),
          }),
        })
      );
    });
  });
});
