import { waitFor } from '@testing-library/dom';
import { createStores } from '../src/stores';
import { createRoot } from 'solid-js';

describe('Stores', () => {
  test('Updates value of isSubmitting', () => {
    const stores = createStores({ onSubmit: jest.fn() });

    const isSubmitting = stores.isSubmitting.getter();
    expect(isSubmitting()).toBe(false);
    stores.isSubmitting.update((v) => !v);
    expect(isSubmitting()).toBe(true);
  });

  test('Subscribes to isSubmitting', async () => {
    const mockFn = jest.fn();
    createRoot(() => {
      const stores = createStores({ onSubmit: jest.fn() });

      expect(mockFn).not.toHaveBeenCalled();

      stores.isSubmitting.subscribe(mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);

      stores.isSubmitting.set(true);
    });
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(true);
    });
  });

  test('Updates value of isDirty', () => {
    const stores = createStores({ onSubmit: jest.fn() });

    const isDirty = stores.isDirty.getter();
    expect(isDirty()).toBe(false);
    stores.isDirty.update((v) => !v);
    expect(isDirty()).toBe(true);
  });

  test('Subscribes to isDirty', async () => {
    const mockFn = jest.fn();
    createRoot(() => {
      const stores = createStores({ onSubmit: jest.fn() });

      expect(mockFn).not.toHaveBeenCalled();

      stores.isDirty.subscribe(mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);

      stores.isDirty.set(true);
    });
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(true);
    });
  });
});
