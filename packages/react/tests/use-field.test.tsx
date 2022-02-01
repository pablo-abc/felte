import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useField } from '../src';

describe('correctly uses useField', () => {
  test('adds hidden input', async () => {
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
      expect(document.querySelector('[name="test"]')).toBeInTheDocument();
    });
    unmount();
  });
});