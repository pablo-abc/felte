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

  test('Creates store observable', () => {
    const observable = storeFactory({});
    expect(_isPlainObject(observable.getSolidValue())).toBe(true);
  });

  test('Updates store observable', async () => {
    const mockFn = jest.fn();
    createRoot(() => {
      const observable = storeFactory({});
      observable.subscribe(mockFn);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({}));

      observable.update((v) => ({ ...v, value: 'test' }));
    });
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'test' })
      );
    });
  });

  test('Sets store observable', async () => {
    const mockFn = jest.fn();
    createRoot(() => {
      const observable = storeFactory({});
      observable.subscribe(mockFn);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({}));

      observable.set({ value: 'test' });
    });
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'test' })
      );
    });
  });
});
