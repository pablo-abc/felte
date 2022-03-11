import * as sinon from 'sinon';
import { suite } from 'uvu';
import { unreachable } from 'uvu/assert';
import { expect } from 'uvu-expect';
import { waitFor, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { cleanupDOM } from './common';
import '../src/felte-field';

function waitForReady(field: HTMLFelteFieldElement) {
  return new Promise((resolve) => {
    field.onfeltefieldready = () => resolve(true);
  });
}

const Field = suite('Custom controls with createField');

Field.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

Field('adds hidden input when none is present', async () => {
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

Field('does not add hidden input when one is already present', async () => {
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
    'felte-field'
  ) as HTMLFelteFieldElement;

  expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(1);

  await waitForReady(felteField);

  expect(formElement.querySelectorAll('input[name="test"]').length).to.equal(1);
});

Field(
  'does not add hidden input when assigning to a native input',
  async () => {
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
      'felte-field'
    ) as HTMLFelteFieldElement;

    expect(formElement.querySelector('input[name="test"]')).to.be.null;

    await waitForReady(felteField);
    expect(felteField.ready).to.be.true;

    await waitFor(() => {
      expect(
        formElement.querySelectorAll('input[name="test"]').length
      ).to.equal(1);
      expect(formElement.querySelector('input[name="test"]')).to.be.visible;
    });
  }
);

Field('dispatches input events', async () => {
  const template = /* HTML */ `
    <form name="test-form">
      <felte-field name="test" valueprop="textContent">
        <div contenteditable tabindex="0" role="textbox"></div>
      </felte-field>
    </form>
  `;
  document.body.innerHTML = template;
  const inputListener = sinon.fake();
  const blurListener = sinon.fake();
  const formElement = screen.getByRole('form') as HTMLFormElement;

  const felteField = document.querySelector(
    'felte-field'
  ) as HTMLFelteFieldElement;
  formElement.addEventListener('input', inputListener);
  formElement.addEventListener('focusout', blurListener);

  sinon.assert.notCalled(inputListener);
  sinon.assert.notCalled(blurListener);

  try {
    felteField.value = 'ignored value';
    felteField.blur();
    unreachable();
  } catch (err) {
    expect(err).to.have.property('message');
  }

  sinon.assert.notCalled(inputListener);
  sinon.assert.notCalled(blurListener);

  await waitForReady(felteField);

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.to.be.null;

    felteField.value = 'new value';

    expect(hiddenElement.value).to.equal('new value');
    sinon.assert.calledWith(
      inputListener,
      sinon.match({
        target: hiddenElement,
      })
    );
    sinon.assert.notCalled(blurListener);

    felteField.blur();

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
  const template = /* HTML */ `
    <form name="test-form">
      <felte-field name="test" touchonchange valueprop="textContent">
        <div contenteditable tabindex="0" role="textbox"></div>
      </felte-field>
    </form>
  `;
  document.body.innerHTML = template;
  const changeListener = sinon.fake();
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const felteField = document.querySelector(
    'felte-field'
  ) as HTMLFelteFieldElement;
  formElement.addEventListener('change', changeListener);

  sinon.assert.notCalled(changeListener);

  felteField.value = 'ignored value';

  sinon.assert.notCalled(changeListener);

  await waitForReady(felteField);

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.to.be.null;
  });

  felteField.value = 'new value';
  await waitFor(() => {
    expect(changeListener).to.have.been.called;
  });

  formElement.removeEventListener('change', changeListener);
});

Field('calls event handlers', async () => {
  const template = /* HTML */ `
    <form name="test-form">
      <felte-field name="test" valueprop="textContent">
        <div contenteditable tabindex="0" role="textbox"></div>
      </felte-field>
      <button type="button">Button</button>
    </form>
  `;
  document.body.innerHTML = template;
  const inputListener = sinon.fake();
  const blurListener = sinon.fake();
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = document.querySelector(
    '[contenteditable]'
  ) as HTMLDivElement;

  const felteField = document.querySelector(
    'felte-field'
  ) as HTMLFelteFieldElement;
  formElement.addEventListener('input', inputListener);
  formElement.addEventListener('focusout', blurListener);

  sinon.assert.notCalled(inputListener);
  sinon.assert.notCalled(blurListener);

  try {
    felteField.blur();
    unreachable();
  } catch (err) {
    expect(err).to.have.property('message');
  }

  sinon.assert.notCalled(inputListener);
  sinon.assert.notCalled(blurListener);

  await waitForReady(felteField);

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;

    expect(hiddenElement).not.to.be.null;
  });
  userEvent.type(inputElement, 'new value');
  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;
    expect(hiddenElement.value).to.equal('new value');
    sinon.assert.calledWith(
      inputListener,
      sinon.match({
        target: hiddenElement,
      })
    );
  });

  sinon.assert.notCalled(blurListener);

  userEvent.tab();

  await waitFor(() => {
    const hiddenElement = document.querySelector(
      'input[name="test"]'
    ) as HTMLInputElement;
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

Field.run();
