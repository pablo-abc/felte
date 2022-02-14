import 'uvu-expect-dom/extend';
import React from 'react';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { render, waitFor } from '@testing-library/react';
import { useField } from '../src';

const Field = suite('Correctly uses useField');

Field('adds hidden input', async () => {
  function CustomInput() {
    const { field, onChange, onBlur } = useField('test');

    return (
      <div
        contentEditable
        tabIndex={0}
        ref={field}
        role="textbox"
        onChange={(e) => onChange(e.currentTarget.innerText)}
        onBlur={onBlur}
      />
    );
  }
  const { unmount } = render(<CustomInput />);

  await waitFor(() => {
    expect(document.querySelector('[name="test"]')).to.not.be.in.document;
  });
  unmount();
});

Field.run();
