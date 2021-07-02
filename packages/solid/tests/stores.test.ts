import { waitFor } from '@testing-library/dom';
import { createStores } from '../src/stores';
import { createRoot } from 'solid-js';

describe('Stores', () => {
  test('Updates value of isSubmitting', () => {
    const stores = createStores({ onSubmit: jest.fn() });

    const isSubmitting = stores.isSubmitting.get();
    expect(isSubmitting()).toBe(false);
    stores.isSubmitting.update((v) => !v);
    expect(isSubmitting()).toBe(true);
  });

  test('Subscribes to data', () => {
    createRoot(async (dispose) => {
      const stores = createStores({ onSubmit: jest.fn() });

      const mockFn = jest.fn();

      expect(mockFn).not.toHaveBeenCalled();

      stores.isSubmitting.subscribe(mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);

      stores.isSubmitting.set(true);

      await waitFor(() => {
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      dispose();
    });
  });
});
