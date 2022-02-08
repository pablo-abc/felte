import * as sinon from 'sinon';
import type { ValidationFunction } from '@felte/common';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom from 'chai-jsdom';
import { createForm } from './common';
import { validateSchema, validator } from '../src';
import { z as zod } from 'zod';
import { get } from 'svelte/store';
use(chaiDom);

const Validator = suite('Validator zod');

Validator('correctly validates', async () => {
  const schema = zod.object({
    email: zod.string().email().nonempty(),
    password: zod.string().nonempty(),
  });
  const mockData = {
    email: '',
    password: '',
  };
  const { validate, errors, data } = createForm({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    validate: validateSchema(schema),
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    email: ['Invalid email', 'Should be at least 1 characters'],
    password: ['Should be at least 1 characters'],
  });

  data.set({
    email: 'test@email.com',
    password: 'test',
  });

  await validate();

  expect(get(errors)).to.deep.equal({
    email: null,
    password: null,
  });
});

Validator('correctly validates deep form', async () => {
  const schema = zod.object({
    account: zod.object({
      email: zod.string().email().nonempty(),
      password: zod.string().nonempty(),
    }),
  });
  const mockData = {
    account: {
      email: '',
      password: '',
    },
  };
  const { validate, errors, data } = createForm({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    validate: validateSchema(schema),
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    account: {
      email: ['Invalid email', 'Should be at least 1 characters'],
      password: ['Should be at least 1 characters'],
    },
  });

  data.set({
    account: {
      email: 'test@email.com',
      password: 'test',
    },
  });

  await validate();

  expect(get(errors)).to.deep.equal({
    account: {
      email: null,
      password: null,
    },
  });
});

Validator('correctly validates with extend', async () => {
  const schema = zod.object({
    email: zod.string().email().nonempty(),
    password: zod.string().nonempty(),
  });
  const warnSchema = zod.object({
    password: zod
      .string()
      .refine((value) => (value ? value.length > 8 : true), {
        message: 'Password is not secure',
      }),
  });
  const mockData = {
    email: '',
    password: '',
  };
  const { validate, errors, warnings, data } = createForm<typeof mockData>({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    extend: [
      validator({ schema }),
      validator({ schema: warnSchema, level: 'warning' }),
    ],
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    email: ['Invalid email', 'Should be at least 1 characters'],
    password: ['Should be at least 1 characters'],
  });
  expect(get(warnings)).to.deep.equal({
    email: null,
    password: null,
  });

  data.set({
    email: 'test@email.com',
    password: 'test',
  });

  await validate();

  expect(get(errors)).to.deep.equal({
    email: null,
    password: null,
  });
  expect(get(warnings)).to.deep.equal({
    email: null,
    password: ['Password is not secure'],
  });
});

Validator('correctly validates deep form with extend', async () => {
  const schema = zod.object({
    account: zod.object({
      email: zod.string().email().nonempty(),
      password: zod.string().nonempty(),
    }),
  });
  const mockData = {
    account: {
      email: '',
      password: '',
    },
  };
  const { validate, errors, data } = createForm<typeof mockData>({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    extend: validator({ schema }),
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    account: {
      email: ['Invalid email', 'Should be at least 1 characters'],
      password: ['Should be at least 1 characters'],
    },
  });

  data.set({
    account: {
      email: 'test@email.com',
      password: 'test',
    },
  });

  await validate();

  expect(get(errors)).to.deep.equal({
    account: {
      email: null,
      password: null,
    },
  });
});

Validator('correctly validates deep form with other validate', async () => {
  const schema = zod.object({
    account: zod.object({
      email: zod.string().email().nonempty(),
      password: zod.string().nonempty(),
    }),
  });
  const mockData = {
    account: {
      email: '',
      password: '',
    },
  };
  const { validate, errors, data } = createForm<typeof mockData>({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    extend: validator({ schema }),
    validate: sinon.fake(() => ({
      account: {
        email: ['not an email'],
      },
    })) as ValidationFunction<any>,
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    account: {
      email: [
        'not an email',
        'Invalid email',
        'Should be at least 1 characters',
      ],
      password: ['Should be at least 1 characters'],
    },
  });

  data.set({
    account: {
      email: 'test@email.com',
      password: 'test',
    },
  });

  await validate();

  expect(get(errors)).to.deep.equal({
    account: {
      email: ['not an email'],
      password: null,
    },
  });
});

Validator('does not call addValidator when stage is not `SETUP`', () => {
  const schema = zod.object({});
  const addValidator = sinon.fake();
  const validate = validator({ schema });
  validate({ stage: 'SETUP', addValidator } as any);
  sinon.assert.called(addValidator);

  addValidator.resetHistory();
  validate({ stage: 'MOUNT', addValidator } as any);
  sinon.assert.notCalled(addValidator);
});

Validator.run();
