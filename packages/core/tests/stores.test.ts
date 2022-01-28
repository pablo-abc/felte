import { waitFor } from '@testing-library/dom';
import { createStores } from '../src/stores';
import { writable, get } from 'svelte/store';

describe('createStores', () => {
  test('filters errors', async () => {
    const { start, cleanup, errors, touched, warnings } = createStores(
      writable,
      {
        initialValues: {
          arr: [
            {
              value: '',
            },
          ],
          strings: ['test'],
        },
        preventStoreStart: true,
      }
    );
    const clean = start();
    await waitFor(() => {
      expect(get(errors)).toEqual({
        arr: [
          {
            value: null,
          },
        ],
        strings: null,
      });
      expect(get(warnings)).toEqual({
        arr: [
          {
            value: null,
          },
        ],
        strings: null,
      });
    });
    errors.set({
      arr: [
        {
          value: 'test error',
        },
      ],
      strings: [],
    });
    touched.set({
      arr: [
        {
          value: true,
        },
      ],
      strings: [true],
    });
    await waitFor(() => {
      expect(get(errors)).toEqual({
        arr: [
          {
            value: ['test error'],
          },
        ],
        strings: [null],
      });
    });
    cleanup();
    clean();
  });
});
