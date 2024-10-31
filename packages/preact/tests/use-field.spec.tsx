// eslint-disable-next-line
import { h } from 'preact';
import '@testing-library/jest-dom/vitest';
import { expect, describe, test } from 'vitest';
import { render, waitFor } from '@testing-library/preact';
import { useField } from '../src';

describe('Correctly uses useField', () => {
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
      expect(document.querySelector('[name="test"]')).not.toBeInTheDocument();
    });
    unmount();
  });
});
