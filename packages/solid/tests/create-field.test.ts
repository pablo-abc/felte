import { createField } from '../src';
import { onCleanup } from 'solid-js';

jest.mock('solid-js');

describe('createField export', () => {
  test('returns custom field handlers', () => {
    ((onCleanup as unknown) as jest.Mock<
      typeof onCleanup
    >).mockImplementation((cb) => cb());
    const inputElement = document.createElement('div');

    const field = createField('test');

    const r = field.field(inputElement);
    expect(r).toEqual({
      destroy: expect.any(Function),
    });
    expect(field).toEqual({
      field: expect.any(Function),
      onChange: expect.any(Function),
      onBlur: expect.any(Function),
      onInput: expect.any(Function),
    });
  });
});
