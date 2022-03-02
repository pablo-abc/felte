import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { renderHook, act } from '@testing-library/preact-hooks';
import { writable } from 'svelte/store';
import { useAccessor } from '../src/use-accessor';

const Accessor = suite('useAccessor');

Accessor('subscribes to primitive accessor', () => {
  const store = writable(true);
  const { result } = renderHook(() => useAccessor(store));
  expect(result.current?.()).to.be.true;
  act(() => store.set(false));
  expect(result.current?.()).to.be.false;
});

Accessor('subscribes to accessor without selector', () => {
  const store = writable({ email: '' });
  const { result } = renderHook(() => useAccessor(store));
  expect(result.current?.()).to.deep.equal({ email: '' });
  act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
  expect(result.current?.()).to.deep.equal({ email: 'zaphod@beeblebrox.com' });
});

Accessor('subscribes to an accessor with a selector', () => {
  const store = writable({ email: '' });
  const { result } = renderHook(() => useAccessor(store));
  expect(result.current?.((data) => data.email)).to.equal('');
  act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
  expect(result.current?.((data) => data.email)).to.equal(
    'zaphod@beeblebrox.com'
  );
  act(() => store.set({ email: 'jacek@soplica.com' }));
  expect(result.current?.((data) => data.email)).to.equal('jacek@soplica.com');
});

Accessor('subscribes to an accessor with a path', () => {
  const store = writable({ email: '' });
  const { result } = renderHook(() => useAccessor(store));
  expect(result.current?.('email')).to.equal('');
  act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
  expect(result.current?.('email')).to.equal('zaphod@beeblebrox.com');
});

Accessor('subscribes to an accessor with multiple selectors', () => {
  const store = writable({ email: '' });
  const { result } = renderHook(() => useAccessor(store));
  expect(result.current?.((data) => data.email)).to.equal('');
  expect(result.current?.('email')).to.equal('');
  act(() => store.set({ email: 'zaphod@beeblebrox.com' }));
  expect(result.current?.((data) => data.email)).to.equal(
    'zaphod@beeblebrox.com'
  );
  expect(result.current?.('email')).to.equal('zaphod@beeblebrox.com');
});

Accessor.run();
