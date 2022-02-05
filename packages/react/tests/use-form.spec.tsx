import React from 'react';
import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom = require('chai-dom');
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from '../src';
use(chaiDom);

const UseForm = suite('useForm');

UseForm('calls onSubmit without a form ref', async () => {
  const mockSubmit = sinon.fake();
  const { result } = renderHook(() => useForm({ onSubmit: mockSubmit }));
  const submit = result.current.createSubmitHandler();
  sinon.assert.notCalled(mockSubmit);
  submit();
  await waitFor(() => {
    sinon.assert.called(mockSubmit);
  });
});

UseForm('calls onSubmit with a form ref', async () => {
  const mockSubmit = sinon.fake();
  function Form() {
    const { form } = useForm({ onSubmit: mockSubmit });
    return <form name="test-form" ref={form} />;
  }
  render(<Form />);
  const formElement = screen.getByRole('form') as HTMLFormElement;
  sinon.assert.notCalled(mockSubmit);
  formElement.submit();
  await waitFor(() => {
    sinon.assert.called(mockSubmit);
  });
});

UseForm('sets value with helper', () => {
  const mockSubmit = sinon.fake();
  const { result, unmount } = renderHook(() =>
    useForm({ onSubmit: mockSubmit, initialValues: { email: '' } })
  );
  act(() => result.current.setTouched('email', true));
  expect(result.current.errors()).to.deep.equal({ email: null });
  act(() => result.current.setErrors({ email: ['not an email'] }));
  expect(result.current.errors()).to.deep.equal({ email: ['not an email'] });
  unmount();
});

UseForm('updates value with helper', () => {
  type Data = {
    email: string;
  };
  const mockSubmit = sinon.fake();
  const { result } = renderHook(() =>
    useForm<Data>({ onSubmit: mockSubmit, initialValues: { email: '' } })
  );
  act(() => result.current.setTouched('email', true));
  expect(result.current.errors()).to.deep.equal({ email: null });
  act(() => result.current.setErrors({ email: ['not an email'] }));
  expect(result.current.errors()).to.deep.equal({ email: ['not an email'] });
  act(() => {
    result.current.setErrors((oldErrors) => ({
      ...oldErrors,
      email: oldErrors.email?.[0].toUpperCase(),
    }));
  });
  expect(result.current.errors()).to.deep.equal({ email: ['NOT AN EMAIL'] });
  act(() => {
    result.current.setErrors('email', (email) =>
      (email as string).toLowerCase()
    );
  });
  expect(result.current.errors()).to.deep.equal({ email: ['not an email'] });
});

UseForm.run();
