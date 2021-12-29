import { renderHook, act } from '@testing-library/react-hooks';
import { writable } from 'svelte/store';
import { useSubscriber } from '../src';

describe(useSubscriber, () => {
  test('subscribes to primitive store', () => {
    const store = writable(true);
    const { result } = renderHook(() => useSubscriber(store));
    expect(result.current).toBe(true);
    act(() => store.set(false));
    expect(result.current).toBe(false);
  });

  test('subscribes to object store without selector', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useSubscriber(store));
    expect(result.current).toEqual({ email: '' });
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current).toEqual({ email: 'zaphod@beeblebrox.com' });
  });

  test('subscribes to a store with a selector', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() =>
      useSubscriber(store, (data) => data.email)
    );
    expect(result.current).toBe('');
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current).toBe('zaphod@beeblebrox.com');
  });
});
