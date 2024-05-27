import matchers from '@testing-library/jest-dom/matchers';
import { expect, describe, test, vi } from 'vitest';
import { createForm } from './common';
import { validateSchema, validator } from '../src';
import { z, ZodSchema } from 'zod';
import { get } from 'svelte/store';

expect.extend(matchers);

type Data = {
  email: string;
  password: string;
};

describe('Validator zod', () => {
  test('correctly validates', async () => {
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
      onSubmit: vi.fn(),
      validate: validateSchema(schema),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      email: ['Invalid email', 'String must contain at least 1 character(s)'],
      password: ['String must contain at least 1 character(s)'],
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

  test('correctly validates deep form', async () => {
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
      onSubmit: vi.fn(),
      validate: validateSchema(schema),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      account: {
        email: ['Invalid email', 'String must contain at least 1 character(s)'],
        password: ['String must contain at least 1 character(s)'],
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

  test('correctly validates with extend', async () => {
    const schema = z.object({
      email: z.string().email().nonempty(),
      password: z.string().nonempty(),
    });
    const warnSchema = z.object({
      password: z
        .string()
        .refine((value) => (value ? value.length > 8 : true), {
          message: 'Password is not secure',
        }),
    });
    const mockData = {
      email: '',
      password: '',
    };
    const { validate, errors, warnings, data } = createForm<Data>({
      initialValues: mockData,
      onSubmit: vi.fn(),
      extend: [
        validator({ schema }),
        validator({ schema: warnSchema, level: 'warning' }),
      ],
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      email: ['Invalid email', 'String must contain at least 1 character(s)'],
      password: ['String must contain at least 1 character(s)'],
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

  test('correctly validates deep form with extend', async () => {
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
      onSubmit: vi.fn(),
      extend: validator({ schema }),
    });

    await validate();

    expect(get(data)).to.deep.equal(mockData);
    expect(get(errors)).to.deep.equal({
      account: {
        email: ['Invalid email', 'String must contain at least 1 character(s)'],
        password: ['String must contain at least 1 character(s)'],
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

  test('correctly validates deep form with other validate', async () => {
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
      onSubmit: vi.fn(),
      extend: validator({ schema }),
      validate: vi.fn(() => ({
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
          'String must contain at least 1 character(s)',
        ],
        password: ['String must contain at least 1 character(s)'],
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

  test('does not call addValidator when stage is not `SETUP`', () => {
    const schema = z.object({});
    const addValidator = vi.fn();
    const validate = validator({ schema });
    validate({ stage: 'SETUP', addValidator } as any);
    expect(addValidator).toHaveBeenCalled();

    addValidator.mockClear();
    validate({ stage: 'MOUNT', addValidator } as any);
    expect(addValidator).not.toHaveBeenCalled();
  });

  test('Issue #116', async () => {
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
      onSubmit: vi.fn(),
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

  test('Allow null input', async () => {
    const schema = z.object({
      elems: z.object({ name: z.string() }).optional().array(),
    });
    const mockData = { elems: [null, { name: '' }] };

    const { validate, errors } = createForm({
      initialValues: mockData,
      onSubmit: vi.fn(),
      extend: validator({ schema }),
    });

    await validate();

    expect(get(errors)).to.deep.equal({
      elems: [{ 0: null }, { name: null }],
    });
  });

  test('should surface union type errors', async () => {
    async function t(schema: ZodSchema, initialValues: object) {
      const { validate, errors } = createForm({
        initialValues,
        extend: validator({ schema }),
      });
      await validate();
      return get(errors);
    }

    const schema = z.object({ foo: z.string().min(1) });
    const data = { foo: '' };

    const unionErrors = await t(z.union([schema, schema]), data);
    const errors = await t(schema, data);

    expect(unionErrors).to.deep.equal(errors);
  });

  test('should surface discriminatedUnion type errors', async () => {
    async function t(schema: ZodSchema, initialValues: object) {
      const { validate, errors } = createForm({
        initialValues,
        extend: validator({ schema }),
      });
      await validate();
      return get(errors);
    }

    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('foo'), foo: z.string().min(1) }),
      z.object({ type: z.literal('bar'), bar: z.string().min(1) })
    ], { errorMap: () => ({ message: 'Oops' }) });

    const errors = await t(schema, { type: 'baz' });

    expect(errors).to.deep.equal({ type: ['Oops'] });
  });
});
