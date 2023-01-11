import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, screen } from '@testing-library/dom';
import {
  createInputElement,
  createDOM,
  cleanupDOM,
  createMultipleInputElements,
} from './common';
import { get } from 'svelte/store';
import { createForm } from '../src';

expect.extend(matchers);

vi.mock('svelte', () => ({ onDestroy: vi.fn() }));

describe('Form action DOM mutations', () => {
  beforeEach(createDOM);
  afterEach(() => {
    cleanupDOM();
    vi.restoreAllMocks();
  });

  test('Adds novalidate to form when using a validate function', () => {
    const { form } = createForm({
      validate: vi.fn(),
      onSubmit: vi.fn(),
    });
    const formElement = screen.getByRole('form') as HTMLFormElement;
    expect(formElement).not.toHaveAttribute('novalidate');

    form(formElement);

    expect(formElement).toHaveAttribute('novalidate');
  });

  test('Propagates felte-keep-on-remove attribute respecting specificity', () => {
    const { form } = createForm({ onSubmit: vi.fn() });
    const outerFieldset = document.createElement('fieldset');
    outerFieldset.dataset.felteKeepOnRemove = 'false';
    const outerTextInput = createInputElement({ name: 'outerText' });
    const outerSecondaryInput = createInputElement({
      name: 'outerSecondary',
    });
    outerSecondaryInput.dataset.felteKeepOnRemove = 'true';
    const innerFieldset = document.createElement('fieldset');
    const innerTextInput = createInputElement({ name: 'innerText' });
    const innerSecondaryinput = createInputElement({
      name: 'innerSecondary',
    });
    innerSecondaryinput.dataset.felteKeepOnRemove = 'true';
    innerFieldset.append(innerTextInput, innerSecondaryinput);
    outerFieldset.append(outerTextInput, outerSecondaryInput, innerFieldset);
    const formElement = screen.getByRole('form') as HTMLFormElement;
    formElement.appendChild(outerFieldset);
    form(formElement);
    [outerFieldset, outerTextInput, innerFieldset, innerTextInput].forEach(
      (el) => {
        expect(el).toHaveAttribute('data-felte-keep-on-remove', 'false');
      }
    );
    [outerSecondaryInput, innerSecondaryinput].forEach((el) => {
      expect(el).toHaveAttribute('data-felte-keep-on-remove', 'true');
    });
  });

  test('Keeps fields tagged with felte-keep-on-remove', async () => {
    const { form, data } = createForm({ onSubmit: vi.fn() });
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

  test('Handles fields added after form load', async () => {
    const { form, data } = createForm({ onSubmit: vi.fn() });
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

  test('Adds and removes event listeners', () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const { form } = createForm({ onSubmit: vi.fn() });
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    formElement.addEventListener = addEventListener;
    formElement.removeEventListener = removeEventListener;
    expect(addEventListener).not.toHaveBeenCalled();
    expect(removeEventListener).not.toHaveBeenCalled();
    const { destroy } = form(formElement);
    expect(addEventListener).toHaveBeenCalledTimes(5);
    expect(removeEventListener).not.toHaveBeenCalled();
    destroy();
    expect(removeEventListener).toHaveBeenCalledTimes(5);
  });
});
