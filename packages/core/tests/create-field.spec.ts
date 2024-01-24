import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, screen } from '@testing-library/dom';
import { createInputElement, createDOM, cleanupDOM } from './common';
import { createField } from '../src';

expect.extend(matchers);

function createContentEditable() {
  const input = document.createElement('div');
  input.contentEditable = 'true';
  input.tabIndex = 0;
  input.setAttribute('role', 'textbox');
  return input;
}

describe('Custom controls with createField', () => {
  beforeEach(createDOM);
  afterEach(() => {
    cleanupDOM();
    vi.resetAllMocks();
  });

  test('adds hidden input when none is present', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);

    expect(formElement.querySelector('input[name="test"]')).to.be.null;

    const { field } = createField('test');

    field(inputElement);

    await waitFor(() => {
      expect(formElement.querySelector('input[name="test"]')).not.to.be.null;
    });
  });

  test('does not add hidden input when one is already present', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const hiddenElement = createInputElement({ name: 'test', type: 'hidden' });
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);
    formElement.appendChild(hiddenElement);

    expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(
      1
    );

    const { field } = createField({ name: 'test' });

    field(inputElement);

    expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(
      1
    );
  });

  test('does not add hidden input when assigning to a native input', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createInputElement({ name: '', type: 'text' });
    formElement.appendChild(inputElement);

    expect(formElement.querySelector('input[name="test"]')).to.be.null;

    const { field } = createField({ name: 'test', touchOnChange: false });

    field(inputElement);

    await waitFor(() => {
      expect(
        formElement.querySelectorAll('input[name="test"]').length
      ).to.equal(1);
      expect(formElement.querySelector('input[name="test"]')).toBeVisible();
    });
  });

  test('dispatches input events', async () => {
    const inputListener = vi.fn();
    const blurListener = vi.fn();
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

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]'
      ) as HTMLInputElement;

      expect(hiddenElement).not.to.be.null;
    });

    onChange('new value');

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]'
      ) as HTMLInputElement;

      expect(hiddenElement.value).to.equal('new value');
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
    });

    formElement.removeEventListener('input', inputListener);
    formElement.removeEventListener('focusout', blurListener);
  });

  test('dispatches change events', async () => {
    const changeListener = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);
    formElement.addEventListener('change', changeListener);

    const { field, onChange } = createField('test', { touchOnChange: true });

    expect(changeListener).not.toHaveBeenCalled();

    onChange('ignored value');

    expect(changeListener).not.toHaveBeenCalled();

    const { destroy } = field(inputElement);

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]'
      ) as HTMLInputElement;

      expect(hiddenElement).not.to.be.null;
    });

    onChange('new value');
    expect(changeListener).toHaveBeenCalled();

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

    await new Promise((r) => setTimeout(r, 10));

    hiddenElement.setAttribute('aria-invalid', 'true');
    expect(inputElement).toBeValid();
    await waitFor(() => {
      expect(inputElement).toBeInvalid();
    });
    hiddenElement.removeAttribute('aria-invalid');
    expect(inputElement).toBeInvalid();
    await waitFor(() => {
      expect(inputElement).toBeValid();
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
    expect(field(inputElement)).to.have.property('destroy');
  });

  test('calls onFormReset', async () => {
    const onFormReset = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createContentEditable();
    formElement.appendChild(inputElement);

    const { field } = createField('test', { onFormReset });

    field(inputElement);

    await new Promise((r) => setTimeout(r));

    formElement.reset();

    await waitFor(() => {
      expect(onFormReset).toHaveBeenCalled();
    });
  });

  test('does not change control value on focusout event', async () => {
    function createTextInput() {
      const input = document.createElement('input');
      input.type = 'text';
      return input;
    }
    
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = createTextInput();
    inputElement.value = 'old value';
    formElement.appendChild(inputElement);

    const { field, onChange, onBlur } = createField('test');
    field(inputElement);

    expect(inputElement.value).to.equal('old value');

    onChange('new value');
    expect(inputElement.value).to.equal('new value');
    
    onBlur();
    expect(inputElement.value).to.equal('new value');
  });
});
