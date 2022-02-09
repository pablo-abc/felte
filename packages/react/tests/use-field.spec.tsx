import React from 'react';
import { suite } from 'uvu';
import { expect, extend } from 'uvu-expect';
import uvuDOM from 'uvu-expect-dom';
import { render, waitFor } from '@testing-library/react';
import { useField } from '../src';
extend(uvuDOM);

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
