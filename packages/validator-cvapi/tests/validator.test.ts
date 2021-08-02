import { render, fireEvent } from '@testing-library/svelte';
import { createForm } from 'felte';
import { validator } from '../src';
import { get } from 'svelte/store';

import Comp from './Form.svelte';

describe('Validator cvapi', () => {
  test('correctly validates', async () => {
    const mockData = {
      email: '',
      password: '',
    };
    const { validate, errors, data } = createForm({
      initialValues: mockData,
      onSubmit: jest.fn(),
      extend: validator(),
    });

    await validate();

    expect(get(data)).toEqual(mockData);
    expect(get(errors)).toEqual({
      email: null,
      password: null,
    });

    data.set({
      email: 'test@email.com',
      password: 'test',
    });

    await validate();

    expect(get(errors)).toEqual({
      email: null,
      password: null,
    });
  });

  test('shows proper heading when rendered', async () => {
    const { findByRole, getByTestId } = render(Comp);

    const emailInput = getByTestId('email');
    const passwordInput = getByTestId('password');
    const legalInput = getByTestId('legal');
    const submitButton = await findByRole('button');

    fireEvent.change(emailInput, { target: { value: 'foo@bar.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    fireEvent.change(legalInput, { target: { value: true } });

    await fireEvent.click(submitButton);
    expect(submitButton).toHaveTextContent('Submit');
  });
});
