import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import { createForm } from '../src';
import { cleanupDOM, createDOM, createInputElement } from './common';
import { get } from 'svelte/store';

describe('Extenders', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('calls extender', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      destroy: jest.fn(),
    };
    const mockExtender = jest.fn(() => mockExtenderHandler);
    const {
      form,
      data: { set, ...data },
      errors,
      touched,
    } = createForm({
      onSubmit: jest.fn(),
      extend: mockExtender,
    });

    expect(mockExtender).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
      })
    );

    expect(mockExtender).toHaveBeenCalledTimes(1);

    form(formElement);

    expect(mockExtender).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
        form: formElement,
        controls: expect.arrayContaining([]),
      })
    );

    expect(mockExtender).toHaveBeenCalledTimes(2);

    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
    });

    formElement.appendChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([inputElement]),
        })
      );

      expect(mockExtender).toHaveBeenCalledTimes(3);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledTimes(1);
    });

    formElement.removeChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([]),
        })
      );

      expect(mockExtender).toHaveBeenCalledTimes(4);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledTimes(2);
    });
  });

  test('calls multiple extenders', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      destroy: jest.fn(),
    };
    const mockExtender = jest.fn(() => mockExtenderHandler);
    const {
      form,
      data: { set, ...data },
      errors,
      touched,
    } = createForm({
      onSubmit: jest.fn(),
      extend: [mockExtender, mockExtender],
    });

    expect(mockExtender).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
      })
    );

    expect(mockExtender).toHaveBeenCalledTimes(2);

    form(formElement);

    expect(mockExtender).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
        form: formElement,
        controls: expect.arrayContaining([]),
      })
    );

    expect(mockExtender).toHaveBeenCalledTimes(4);

    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
    });

    formElement.appendChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([inputElement]),
        })
      );

      expect(mockExtender).toHaveBeenCalledTimes(6);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledTimes(2);
    });

    formElement.removeChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([]),
        })
      );

      expect(mockExtender).toHaveBeenCalledTimes(8);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledTimes(4);
    });
  });

  test('calls onSubmitError', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      onSubmitError: jest.fn(),
    };
    const mockExtender = jest.fn(() => mockExtenderHandler);
    const mockErrors = { account: { email: 'Not email' } };

    const { form, data } = createForm<any>({
      onSubmit: jest.fn(() => {
        throw mockErrors;
      }),
      onError: () => mockErrors,
      extend: mockExtender,
    });

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(mockExtenderHandler.onSubmitError).toHaveBeenCalledWith(
        expect.objectContaining({
          data: get(data),
          errors: mockErrors,
        })
      );
    });
  });

  test('calls onSubmitError on multiple extenders', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      onSubmitError: jest.fn(),
    };
    const mockExtender = jest.fn(() => mockExtenderHandler);
    const validate = jest.fn();
    const mockErrors = { account: { email: 'Not email' } };
    const onSubmit = jest.fn(() => {
      throw mockErrors;
    });

    const { form, data } = createForm<any>({
      onSubmit,
      onError: () => mockErrors,
      validate,
      extend: [mockExtender, mockExtender],
    });

    form(formElement);

    formElement.submit();

    await waitFor(() => {
      expect(mockExtenderHandler.onSubmitError).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          data: get(data),
          errors: mockErrors,
        })
      );
      expect(mockExtenderHandler.onSubmitError).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          data: get(data),
          errors: mockErrors,
        })
      );
      expect(mockExtenderHandler.onSubmitError).toHaveBeenCalledTimes(2);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    validate.mockImplementation(() => mockErrors);

    formElement.submit();

    await waitFor(() => {
      expect(mockExtenderHandler.onSubmitError).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          data: get(data),
          errors: mockErrors,
        })
      );
      expect(mockExtenderHandler.onSubmitError).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          data: get(data),
          errors: mockErrors,
        })
      );
      expect(mockExtenderHandler.onSubmitError).toHaveBeenCalledTimes(4);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
