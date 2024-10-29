import '@testing-library/jest-dom/vitest';
import { expect, describe, test, vi } from 'vitest';
import { createForm } from './common';
import { createEventConstructors } from '../src';

const { createErrorEvent, createSubmitEvent, createSuccessEvent } =
  createEventConstructors();

describe('Felte Events', () => {
  test('success event should set details', () => {
    const event = createSuccessEvent({
      response: 'test',
    } as any);
    expect(event)
      .to.have.property('detail')
      .that.contains({ response: 'test' });
  });

  test('submit event should allow setting handler', () => {
    const event = createSubmitEvent();
    const mockFn = vi.fn();
    expect(event.onSubmit).to.be.undefined;
    expect(event.onError).to.be.undefined;
    expect(event.onSuccess).to.be.undefined;
    event.handleSubmit(mockFn);
    event.handleError(mockFn);
    event.handleSuccess(mockFn);
    expect(event.onSubmit).to.equal(mockFn);
    expect(event.onError).to.equal(mockFn);
    expect(event.onSuccess).to.equal(mockFn);
  });

  test('error event should allow to set errors', () => {
    const event = createErrorEvent({
      error: 'error',
    } as any);
    expect(event).to.have.property('detail').that.contains({ error: 'error' });
    expect(event.errors).to.be.undefined;
    expect(event.defaultPrevented).to.be.false;
    event.setErrors({ error: 'error' });
    expect(event.errors).to.contain({ error: 'error' });
    expect(event.defaultPrevented).to.be.true;
  });

  test('throws when error event is not default prevented', async () => {
    const formElement = document.createElement('form');
    document.body.appendChild(formElement);
    const onSubmit = vi.fn().mockImplementation(() => {
      throw new Error('Something went wrong');
    });

    const { form, createSubmitHandler } = createForm<any>({
      onSubmit,
    });

    const submit = createSubmitHandler();

    form(formElement);

    await expect(submit()).rejects.toMatchObject(
      new Error('Something went wrong'),
    );

    document.body.removeChild(formElement);
  });

  test('does not throw when error event is default prevented', async () => {
    const formElement = document.createElement('form');
    document.body.appendChild(formElement);
    const onSubmit = vi.fn().mockImplementation(() => {
      throw new Error('Something went wrong');
    });

    const handleError = vi.fn().mockImplementation((e: Event) => {
      e.preventDefault();
    });

    const { form, createSubmitHandler } = createForm<any>({
      onSubmit,
    });

    formElement.addEventListener('felteerror', handleError);

    const submit = createSubmitHandler();

    form(formElement);

    await expect(submit()).resolves.toBeUndefined();

    expect(handleError).toHaveBeenCalledWith(expect.any(CustomEvent));

    document.body.removeChild(formElement);
  });
});
