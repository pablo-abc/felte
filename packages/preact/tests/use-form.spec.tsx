// eslint-disable-next-line
import { h } from 'preact';
import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/preact';
import { renderHook, act } from '@testing-library/preact-hooks';
import { useForm } from '../src';

expect.extend(matchers);

describe('useForm', () => {
  test('calls onSubmit without a form ref', async () => {
    const mockSubmit = vi.fn();
    const { result } = renderHook(() => useForm({ onSubmit: mockSubmit }));
    const submit = result.current?.createSubmitHandler();
    expect(mockSubmit).not.toHaveBeenCalled();
    submit?.();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('calls onSubmit with a form ref', async () => {
    const mockSubmit = vi.fn();
    function Form() {
      const { form } = useForm({ onSubmit: mockSubmit });
      return <form name="test-form" ref={form} />;
    }
    render(<Form />);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    expect(mockSubmit).not.toHaveBeenCalled();
    formElement.submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('sets value with helper', () => {
    const mockSubmit = vi.fn();
    const { result, unmount } = renderHook(() =>
      useForm({ onSubmit: mockSubmit, initialValues: { email: '' } })
    );
    act(() => result.current?.setTouched('email', true));
    expect(result.current?.errors()).to.deep.equal({ email: null });
    act(() => result.current?.setErrors({ email: ['not an email'] }));
    expect(result.current?.errors()).to.deep.equal({ email: ['not an email'] });
    unmount();
  });

  test('updates value with helper', () => {
    type Data = {
      email: string;
    };
    const mockSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<Data>({ onSubmit: mockSubmit, initialValues: { email: '' } })
    );
    act(() => result.current?.setTouched('email', true));
    expect(result.current?.errors()).to.deep.equal({ email: null });
    act(() => result.current?.setErrors({ email: ['not an email'] }));
    expect(result.current?.errors()).to.deep.equal({ email: ['not an email'] });
    act(() => {
      result.current?.setErrors((oldErrors) => ({
        ...oldErrors,
        email: oldErrors.email?.[0].toUpperCase(),
      }));
    });
    expect(result.current?.errors()).to.deep.equal({ email: ['NOT AN EMAIL'] });
    act(() => {
      result.current?.setErrors('email', (email) =>
        (email as string).toLowerCase()
      );
    });
    expect(result.current?.errors()).to.deep.equal({ email: ['not an email'] });
  });
});
