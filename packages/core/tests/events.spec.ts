import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import { createForm } from './common';
import { FelteSubmitEvent, FelteErrorEvent, FelteSuccessEvent } from '../src';

const Events = suite('Felte Events');

Events('success event should set details', () => {
  const event = new FelteSuccessEvent({
    response: 'test',
  } as any);
  expect(event).to.have.property('detail').that.matches({ response: 'test' });
});

Events('submit event should allow setting handler', () => {
  const event = new FelteSubmitEvent();
  const mockFn = sinon.fake();
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

Events('error event should allow to set errors', () => {
  const event = new FelteErrorEvent({ error: 'error' } as any);
  expect(event).to.have.property('detail').that.matches({ error: 'error' });
  expect(event.errors).to.be.undefined;
  expect(event.defaultPrevented).to.be.false;
  event.setErrors({ error: 'error' });
  expect(event.errors).to.match({ error: 'error' });
  expect(event.defaultPrevented).to.be.true;
});

Events('throws when error event is not default prevented', async () => {
  const formElement = document.createElement('form');
  document.body.appendChild(formElement);
  const onSubmit = sinon.fake(() => {
    throw new Error('Something went wrong');
  });

  const { form, createSubmitHandler } = createForm<any>({
    onSubmit,
  });

  const submit = createSubmitHandler();

  form(formElement);

  await expect(submit())
    .rejects.to.instanceOf(Error)
    .with.property('message')
    .that.equals('Something went wrong');

  document.body.removeChild(formElement);
});

Events('does not throw when error event is default prevented', async () => {
  const formElement = document.createElement('form');
  document.body.appendChild(formElement);
  const onSubmit = sinon.fake(() => {
    throw new Error('Something went wrong');
  });

  const handleError = sinon.fake((e: Event) => {
    e.preventDefault();
  });

  const { form, createSubmitHandler } = createForm<any>({
    onSubmit,
  });

  formElement.addEventListener('felteerror', handleError);

  const submit = createSubmitHandler();

  form(formElement);

  await expect(submit()).to.resolve;

  expect(handleError).to.have.been.called.with(
    expect.match.instanceOf(FelteErrorEvent)
  );

  document.body.removeChild(formElement);
});

Events.run();
