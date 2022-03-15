import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { waitFor, screen } from '@testing-library/dom';
import { createInputElement, createDOM, cleanupDOM } from './common';
import { createField } from '../src';

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

  expect(inputListener).to.have.not.been.called;
  expect(blurListener).to.have.not.been.called;

  onChange('ignored value');
  onBlur();

  expect(inputListener).to.have.not.been.called;
  expect(blurListener).to.have.not.been.called;

  field(inputElement);

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.to.be.null;

    onChange('new value');

    expect(hiddenElement.value).to.equal('new value');
    expect(inputListener).to.have.been.called.with(
      expect.match({
        target: hiddenElement,
      })
    );
    expect(blurListener).to.have.not.been.called;

    onBlur();

    expect(blurListener).to.have.been.called.with(
      expect.match({
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

  expect(changeListener).to.have.not.been.called;

  onChange('ignored value');

  expect(changeListener).to.have.not.been.called;

  const { destroy } = field(inputElement);

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.to.be.null;
  });

  onChange('new value');
  expect(changeListener).to.have.been.called;

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
  expect(inputElement).to.be.valid;
  await waitFor(() => {
    expect(inputElement).to.be.invalid;
  });
  hiddenElement.removeAttribute('aria-invalid');
  expect(inputElement).to.be.invalid;
  await waitFor(() => {
    expect(inputElement).to.be.valid;
  });

  hiddenElement.setAttribute('data-felte-validation-message', 'a message');
  await waitFor(() => {
    expect(inputElement)
      .to.have.attribute('data-felte-validation-message')
      .that.equals('a message');
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

Field('calls onFormReset', async () => {
  const onFormReset = sinon.fake();
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditable();
  formElement.appendChild(inputElement);

  const { field } = createField('test', { onFormReset });

  field(inputElement);

  await new Promise((r) => setTimeout(r));

  formElement.reset();

  await waitFor(() => {
    expect(onFormReset).to.have.been.called;
  });
});

Field.run();
