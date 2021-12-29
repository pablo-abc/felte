import { renderHook } from '@testing-library/react-hooks';
import { useForm } from '../src';
import { get } from 'svelte/store';

describe(useForm, () => {
  test('calls onSubmit without a form ref', async () => {
    const mockSubmit = jest.fn();
    const { result, waitFor } = renderHook(() =>
      useForm({ onSubmit: mockSubmit })
    );
    const submit = result.current.createSubmitHandler();
    expect(mockSubmit).not.toHaveBeenCalled();
    submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('calls onSubmit with a form ref', async () => {
    const form = document.createElement('form') as HTMLFormElement;
    const mockSubmit = jest.fn();
    const { result, waitFor } = renderHook(() =>
      useForm({ onSubmit: mockSubmit })
    );
    result.current.formRef(form);
    expect(mockSubmit).not.toHaveBeenCalled();
    form.submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('sets value with helper', async () => {
    const mockSubmit = jest.fn();
    const { result, waitFor } = renderHook(() =>
      useForm({ onSubmit: mockSubmit, initialValues: { email: '' } })
    );
    result.current.setTouched('email', true);
    expect(get(result.current.errors)).toEqual({ email: null });
    result.current.setErrors({ email: 'not an email' });
    await waitFor(() => {
      expect(get(result.current.errors)).toEqual({ email: 'not an email' });
    });
  });
});
