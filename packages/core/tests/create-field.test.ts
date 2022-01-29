import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/dom';
import { createField } from '../src';
import { cleanupDOM, createDOM, createInputElement } from './common';

function createContentEditable() {
  const input = document.createElement('div');
  input.contentEditable = 'true';
  input.tabIndex = 0;
  input.setAttribute('role', 'textbox');
  return input;
}

describe('Custom controls with createField', () => {
  beforeEach(createDOM);
  afterEach(cleanupDOM);

  test('adds hidden input when none is present', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);

    expect(formElement.querySelector('input[name="test"]')).toBe(null);

    const { field } = createField('test');

    field(inputElement);

    expect(formElement.querySelector('input[name="test"]')).toBeInTheDocument();
  });

  test('does not add hidden input when one is already present', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const hiddenElement = createInputElement({ name: 'test', type: 'hidden' });
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);
    formElement.appendChild(hiddenElement);

    expect(formElement.querySelectorAll('input[name="test"]').length).toBe(1);

    const { field } = createField({ name: 'test' });

    field(inputElement);

    expect(formElement.querySelectorAll('input[name="test"]').length).toBe(1);
  });

  test('does not add hidden input when assigning to a native input', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({ name: '', type: 'text' });
    formElement.appendChild(inputElement);

    expect(formElement.querySelector('input[name="test"]')).toBe(null);

    const { field } = createField({ name: 'test', touchOnChange: false });

    field(inputElement);

    expect(formElement.querySelectorAll('input[name="test"]').length).toBe(1);
    expect(formElement.querySelector('input[name="test"]')).toBeInTheDocument();
  });

  test('dispatches input events', () => {
    const inputListener = jest.fn();
    const blurListener = jest.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);
    formElement.addEventListener('input', inputListener);
    formElement.addEventListener('focusout', blurListener);

    const { field, onChange, onBlur } = createField('test');

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    onChange('ignored value');
    onBlur();

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    field(inputElement);

    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.toBe(null);

    onChange('new value');

    expect(hiddenElement.value).toBe('new value');
    expect(inputListener).toHaveBeenCalledWith(
      expect.objectContaining({
        target: hiddenElement,
      })
    );
    expect(blurListener).not.toHaveBeenCalled();

    onBlur();

    expect(blurListener).toHaveBeenCalledWith(
      expect.objectContaining({
        target: hiddenElement,
      })
    );

    formElement.removeEventListener('input', inputListener);
    formElement.removeEventListener('focusout', blurListener);
  });

  test('dispatches change events', () => {
    const changeListener = jest.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);
    formElement.addEventListener('change', changeListener);

    const { field, onChange } = createField('test', { touchOnChange: true });

    expect(changeListener).not.toHaveBeenCalled();

    onChange('ignored value');

    expect(changeListener).not.toHaveBeenCalled();

    const { destroy } = field(inputElement);

    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.toBe(null);

    onChange('new value');

    formElement.removeEventListener('change', changeListener);

    destroy?.();
  });

  test('listens to hidden input attribute changes', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const hiddenElement = createInputElement({ name: 'test', type: 'hidden' });
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);
    formElement.appendChild(hiddenElement);

    const { field } = createField('test');

    field(inputElement);

    hiddenElement.setAttribute('aria-invalid', 'true');
    await waitFor(() => {
      expect(inputElement).toHaveAttribute('aria-invalid', 'true');
    });
    hiddenElement.removeAttribute('aria-invalid');
    await waitFor(() => {
      expect(inputElement).not.toHaveAttribute('aria-invalid');
    });

    hiddenElement.setAttribute('data-felte-validation-message', 'a message');
    await waitFor(() => {
      expect(inputElement).toHaveAttribute(
        'data-felte-validation-message',
        'a message'
      );
    });
    hiddenElement.removeAttribute('data-felte-validation-message');
    await waitFor(() => {
      expect(inputElement).not.toHaveAttribute('data-felte-validation-message');
    });
  });

  test('does nothing with unmounted element', () => {
    const inputElement = createContentEditable();
    const { field } = createField('test');
    expect(field(inputElement)).toEqual({});
  });
});
