import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, extend } from 'uvu-expect';
import uvuDOM from 'uvu-expect-dom';
import { createForm } from './common';
import { validateStruct, validator } from '../src';
import type { Infer } from 'superstruct';
import { object, string, size, coerce, date, any, refine } from 'superstruct';
import { get } from 'svelte/store';
extend(uvuDOM);

const Validator = suite('Validator superstruct');

Validator('correctly validates', async () => {
  const struct = object({
    email: size(string(), 1, Infinity),
    password: size(string(), 1, Infinity),
  });
  const mockData = {
    email: '',
    password: '',
  };
  const { validate, errors, data } = createForm({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    validate: validateStruct(struct),
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    email: [
      'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    ],
    password: [
      'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    ],
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
  const struct = object({
    account: object({
      email: size(string(), 1, Infinity),
      password: size(string(), 1, Infinity),
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
    validate: validateStruct(struct),
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    account: {
      email: [
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      ],
      password: [
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      ],
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
  const struct = object({
    email: size(string(), 1, Infinity),
    password: size(string(), 1, Infinity),
  });
  const secure = refine(string(), 'secure', (value) =>
    value ? value.length > 8 : true
  );
  const warnStruct = object({
    email: any(),
    password: secure,
  });
  const mockData = {
    email: '',
    password: '',
  };
  const { validate, errors, warnings, data } = createForm<Infer<typeof struct>>(
    {
      initialValues: mockData,
      onSubmit: sinon.fake(),
      extend: [
        validator({
          struct,
        }),
        validator({
          struct: warnStruct,
          level: 'warning',
          transform: (failure) => {
            if (failure.refinement === 'secure') return 'Not secure';
            return failure.message;
          },
        }),
      ],
    }
  );

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    email: [
      'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    ],
    password: [
      'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    ],
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
    password: ['Not secure'],
  });
});

Validator('correctly validates deep form with extend', async () => {
  const struct = object({
    account: object({
      email: size(string(), 1, Infinity),
      password: size(string(), 1, Infinity),
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
    extend: validator({ struct }),
  });

  await validate();

  expect(get(data)).to.deep.equal(mockData);
  expect(get(errors)).to.deep.equal({
    account: {
      email: [
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      ],
      password: [
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      ],
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

Validator(
  'correctly validates deep form with extend and transform',
  async () => {
    const struct = object({
      account: object({
        email: size(string(), 1, Infinity),
        password: size(string(), 1, Infinity),
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
      extend: validator({
        struct,
        transform: (value) =>
          value.type === 'string' ? 'Must not be empty' : 'Not valid',
      }),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      account: {
        email: ['Must not be empty'],
        password: ['Must not be empty'],
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
  }
);

Validator('correctly validates deep form with extend', async () => {
  const struct = object({
    account: object({
      email: size(string(), 1, Infinity),
      password: size(string(), 1, Infinity),
    }),
  });
  const mockData = {
    account: {
      email: '',
      password: '',
    },
  };
  const { validate, errors, data } = createForm<Infer<typeof struct>>({
    initialValues: mockData,
    onSubmit: sinon.fake(),
    extend: validator({ struct }),
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
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      ],
      password: [
        'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
      ],
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

Validator('correctly validates form with coercion', async () => {
  const struct = object({
    name: size(string(), 1, Infinity),
    date: coerce(date(), string(), (value) => new Date(value)),
  });

  type Data = {
    name: string;
    date: Date;
  };

  const { validate, errors, data } = createForm<Data>({
    onSubmit: sinon.fake(),
    extend: validator({ struct, castValues: true }),
  });

  data.set({
    name: '',
    // @ts-expect-error intentionally setting invalid type
    date: 'Not A Date',
  });

  expect(get(data).name).to.deep.equal('');
  expect(get(data).date).to.be.instanceOf(Date);
  expect(get(data).date.getTime()).to.be.NaN;

  await validate();

  expect(get(errors)).to.deep.equal({
    name: [
      'Expected a string with a length between `1` and `Infinity` but received one with a length of `0`',
    ],
    date: ['Expected a valid `Date` object, but received: Invalid Date'],
  });

  data.set({
    name: 'test@email.com',
    // @ts-expect-error coercing this to a date
    date: '2021-06-09',
  });

  expect(get(data)).to.deep.equal({
    name: 'test@email.com',
    date: new Date('2021-06-09'),
  });

  await validate();

  expect(get(errors)).to.deep.equal({
    name: null,
    date: null,
  });
});

Validator('does not call addValidator when stage is not `SETUP`', () => {
  const struct = object({});
  const addValidator = sinon.fake();
  const validate = validator({ struct });
  validate({ stage: 'SETUP', addValidator } as any);
  sinon.assert.called(addValidator);

  addValidator.resetHistory();
  validate({ stage: 'MOUNT', addValidator } as any);
  sinon.assert.notCalled(addValidator);
});

Validator.run();
