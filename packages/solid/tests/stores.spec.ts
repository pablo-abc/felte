import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { storeFactory } from '../src/stores';
import { waitFor } from '@testing-library/dom';

describe('createStores', () => {
  test('Updates signal observable', async () => {
    const mockFn = vi.fn();
    const observable = storeFactory(true);
    observable.subscribe(mockFn);
    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith(true);

    observable.update((v) => !v);
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(false);
    });
  });

  test('Sets signal observable', async () => {
    const mockFn = vi.fn();
    const observable = storeFactory(true);
    observable.subscribe(mockFn);
    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith(true);

    observable.set(false);
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(false);
    });
  });
});
