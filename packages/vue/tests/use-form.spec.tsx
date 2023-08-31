import { expect, describe, test, vi } from 'vitest';
import { waitFor } from '@testing-library/dom';
import { get } from 'svelte/store';
import { nextTick } from 'vue';
import { useForm } from '../src';

vi.mock('vue', async () => ({
  ...(await vi.importActual<object>('vue')),
  onMounted: vi.fn((fn) => fn()),
  onUnmounted: vi.fn(),
}));

describe('useForm', () => {
  test('calls onSubmit without a form ref', async () => {
    const mockSubmit = vi.fn();
    const { createSubmitHandler } = useForm({ onSubmit: mockSubmit });
    const submit = createSubmitHandler();
    expect(mockSubmit).not.toHaveBeenCalled();
    submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('calls onSubmit with a form ref', async () => {
    const mockSubmit = vi.fn();
    const { vForm } = useForm({ onSubmit: mockSubmit });
    const formElement = document.createElement('form');
    vForm.mounted(formElement);
    expect(mockSubmit).not.toHaveBeenCalled();
    formElement.submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('sets value with helper', async () => {
    const mockSubmit = vi.fn();
    const { vForm, setTouched, setErrors, errors } = useForm({
      onSubmit: mockSubmit,
      initialValues: { email: '' },
    });
    const formElement = document.createElement('form');
    vForm.mounted(formElement);
    setTouched('email', true);
    await nextTick();
    expect(get(errors)).to.deep.equal({ email: null });
    expect(errors().value).to.deep.equal({ email: null });
    const emailRef = errors('email');
    expect(emailRef.value).to.equal(null);
    setErrors({ email: ['not an email'] });
    await nextTick();
    expect(get(errors)).to.deep.equal({ email: ['not an email'] });
    expect(errors().value).to.deep.equal({ email: ['not an email'] });
    expect(emailRef.value).to.deep.equal(['not an email']);
    vForm.unmounted(formElement);
  });

  test('updates value with helper', async () => {
    type Data = {
      email: string;
    };
    const mockSubmit = vi.fn();
    const { vForm, setTouched, errors, setErrors } = useForm<Data>({
      onSubmit: mockSubmit,
      initialValues: { email: '' },
    });
    const formElement = document.createElement('form');
    vForm.mounted(formElement);
    setTouched('email', true);
    await nextTick();
    expect(get(errors)).to.deep.equal({ email: null });
    setErrors({ email: ['not an email'] });
    await nextTick();
    expect(get(errors)).to.deep.equal({ email: ['not an email'] });
    setErrors((oldErrors) => ({
      ...oldErrors,
      email: oldErrors.email?.[0].toUpperCase(),
    }));
    await nextTick();
    expect(get(errors)).to.deep.equal({ email: ['NOT AN EMAIL'] });
    setErrors('email', (email) => (email as string).toLowerCase());
    await nextTick();
    expect(get(errors)).to.deep.equal({ email: ['not an email'] });
  });
});
