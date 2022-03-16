import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { createForm } from './common';
import { validateSchema, validator } from '../src';
import { z } from 'zod';
import { get } from 'svelte/store';

const Validator = suite('Validator z');

type Data = {
  email: string;
  password: string;
};

Validator('correctly validates', async () => {
  const schema = z.object({
    email: z.string().email().nonempty(),
    password: z.string().nonempty(),
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
  const schema = z.object({
    account: z.object({
      email: z.string().email().nonempty(),
      password: z.string().nonempty(),
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
  const schema = z.object({
    email: z.string().email().nonempty(),
    password: z.string().nonempty(),
  });
  const warnSchema = z.object({
    password: z.string().refine((value) => (value ? value.length > 8 : true), {
      message: 'Password is not secure',
    }),
  });
  const mockData = {
    email: '',
    password: '',
  };
  const { validate, errors, warnings, data } = createForm<Data>({
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
  const schema = z.object({
    account: z.object({
      email: z.string().email().nonempty(),
      password: z.string().nonempty(),
    }),
  });
  const mockData = {
    account: {
      email: '',
      password: '',
    },
  };
  const { validate, errors, data } = createForm<{ account: Data }>({
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
  const schema = z.object({
    account: z.object({
      email: z.string().email().nonempty(),
      password: z.string().nonempty(),
    }),
  });
  const mockData = {
    account: {
      email: '',
      password: '',
    },
  };
  const { validate, errors, data } = createForm<{ account: Data }>({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    extend: validator({ schema }),
    validate: sinon.fake(() => ({
      account: {
        email: ['not an email'],
      },
    })),
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
  const schema = z.object({});
  const addValidator = sinon.fake();
  const validate = validator({ schema });
  validate({ stage: 'SETUP', addValidator } as any);
  sinon.assert.called(addValidator);

  addValidator.resetHistory();
  validate({ stage: 'MOUNT', addValidator } as any);
  sinon.assert.notCalled(addValidator);
});

Validator('Issue #116', async () => {
  const schema = z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((val) => val.start < val.end, {
      path: ['start'],
      message: 'Start date must be before end date',
    })
    .refine((val) => val.start < val.end, {
      path: ['end'],
      message: 'End date must be after start date',
    });

  const mockData = {
    start: new Date(3),
    end: new Date(2),
  };
  const { validate, errors, data } = createForm<typeof mockData>({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    extend: validator({ schema }),
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    start: ['Start date must be before end date'],
    end: ['End date must be after start date'],
  });

  data.set({
    start: new Date(1),
    end: new Date(2),
  });

  await validate();

  expect(get(errors)).to.deep.equal({
    start: null,
    end: null,
  });
});

Validator.run();
