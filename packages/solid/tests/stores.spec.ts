import * as sinon from 'sinon';
import { suite } from 'uvu';
import { storeFactory } from '../src/stores';
import { waitFor } from '@testing-library/dom';

const Stores = suite('createStores');

Stores('Updates signal observable', async () => {
  const mockFn = sinon.fake();
  const observable = storeFactory(true);
  observable.subscribe(mockFn);
  sinon.assert.calledOnce(mockFn);
  sinon.assert.calledWith(mockFn, true);

  observable.update((v) => !v);
  await waitFor(() => {
    sinon.assert.calledTwice(mockFn);
    sinon.assert.calledWith(mockFn, false);
  });
});

Stores('Sets signal observable', async () => {
  const mockFn = sinon.fake();
  const observable = storeFactory(true);
  observable.subscribe(mockFn);
  sinon.assert.calledOnce(mockFn);
  sinon.assert.calledWith(mockFn, true);

  observable.set(false);
  await waitFor(() => {
    sinon.assert.calledTwice(mockFn);
    sinon.assert.calledWith(mockFn, false);
  });
});

Stores.run();
