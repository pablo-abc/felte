import '@testing-library/jest-dom/vitest';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, screen } from '@testing-library/dom';
import { get } from 'svelte/store';
import { createInputElement, createDOM, cleanupDOM } from './common';
import type { CurrentForm } from '@felte/core';
import { createForm } from '../src';

vi.mock('svelte', () => ({ onDestroy: vi.fn() }));

describe('Extenders', () => {
  beforeEach(createDOM);
  afterEach(() => {
    cleanupDOM();
    vi.restoreAllMocks();
  });

  test('calls extender', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      destroy: vi.fn(),
    };
    const mockExtender = vi.fn().mockReturnValue(mockExtenderHandler);
    const {
      form,
      data: { set, ...data },
      errors,
      touched,
    } = createForm({
      onSubmit: vi.fn(),
      extend: mockExtender,
    });

    expect(mockExtender).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
        stage: 'SETUP',
      }),
    );

    expect(mockExtender).toHaveBeenCalledOnce();

    form(formElement);

    expect(mockExtender).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        stage: 'MOUNT',
        errors,
        touched,
        form: formElement,
        controls: expect.arrayContaining([]),
      }),
    );

    expect(mockExtender).toHaveBeenCalledTimes(2);

    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
    });

    formElement.appendChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          stage: 'UPDATE',
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([inputElement]),
        }),
      );

      expect(mockExtender).toHaveBeenCalledTimes(3);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledOnce();
    });

    formElement.removeChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          stage: 'UPDATE',
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([]),
        }),
      );

      expect(mockExtender).toHaveBeenCalledTimes(4);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledTimes(2);
    });
  });

  test('calls multiple extenders', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      destroy: vi.fn(),
    };
    const mockExtenderHandlerNoD = {};
    const mockExtender = vi.fn().mockReturnValue(mockExtenderHandler);
    const mockExtenderNoD = vi.fn().mockReturnValue(mockExtenderHandlerNoD);
    const {
      form,
      data: { set, ...data },
      errors,
      touched,
    } = createForm({
      onSubmit: vi.fn(),
      extend: [mockExtender, mockExtenderNoD],
    });

    expect(mockExtender).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
      }),
    );

    expect(mockExtender).toHaveBeenCalledTimes(1);

    expect(mockExtenderNoD).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
      }),
    );

    expect(mockExtenderNoD).toHaveBeenCalledTimes(1);

    const { destroy } = form(formElement);

    expect(mockExtender).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
        form: formElement,
        controls: expect.arrayContaining([]),
      }),
    );

    expect(mockExtender).toHaveBeenCalledTimes(2);

    expect(mockExtenderNoD).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining(data),
        errors,
        touched,
        form: formElement,
        controls: expect.arrayContaining([]),
      }),
    );

    expect(mockExtenderNoD).toHaveBeenCalledTimes(2);

    const inputElement = createInputElement({
      name: 'test',
      type: 'text',
    });

    formElement.appendChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([inputElement]),
        }),
      );

      expect(mockExtender).toHaveBeenCalledTimes(3);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledTimes(1);
    });

    formElement.removeChild(inputElement);

    await waitFor(() => {
      expect(mockExtender).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(data),
          errors,
          touched,
          form: formElement,
          controls: expect.arrayContaining([]),
        }),
      );

      expect(mockExtender).toHaveBeenCalledTimes(4);

      expect(mockExtenderHandler.destroy).toHaveBeenCalledTimes(2);
    });

    destroy();
  });

  test('calls onSubmitError', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      onSubmitError: vi.fn(),
    };
    const mockExtender = vi.fn(() => mockExtenderHandler);
    const mockErrors = { account: { email: 'Not email' } };

    const { form, data } = createForm<any>({
      onSubmit: vi.fn(() => {
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
          data: expect.objectContaining(get(data)),
          errors: {
            account: {
              email: ['Not email'],
            },
          },
        }),
      );
    });
  });

  test('calls onSubmitError on multiple extenders', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const mockExtenderHandler = {
      onSubmitError: vi.fn(),
    };
    const mockExtender = vi.fn(() => mockExtenderHandler);
    const validate = vi.fn();
    const mockErrors = { account: { email: 'Not email' } };
    const onSubmit = vi.fn(() => {
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
      expect(mockExtenderHandler.onSubmitError).toBeCalledWith(
        expect.objectContaining({
          data: get(data),
          errors: {
            account: {
              email: ['Not email'],
            },
          },
        }),
      );
      expect(mockExtenderHandler.onSubmitError).toHaveBeenCalledTimes(2);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    validate.mockReturnValue(mockErrors);
    validate.mockClear();

    formElement.submit();

    await waitFor(() => {
      expect(mockExtenderHandler.onSubmitError).toBeCalledWith(
        expect.objectContaining({
          data: get(data),
          errors: {
            account: {
              email: ['Not email'],
            },
          },
        }),
      );
      expect(mockExtenderHandler.onSubmitError).toHaveBeenCalledTimes(4);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test('adds validator when no validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator);
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds validator when validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator);
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
      validate: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  test('adds warn validator when no validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { level: 'warning' });
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds warn validator when validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { level: 'warning' });
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
      warn: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  // DEBOUNCED
  test('adds debounced validator when no validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { debounced: true });
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds debounced validator when validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { debounced: true });
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
      validate: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  test('adds debounced warn validator when no validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, {
        level: 'warning',
        debounced: true,
      });
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });

  test('adds debounced warn validator when validators are present with addValidator', async () => {
    const validator = vi.fn();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, {
        level: 'warning',
        debounced: true,
      });
      return {};
    }
    const { validate } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
      warn: validator,
    });
    await validate();
    expect(validator).toHaveBeenCalledTimes(3);
  });

  test('adds transformer when no validators are present with addTransformer', async () => {
    const transformer = vi.fn((v) => v);
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addTransformer(transformer);
      return {};
    }
    const { data } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
    });
    data.set({});
    expect(transformer).toHaveBeenCalledTimes(1);
  });

  test('adds transformer when validators are present with addTransformer', async () => {
    const transformer = vi.fn((v) => v);
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addTransformer(transformer);
      return {};
    }
    const { data } = createForm({
      onSubmit: vi.fn(),
      extend: extender,
      transform: transformer,
    });
    data.set({});
    expect(transformer).toHaveBeenCalledTimes(2);
  });
});
