import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from '../src';

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

  test('sets value with helper', () => {
    const mockSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({ onSubmit: mockSubmit, initialValues: { email: '' } })
    );
    act(() => result.current.setTouched('email', true));
    expect(result.current.errors()).toEqual({ email: null });
    act(() => result.current.setErrors({ email: 'not an email' }));
    expect(result.current.errors()).toEqual({ email: 'not an email' });
  });
});
