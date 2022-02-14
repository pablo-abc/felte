import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { createAccessor } from '../src/create-accessor';
import { createRoot } from 'solid-js';
import { storeFactory } from '../src/stores';

const Accessor = suite('createAccessor');

Accessor('subscribes to primitive accessor', () => {
  const store = storeFactory(true);
  const accessor = createRoot(() => createAccessor(store));
  expect(accessor()).to.be.true;
  store.set(false);
  expect(accessor()).to.be.false;
});

Accessor('subscribes to accessor without selector', () => {
  const store = storeFactory({ email: '' });
  const accessor = createRoot(() => createAccessor(store));
  expect(accessor()).to.deep.equal({ email: '' });
  store.set({ email: 'zaphod@beeblebrox.com' });
  expect(accessor()).to.deep.equal({ email: 'zaphod@beeblebrox.com' });
});

Accessor('subscribes to an accessor with a selector', () => {
  const store = storeFactory({ email: '' });
  const accessor = createRoot(() => createAccessor(store));
  expect(accessor((data) => data.email)).to.equal('');
  store.set({ email: 'zaphod@beeblebrox.com' });
  expect(accessor((data) => data.email)).to.equal('zaphod@beeblebrox.com');
  store.set({ email: 'jacek@soplica.com' });
  expect(accessor((data) => data.email)).to.equal('jacek@soplica.com');
  store.set({ email: 'jacek@soplica.com' });
  expect(accessor((data) => data.email)).to.equal('jacek@soplica.com');
});

Accessor('subscribes to an accessor with a path', () => {
  const store = storeFactory({ email: '' });
  const accessor = createRoot(() => createAccessor(store));
  expect(accessor('email')).to.equal('');
  store.set({ email: 'zaphod@beeblebrox.com' });
  expect(accessor('email')).to.equal('zaphod@beeblebrox.com');
});

Accessor('subscribes to an accessor with multiple selectors', () => {
  const store = storeFactory({ email: '' });
  const accessor = createRoot(() => createAccessor(store));
  expect(accessor((data) => data.email)).to.equal('');
  expect(accessor('email')).to.equal('');
  store.set({ email: 'zaphod@beeblebrox.com' });
  expect(accessor((data) => data.email)).to.equal('zaphod@beeblebrox.com');
  expect(accessor('email')).to.equal('zaphod@beeblebrox.com');
});

Accessor.run();
