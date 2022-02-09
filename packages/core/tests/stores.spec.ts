import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { waitFor } from '@testing-library/dom';
import { createStores, errorFilterer, warningFilterer } from '../src/stores';
import { writable, get } from 'svelte/store';

const Stores = suite('createStores');

Stores('filters errors', async () => {
  const { start, cleanup, errors, touched, warnings } = createStores(writable, {
    initialValues: {
      arr: [
        {
          value: '',
        },
      ],
      strings: ['test'],
    },
    preventStoreStart: true,
  });
  const clean = start();
  await waitFor(() => {
    expect(get(errors)).to.deep.equal({
      arr: [
        {
          value: null,
        },
      ],
      strings: null,
    });
    expect(get(warnings)).to.deep.equal({
      arr: [
        {
          value: null,
        },
      ],
      strings: null,
    });
  });
  errors.set({
    arr: [
      {
        value: 'test error',
      },
    ],
    strings: [],
  });
  touched.set({
    arr: [
      {
        value: true,
      },
    ],
    strings: [true],
  });
  await waitFor(() => {
    expect(get(errors)).to.deep.equal({
      arr: [
        {
          value: ['test error'],
        },
      ],
      strings: [null],
    });
  });
  cleanup();
  clean();
});

const Filterers = suite('Filterers');

Filterers('errorFilterer', () => {
  expect(errorFilterer({ touched: true }, undefined)).to.deep.equal({
    touched: null,
  });
  expect(errorFilterer(['test'], undefined)).to.deep.equal([null]);
  expect(errorFilterer(['test'], ['err'])).to.deep.equal(['err']);
  expect(errorFilterer(['test'], [['err']])).to.deep.equal([['err']]);
  expect(errorFilterer(['test'], [[]])).to.deep.equal([null]);
  expect(errorFilterer(undefined, [])).to.deep.equal(null);
  expect(errorFilterer(undefined, ['err'])).to.deep.equal(null);
  expect(errorFilterer(true, ['err'])).to.deep.equal(['err']);
  expect(errorFilterer(true, 'err')).to.deep.equal(['err']);
  expect(errorFilterer(false, 'err')).to.deep.equal(null);
  expect(errorFilterer(true, '')).to.deep.equal(null);
});

Filterers('warningFilterer', () => {
  expect(warningFilterer({ touched: true }, undefined)).to.deep.equal({
    touched: null,
  });
  expect(warningFilterer(['test'], undefined)).to.deep.equal([null]);
  expect(warningFilterer(['test'], ['err'])).to.deep.equal(['err']);
  expect(warningFilterer(['test'], [['err']])).to.deep.equal([['err']]);
  expect(warningFilterer(['test'], [[]])).to.deep.equal([null]);
  expect(warningFilterer(undefined, [])).to.deep.equal(null);
  expect(warningFilterer(undefined, ['err'])).to.deep.equal(['err']);
  expect(warningFilterer(true, ['err'])).to.deep.equal(['err']);
  expect(warningFilterer(true, 'err')).to.deep.equal(['err']);
  expect(warningFilterer(false, 'err')).to.deep.equal(['err']);
  expect(warningFilterer(true, '')).to.deep.equal(null);
});

Stores.run();

Filterers.run();
