import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import { createForm } from '../src';
import { removeAllChildren, createDOM, createInputElement } from './common';
import { get } from 'svelte/store';

describe('Form action DOM mutations', () => {
  beforeAll(() => {
    createDOM();
  });

  afterEach(() => {
    const formElement = screen.getByRole('form');
    removeAllChildren(formElement);
  });

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
    const mockErrors = { account: { email: 'Not email' } };

    const { form, data } = createForm<any>({
      onSubmit: jest.fn(() => {
        throw mockErrors;
      }),
      onError: () => mockErrors,
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
    });
  });
});
