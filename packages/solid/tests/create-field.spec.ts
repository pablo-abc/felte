import { suite } from 'uvu';
import { expect } from 'chai';
import { createField } from '../src';
import { createRoot } from 'solid-js';

const Field = suite('Custom controls with createField');

Field('returns custom field handlers', () => {
  const inputElement = document.createElement('div');

  const { field, dispose } = createRoot((dispose) => {
    const field = createField('test');
    return { field, dispose };
  });

  const r = field.field(inputElement);
  expect(r.destroy).to.be.instanceOf(Function);
  expect(field.field).to.be.instanceOf(Function);
  expect(field.onChange).to.be.instanceOf(Function);
  expect(field.onBlur).to.be.instanceOf(Function);
  expect(field.onInput).to.be.instanceOf(Function);
  dispose();
});

Field.run();
