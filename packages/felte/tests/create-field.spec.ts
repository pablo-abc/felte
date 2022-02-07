import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom from 'chai-jsdom';
import { waitFor, screen } from '@testing-library/dom';
import { createInputElement, createDOM, cleanupDOM } from './common';
import { createField } from '../src';
use(chaiDom);

function createContentEditable() {
  const input = document.createElement('div');
  input.contentEditable = 'true';
  input.tabIndex = 0;
  input.setAttribute('role', 'textbox');
  return input;
}

const Field = suite('Custom controls with createField');

Field.before.each(createDOM);
Field.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

Field('adds hidden input when none is present', async () => {
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

Field('does not add hidden input when one is already present', () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const hiddenElement = createInputElement({ name: 'test', type: 'hidden' });
  const inputElement = createContentEditable();
  formElement.appendChild(inputElement);
  formElement.appendChild(hiddenElement);

  expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(1);

  const { field } = createField({ name: 'test' });

  field(inputElement);

  expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(1);
});

Field(
  'does not add hidden input when assigning to a native input',
  async () => {
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
      expect(formElement.querySelector('input[name="test"]')).to.be.visible;
    });
  }
);

Field('dispatches input events', async () => {
  const inputListener = sinon.fake();
  const blurListener = sinon.fake();
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditable();
  formElement.appendChild(inputElement);
  formElement.addEventListener('input', inputListener);
  formElement.addEventListener('focusout', blurListener);

  const { field, onChange, onBlur } = createField('test');

  sinon.assert.notCalled(inputListener);
  sinon.assert.notCalled(blurListener);

  onChange('ignored value');
  onBlur();

  sinon.assert.notCalled(inputListener);
  sinon.assert.notCalled(blurListener);

  field(inputElement);

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.to.be.null;

    onChange('new value');

    expect(hiddenElement.value).to.equal('new value');
    sinon.assert.calledWith(
      inputListener,
      sinon.match({
        target: hiddenElement,
      })
    );
    sinon.assert.notCalled(blurListener);

    onBlur();

    sinon.assert.calledWith(
      blurListener,
      sinon.match({
        target: hiddenElement,
      })
    );
  });

  formElement.removeEventListener('input', inputListener);
  formElement.removeEventListener('focusout', blurListener);
});

Field('dispatches change events', async () => {
  const changeListener = sinon.fake();
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditable();
  formElement.appendChild(inputElement);
  formElement.addEventListener('change', changeListener);

  const { field, onChange } = createField('test', { touchOnChange: true });

  sinon.assert.notCalled(changeListener);

  onChange('ignored value');

  sinon.assert.notCalled(changeListener);

  const { destroy } = field(inputElement);

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.to.be.null;
  });

  onChange('new value');

  formElement.removeEventListener('change', changeListener);

  destroy?.();
});

Field('listens to hidden input attribute changes', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const hiddenElement = createInputElement({ name: 'test', type: 'hidden' });
  const inputElement = createContentEditable();
  formElement.appendChild(inputElement);
  formElement.appendChild(hiddenElement);

  const { field } = createField('test');

  field(inputElement);

  await new Promise((r) => setTimeout(r, 10));

  hiddenElement.setAttribute('aria-invalid', 'true');
  await waitFor(() => {
    expect(inputElement).to.have.attribute('aria-invalid', 'true');
  });
  hiddenElement.removeAttribute('aria-invalid');
  await waitFor(() => {
    expect(inputElement).not.to.have.attribute('aria-invalid');
  });

  hiddenElement.setAttribute('data-felte-validation-message', 'a message');
  await waitFor(() => {
    expect(inputElement).to.have.attribute(
      'data-felte-validation-message',
      'a message'
    );
  });
  hiddenElement.removeAttribute('data-felte-validation-message');
  await waitFor(() => {
    expect(inputElement).not.to.have.attribute('data-felte-validation-message');
  });
});

Field('does nothing with unmounted element', () => {
  const inputElement = createContentEditable();
  const { field } = createField('test');
  expect(field(inputElement)).to.have.property('destroy');
});

Field.run();
