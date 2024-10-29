import '@testing-library/jest-dom/vitest';
import { expect, describe, test, vi, afterEach } from 'vitest';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { cleanupDOM } from './common';
import '../src/felte-field';
import { AssertionError } from 'node:assert';

function waitForReady(field: HTMLFelteFieldElement) {
  return new Promise((resolve) => {
    field.onfeltefieldready = () => resolve(true);
  });
}

describe('Custom controls with felte-field', () => {
  afterEach(() => {
    cleanupDOM();
    vi.restoreAllMocks();
  });

  test('adds hidden input when none is present', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field name="test" valueprop="textContent">
          <div contenteditable tabindex="0" role="textbox"></div>
        </felte-field>
      </form>
    `;

    document.body.innerHTML = template;
    const formElement = screen.getByRole('form') as HTMLFormElement;

    expect(formElement.querySelector('input[name="test"]')).to.be.null;

    await waitFor(() => {
      expect(formElement.querySelector('input[name="test"]')).not.to.be.null;
    });
  });

  test('does not add hidden input when one is already present', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field name="test" valueprop="textContent">
          <div contenteditable tabindex="0" role="textbox"></div>
          <input type="hidden" name="test" />
        </felte-field>
      </form>
    `;
    document.body.innerHTML = template;
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const felteField = document.querySelector(
      'felte-field',
    ) as HTMLFelteFieldElement;

    expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(
      1,
    );

    await waitForReady(felteField);

    expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(
      1,
    );
  });

  test('does not add hidden input when assigning to a native input', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field name="test">
          <input type="text" />
        </felte-field>
      </form>
    `;
    document.body.innerHTML = template;
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const felteField = document.querySelector(
      'felte-field',
    ) as HTMLFelteFieldElement;

    expect(formElement.querySelector('input[name="test"]')).to.be.null;

    await waitForReady(felteField);
    expect(felteField.ready).to.be.true;

    await waitFor(() => {
      expect(
        formElement.querySelectorAll('input[name="test"]').length,
      ).to.equal(1);
      expect(formElement.querySelector('input[name="test"]')).toBeVisible();
    });
  });

  test('dispatches input events', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field name="test" valueprop="textContent">
          <div contenteditable tabindex="0" role="textbox"></div>
        </felte-field>
      </form>
    `;
    document.body.innerHTML = template;
    const inputListener = vi.fn();
    const blurListener = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;

    const felteField = document.querySelector(
      'felte-field',
    ) as HTMLFelteFieldElement;
    formElement.addEventListener('input', inputListener);
    formElement.addEventListener('focusout', blurListener);

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    try {
      felteField.value = 'ignored value';
      felteField.blur();
      throw new AssertionError({
        message: 'Should not get here',
      });
    } catch (err) {
      expect(err).to.have.property('message');
    }

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    await waitForReady(felteField);

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;

      expect(hiddenElement).not.to.be.null;

      felteField.value = 'new value';

      expect(hiddenElement.value).to.equal('new value');
      expect(inputListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
      expect(blurListener).not.toHaveBeenCalled();

      felteField.blur();

      expect(blurListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
    });

    formElement.removeEventListener('input', inputListener);
    formElement.removeEventListener('focusout', blurListener);
  });

  test('dispatches change events', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field name="test" touchonchange valueprop="textContent">
          <div contenteditable tabindex="0" role="textbox"></div>
        </felte-field>
      </form>
    `;
    document.body.innerHTML = template;
    const changeListener = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const felteField = document.querySelector(
      'felte-field',
    ) as HTMLFelteFieldElement;
    formElement.addEventListener('change', changeListener);

    expect(changeListener).not.toHaveBeenCalled();

    felteField.value = 'ignored value';

    expect(changeListener).not.toHaveBeenCalled();

    await waitForReady(felteField);

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;

      expect(hiddenElement).not.to.be.null;
    });

    felteField.value = 'new value';
    await waitFor(() => {
      expect(changeListener).toHaveBeenCalled();
    });

    formElement.removeEventListener('change', changeListener);
  });

  test('calls event handlers', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field name="test" valueprop="textContent">
          <div contenteditable tabindex="0" role="textbox"></div>
        </felte-field>
        <button type="button">Button</button>
      </form>
    `;
    document.body.innerHTML = template;
    const inputListener = vi.fn();
    const blurListener = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = document.querySelector(
      '[contenteditable]',
    ) as HTMLDivElement;

    const felteField = document.querySelector(
      'felte-field',
    ) as HTMLFelteFieldElement;
    formElement.addEventListener('input', inputListener);
    formElement.addEventListener('focusout', blurListener);

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    try {
      felteField.blur();
      throw new AssertionError({
        message: 'Should not get here',
      });
    } catch (err) {
      expect(err).to.have.property('message');
    }

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    await waitForReady(felteField);

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;

      expect(hiddenElement).not.to.be.null;
    });
    userEvent.type(inputElement, 'new value');
    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;
      expect(hiddenElement.value).to.equal('new value');
      expect(inputListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
    });

    expect(blurListener).not.toHaveBeenCalled();

    userEvent.tab();

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;
      expect(blurListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
    });

    formElement.removeEventListener('input', inputListener);
    formElement.removeEventListener('focusout', blurListener);
  });

  test('calls event handlers on custom target', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field
          name="test"
          valueprop="textContent"
          target="[contenteditable]"
        >
          <section>
            <div>
              <div contenteditable tabindex="0" role="textbox"></div>
            </div>
          </section>
        </felte-field>
        <button type="button">Button</button>
      </form>
    `;
    document.body.innerHTML = template;
    const inputListener = vi.fn();
    const blurListener = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const inputElement = document.querySelector(
      '[contenteditable]',
    ) as HTMLDivElement;

    const felteField = document.querySelector(
      'felte-field',
    ) as HTMLFelteFieldElement;
    formElement.addEventListener('input', inputListener);
    formElement.addEventListener('focusout', blurListener);

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    try {
      felteField.blur();
      throw new AssertionError({
        message: 'Should not get here',
      });
    } catch (err) {
      expect(err).to.have.property('message');
    }

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    await waitForReady(felteField);

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;

      expect(hiddenElement).not.to.be.null;
    });
    userEvent.type(inputElement, 'new value');
    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;
      expect(hiddenElement.value).to.equal('new value');
      expect(inputListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
    });

    expect(blurListener).not.toHaveBeenCalled();

    userEvent.tab();

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;
      expect(blurListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
    });

    formElement.removeEventListener('input', inputListener);
    formElement.removeEventListener('focusout', blurListener);
  });

  test('handles reset event on form', async () => {
    const template = /* HTML */ `
      <form name="test-form">
        <felte-field name="test" valueprop="textContent">
          <div contenteditable tabindex="0" role="textbox"></div>
        </felte-field>
      </form>
    `;
    document.body.innerHTML = template;
    const inputListener = vi.fn();
    const blurListener = vi.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;

    const felteField = document.querySelector(
      'felte-field',
    ) as HTMLFelteFieldElement;
    const contenteditable = document.querySelector(
      'div[contenteditable]',
    ) as HTMLDivElement;
    felteField.setAttribute('value', '');
    formElement.addEventListener('input', inputListener);
    formElement.addEventListener('focusout', blurListener);

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    expect(inputListener).not.toHaveBeenCalled();
    expect(blurListener).not.toHaveBeenCalled();

    await waitForReady(felteField);

    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;

      expect(hiddenElement).not.to.be.null;
    });

    userEvent.type(contenteditable, 'new value');
    await waitFor(() => {
      const hiddenElement = document.querySelector(
        'input[name="test"]',
      ) as HTMLInputElement;
      expect(hiddenElement.value).to.equal('new value');
      expect(inputListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
      expect(blurListener).not.toHaveBeenCalled();

      felteField.blur();

      expect(blurListener).toHaveBeenCalledWith(
        expect.objectContaining({
          target: hiddenElement,
        }),
      );
    });

    expect(felteField.value).to.equal('new value');
    expect(contenteditable.textContent).to.equal('new value');

    formElement.reset();

    await waitFor(() => {
      expect(felteField.value).to.equal('');
      expect(contenteditable.textContent).to.equal('');
    });

    formElement.removeEventListener('input', inputListener);
    formElement.removeEventListener('focusout', blurListener);
  });
});
