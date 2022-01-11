import { _isPlainObject } from '@felte/core';
import { waitFor } from '@testing-library/dom';
import { createRoot } from 'solid-js';
import { storeFactory } from '../src/stores';

describe('Stores', () => {
  test('Creates signal observable', () => {
    const observable = storeFactory(true);
    expect(_isPlainObject(observable.getSolidValue())).toBe(false);
  });

  test('Updates signal observable', async () => {
    const mockFn = jest.fn();
    createRoot(() => {
      const observable = storeFactory(true);
      observable.subscribe(mockFn);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(true);

      observable.update((v) => !v);
    });
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(false);
    });
  });

  test('Sets signal observable', async () => {
    const mockFn = jest.fn();
    createRoot(() => {
      const observable = storeFactory(true);
      observable.subscribe(mockFn);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(true);

      observable.set(false);
    });
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(false);
    });
  });
});
