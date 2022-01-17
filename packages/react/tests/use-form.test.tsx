import React from 'react';
import type { RefCallback } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from '../src';

describe(useForm, () => {
  test('calls onSubmit without a form ref', async () => {
    const mockSubmit = jest.fn();
    const { result } = renderHook(() => useForm({ onSubmit: mockSubmit }));
    const submit = result.current.createSubmitHandler();
    expect(mockSubmit).not.toHaveBeenCalled();
    submit();
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('calls onSubmit with a form ref', async () => {
    const mockSubmit = jest.fn();
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
    const mockSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm({ onSubmit: mockSubmit, initialValues: { email: '' } })
    );
    act(() => result.current.setTouched('email', true));
    expect(result.current.errors()).toEqual({ email: null });
    act(() => result.current.setErrors({ email: 'not an email' }));
    expect(result.current.errors()).toEqual({ email: 'not an email' });
  });

  test('updates value with helper', () => {
    type Data = {
      email: string;
    };
    const mockSubmit = jest.fn();
    const { result } = renderHook(() =>
      useForm<Data>({ onSubmit: mockSubmit, initialValues: { email: '' } })
    );
    act(() => result.current.setTouched('email', true));
    expect(result.current.errors()).toEqual({ email: null });
    act(() => result.current.setErrors({ email: 'not an email' }));
    expect(result.current.errors()).toEqual({ email: 'not an email' });
    act(() => {
      result.current.setErrors((oldErrors) => ({
        ...oldErrors,
        email: (oldErrors.email as string).toUpperCase(),
      }));
    });
    expect(result.current.errors()).toEqual({ email: 'NOT AN EMAIL' });
    act(() => {
      result.current.setErrors('email', (email) =>
        (email as string).toLowerCase()
      );
    });
    expect(result.current.errors()).toEqual({ email: 'not an email' });
  });
});
