import '@testing-library/jest-dom/extend-expect';
import { screen, waitFor } from '@testing-library/dom';
import {
  cleanupDOM,
  createDOM,
  createInputElement,
  createForm,
} from './common';
import { get } from 'svelte/store';
import type { CurrentForm } from '@felte/common';

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
        stage: 'SETUP',
      })
    );

    expect(mockExtender).toHaveBeenCalledTimes(1);

    form(formElement);

    expect(mockExtender).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        stage: 'MOUNT',
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
          stage: 'UPDATE',
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
          stage: 'UPDATE',
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
    const mockExtenderHandlerNoD = {};
    const mockExtender = jest.fn(() => mockExtenderHandler);
    const mockExtenderNoD = jest.fn(() => mockExtenderHandlerNoD);
    const {
      form,
      data: { set, ...data },
      errors,
      touched,
    } = createForm({
      onSubmit: jest.fn(),
      extend: [mockExtender, mockExtenderNoD],
    });

    expect(mockExtender).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
      })
    );

    expect(mockExtender).toHaveBeenCalledTimes(1);

    expect(mockExtenderNoD).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
      })
    );

    expect(mockExtenderNoD).toHaveBeenCalledTimes(1);

    const { destroy } = form(formElement);

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

    expect(mockExtenderNoD).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
        form: formElement,
        controls: expect.arrayContaining([]),
      })
    );

    expect(mockExtenderNoD).toHaveBeenCalledTimes(2);

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

    destroy();
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

  test('adds validator when no validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator);
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds validator when validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator);
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
      validate: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  test('adds warn validator when no validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { level: 'warning' });
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds warn validator when validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { level: 'warning' });
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
      warn: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  // DEBOUNCED
  test('adds debounced validator when no validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { debounced: true });
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds debounced validator when validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { debounced: true });
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
      validate: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  test('adds debounced warn validator when no validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, {
        level: 'warning',
        debounced: true,
      });
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds debounced warn validator when validators are present with addValidator', async () => {
    const validator = jest.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, {
        level: 'warning',
        debounced: true,
      });
      return {};
    }
    const { validate } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
      warn: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  test('adds transformer when no validators are present with addTransformer', async () => {
    const transformer = jest.fn((v) => v);
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addTransformer(transformer);
      return {};
    }
    const { data } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
    });
    data.set({});
    expect(transformer).toHaveBeenCalledTimes(1);
  });

  test('adds transformer when validators are present with addTransformer', async () => {
    const transformer = jest.fn((v) => v);
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addTransformer(transformer);
      return {};
    }
    const { data } = createForm({
      onSubmit: jest.fn(),
      extend: extender,
      transform: transformer,
    });
    data.set({});
    expect(transformer).toHaveBeenCalledTimes(2);
  });
});
