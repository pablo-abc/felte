import { screen, waitFor } from '@testing-library/dom';
import { cleanupDOM, createDOM, createInputElement } from './common';
import {
  createForm,
  dispatchInput,
  dispatchChange,
  dispatchBlur,
} from '../src';
import { get } from 'svelte/store';

type ContentEditableProps = {
  name?: string;
  id?: string;
};

function createContentEditableInput(props: ContentEditableProps = {}) {
  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.setAttribute('tabindex', '0');
  if (props.name) div.dataset.felteName = props.name;
  if (props.id) div.id = props.id;
  return div;
}

describe('Custom controls', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('Sends events correctly', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'fieldset';
    const inputEditable = createContentEditableInput({ name: 'testInput' });
    const changeEditable = createContentEditableInput({ name: 'testChange' });
    const inputElement = createInputElement({ name: 'testElement' });
    const divElement = document.createElement('div');

    fieldsetElement.appendChild(inputEditable);
    fieldsetElement.appendChild(changeEditable);
    fieldsetElement.appendChild(inputElement);
    fieldsetElement.appendChild(divElement);
    formElement.appendChild(fieldsetElement);

    const { form, data, touched } = createForm({
      onSubmit: jest.fn(),
    });

    form(formElement);

    const inputResult = dispatchInput(inputEditable, '');
    const blurResult = dispatchBlur(inputEditable);
    const changeResult = dispatchChange(changeEditable, '');
    const inputChangeResult = dispatchChange(inputElement, '');
    const invalidElementResult = dispatchInput(divElement, '');

    await waitFor(() => {
      expect(get(data)).toEqual({
        fieldset: {
          testInput: '',
          testChange: '',
          testElement: '',
        },
      });

      expect(get(touched)).toEqual({
        fieldset: {
          testInput: false,
          testChange: false,
          testElement: false,
        },
      });

      expect(invalidElementResult).toBe(undefined);
    });

    inputResult!.update('test value');

    expect(get(data)).toEqual({
      fieldset: {
        testInput: 'test value',
        testChange: '',
        testElement: '',
      },
    });

    expect(get(touched)).toEqual({
      fieldset: {
        testInput: false,
        testChange: false,
        testElement: false,
      },
    });

    blurResult!.update(true);

    expect(get(data)).toEqual({
      fieldset: {
        testInput: 'test value',
        testChange: '',
        testElement: '',
      },
    });

    expect(get(touched)).toEqual({
      fieldset: {
        testInput: true,
        testChange: false,
        testElement: false,
      },
    });

    changeResult!.update('another value');
    inputChangeResult!.update('normal value');

    expect(get(data)).toEqual({
      fieldset: {
        testInput: 'test value',
        testChange: 'another value',
        testElement: 'normal value',
      },
    });

    expect(get(touched)).toEqual({
      fieldset: {
        testInput: true,
        testChange: true,
        testElement: true,
      },
    });
  });
});
