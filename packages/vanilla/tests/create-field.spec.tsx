import 'uvu-expect-dom/extend';
import { waitFor } from '@testing-library/dom';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { createField } from '../src';

function createContentEditable() {
  const input = document.createElement('div');
  input.contentEditable = 'true';
  input.tabIndex = 0;
  input.setAttribute('role', 'textbox');
  return input;
}

const Field = suite('Correctly uses createField');

Field('adds hidden input', async () => {
  const div = createContentEditable();
  document.body.appendChild(div);
  const { field } = createField('test');
  const { destroy } = field(div);

  expect(document.querySelector('[name="test"]')).to.not.be.in.document;
  await waitFor(() => {
    expect(document.querySelector('[name="test"]')).to.be.in.document;
  });
  destroy?.();
});

Field.run();
