import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom from 'chai-jsdom';
import { waitFor, screen } from '@testing-library/dom';
import {
  createInputElement,
  createDOM,
  cleanupDOM,
  createForm,
  createMultipleInputElements,
} from './common';
import { get } from 'svelte/store';
use(chaiDom);

const DomMutations = suite('Form action DOM mutations');

DomMutations.before.each(createDOM);
DomMutations.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

DomMutations('Adds novalidate to form when using a validate function', () => {
  const { form } = createForm({
    validate: sinon.fake(),
    onSubmit: sinon.fake(),
  });
  const formElement = screen.getByRole('form') as HTMLFormElement;
  expect(formElement).not.to.have.attribute('novalidate');

  form(formElement);

  expect(formElement).to.have.attribute('novalidate');
});

DomMutations(
  'Propagates felte-keep-on-remove attribute respecting specificity',
  () => {
    const { form } = createForm({ onSubmit: sinon.fake() });
    const outerFieldset = document.createElement('fieldset');
    outerFieldset.dataset.felteKeepOnRemove = 'false';
    const outerTextInput = createInputElement({ name: 'outerText' });
    const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
    outerSecondaryInput.dataset.felteKeepOnRemove = 'true';
    const innerFieldset = document.createElement('fieldset');
    const innerTextInput = createInputElement({ name: 'innerText' });
    const innerSecondaryinput = createInputElement({ name: 'innerSecondary' });
    innerSecondaryinput.dataset.felteKeepOnRemove = 'true';
    innerFieldset.append(innerTextInput, innerSecondaryinput);
    outerFieldset.append(outerTextInput, outerSecondaryInput, innerFieldset);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(outerFieldset);
    form(formElement);
    [outerFieldset, outerTextInput, innerFieldset, innerTextInput].forEach(
      (el) => {
        expect(el).to.have.attribute('data-felte-keep-on-remove', 'false');
      }
    );
    [outerSecondaryInput, innerSecondaryinput].forEach((el) => {
      expect(el).to.have.attribute('data-felte-keep-on-remove', 'true');
    });
  }
);

DomMutations('Keeps fields tagged with felte-keep-on-remove', async () => {
  const { form, data } = createForm({ onSubmit: sinon.fake() });
  const outerFieldset = document.createElement('fieldset');
  outerFieldset.dataset.felteKeepOnRemove = 'false';
  const outerTextInput = createInputElement({ name: 'outerText' });
  const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
  outerSecondaryInput.dataset.felteKeepOnRemove = '';
  const multipleOuterInputs = createMultipleInputElements({
    name: 'multiple',
  });
  multipleOuterInputs[1].dataset.felteKeepOnRemove = 'true';
  const innerFieldset = document.createElement('fieldset');
  const innerTextInput = createInputElement({ name: 'inner.innerText' });
  const innerSecondaryinput = createInputElement({
    name: 'inner.innerSecondary',
  });
  innerSecondaryinput.dataset.felteKeepOnRemove = 'true';
  innerFieldset.append(innerTextInput, innerSecondaryinput);
  outerFieldset.append(
    ...multipleOuterInputs,
    outerTextInput,
    outerSecondaryInput,
    innerFieldset
  );
  const formElement = screen.getByRole('form') as HTMLFormElement;
  formElement.appendChild(outerFieldset);
  form(formElement);
  expect(get(data)).to.deep.include({
    outerText: '',
    outerSecondary: '',
    inner: {
      innerText: '',
      innerSecondary: '',
    },
  });
  expect(get(data))
    .to.have.a.property('multiple')
    .that.is.an('array')
    .with.lengthOf(3)
    .and.has.a.nested.property('0.key')
    .that.is.a('string');
  formElement.removeChild(outerFieldset);
  await waitFor(() => {
    expect(get(data)).to.deep.include({
      outerSecondary: '',
      inner: {
        innerSecondary: '',
      },
    });
    expect(get(data)).to.have.a.property('multiple').with.lengthOf(1);
  });
});

DomMutations('Handles fields added after form load', async () => {
  const { form, data } = createForm({ onSubmit: sinon.fake() });
  const outerFieldset = document.createElement('fieldset');
  outerFieldset.dataset.felteKeepOnRemove = 'false';
  const outerTextInput = createInputElement({ name: 'outerText' });
  const outerSecondaryInput = createInputElement({ name: 'outerSecondary' });
  outerSecondaryInput.dataset.felteKeepOnRemove = 'true';
  const innerFieldset = document.createElement('fieldset');
  const innerTextInput = createInputElement({ name: 'inner.innerText' });
  const innerSecondaryinput = createInputElement({
    name: 'inner.innerSecondary',
  });
  innerSecondaryinput.dataset.felteKeepOnRemove = 'true';
  innerFieldset.append(innerTextInput, innerSecondaryinput);
  outerFieldset.append(outerTextInput, outerSecondaryInput);
  const formElement = screen.getByRole('form') as HTMLFormElement;
  formElement.appendChild(outerFieldset);
  form(formElement);
  expect(get(data)).to.deep.equal({
    outerText: '',
    outerSecondary: '',
  });

  formElement.appendChild(innerFieldset);

  await waitFor(() => {
    expect(get(data)).to.deep.equal({
      outerText: '',
      outerSecondary: '',
      inner: {
        innerText: '',
        innerSecondary: '',
      },
    });
  });
});

DomMutations('Adds and removes event listeners', () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const { form } = createForm({ onSubmit: sinon.fake() });
  const addEventListener = sinon.fake();
  const removeEventListener = sinon.fake();
  formElement.addEventListener = addEventListener;
  formElement.removeEventListener = removeEventListener;
  sinon.assert.notCalled(addEventListener);
  sinon.assert.notCalled(removeEventListener);
  const { destroy } = form(formElement);
  sinon.assert.callCount(addEventListener, 5);
  sinon.assert.notCalled(removeEventListener);
  destroy();
  sinon.assert.callCount(removeEventListener, 5);
});

DomMutations.run();
