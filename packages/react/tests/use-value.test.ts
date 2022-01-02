import { renderHook, act } from '@testing-library/react-hooks';
import { writable } from 'svelte/store';
import { useValue } from '../src';

describe(useValue, () => {
  test('subscribes to primitive store', () => {
    const store = writable(true);
    const { result } = renderHook(() => useValue(store));
    expect(result.current).toBe(true);
    act(() => store.set(false));
    expect(result.current).toBe(false);
  });

  test('subscribes to object store without selector', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useValue(store));
    expect(result.current).toEqual({ email: '' });
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current).toEqual({ email: 'zaphod@beeblebrox.com' });
  });

  test('subscribes to a store with a selector', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useValue(store, (data) => data.email));
    expect(result.current).toBe('');
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current).toBe('zaphod@beeblebrox.com');
  });

  test('subscribes to a store with a path', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useValue(store, 'email'));
    expect(result.current).toBe('');
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current).toBe('zaphod@beeblebrox.com');
  });
});
