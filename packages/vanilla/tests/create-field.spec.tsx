import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test } from 'vitest';
import { waitFor } from '@testing-library/dom';
import { createField } from '../src';

expect.extend(matchers);

function createContentEditable() {
  const input = document.createElement('div');
  input.contentEditable = 'true';
  input.tabIndex = 0;
  input.setAttribute('role', 'textbox');
  return input;
}

describe('Correctly uses createField', () => {
  test('adds hidden input', async () => {
    const div = createContentEditable();
    document.body.appendChild(div);
    const { field } = createField('test');
    const { destroy } = field(div);

    expect(document.querySelector('[name="test"]')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelector('[name="test"]')).toBeInTheDocument();
    });
    destroy?.();
  });
});
