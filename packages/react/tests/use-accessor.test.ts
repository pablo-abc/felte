import { renderHook, act } from '@testing-library/react-hooks';
import { writable } from 'svelte/store';
import { useAccessor } from '../src/use-accessor';

describe(useAccessor, () => {
  test('subscribes to primitive accessor', () => {
    const store = writable(true);
    const { result } = renderHook(() => useAccessor(store));
    expect(result.current()).toBe(true);
    act(() => store.set(false));
    expect(result.current()).toBe(false);
  });

  test('subscribest to accessor without selector', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useAccessor(store));
    expect(result.current()).toEqual({ email: '' });
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current()).toEqual({ email: 'zaphod@beeblebrox.com' });
  });

  test('subscribes to an accessor with a selector', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useAccessor(store));
    expect(result.current((data) => data.email)).toBe('');
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current((data) => data.email)).toBe('zaphod@beeblebrox.com');
    act(() => store.set({ email: 'jacek@soplica.com' }));
    expect(result.current((data) => data.email)).toBe('jacek@soplica.com');
  });

  test('subscribes to an accessor with a path', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useAccessor(store));
    expect(result.current('email')).toBe('');
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current('email')).toBe('zaphod@beeblebrox.com');
  });

  test('subscribes to an accessor with multiple selectors', () => {
    const store = writable({ email: '' });
    const { result } = renderHook(() => useAccessor(store));
    expect(result.current((data) => data.email)).toBe('');
    expect(result.current('email')).toBe('');
    act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
    expect(result.current((data) => data.email)).toBe('zaphod@beeblebrox.com');
    expect(result.current('email')).toBe('zaphod@beeblebrox.com');
  });
});
