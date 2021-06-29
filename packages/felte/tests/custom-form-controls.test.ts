import { screen, waitFor } from '@testing-library/dom';
import { cleanupDOM, createDOM } from './common';
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
    fieldsetElement.appendChild(inputEditable);
    fieldsetElement.appendChild(changeEditable);
    formElement.appendChild(fieldsetElement);

    const { form, data, touched } = createForm({
      onSubmit: jest.fn(),
    });

    form(formElement);

    const inputResult = dispatchInput(inputEditable, '');
    const blurResult = dispatchBlur(inputEditable);
    const changeResult = dispatchChange(changeEditable, '');

    await waitFor(() => {
      expect(get(data)).toEqual({
        fieldset: {
          testInput: '',
          testChange: '',
        },
      });

      expect(get(touched)).toEqual({
        fieldset: {
          testInput: false,
          testChange: false,
        },
      });
    });

    inputResult!.update('test value');

    expect(get(data)).toEqual({
      fieldset: {
        testInput: 'test value',
        testChange: '',
      },
    });

    expect(get(touched)).toEqual({
      fieldset: {
        testInput: false,
        testChange: false,
      },
    });

    blurResult!.update(true);

    expect(get(data)).toEqual({
      fieldset: {
        testInput: 'test value',
        testChange: '',
      },
    });

    expect(get(touched)).toEqual({
      fieldset: {
        testInput: true,
        testChange: false,
      },
    });

    changeResult!.update('another value');

    expect(get(data)).toEqual({
      fieldset: {
        testInput: 'test value',
        testChange: 'another value',
      },
    });

    expect(get(touched)).toEqual({
      fieldset: {
        testInput: true,
        testChange: true,
      },
    });
  });
});
