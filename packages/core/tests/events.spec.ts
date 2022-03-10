import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
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

Events.run();
