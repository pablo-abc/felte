import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom from 'chai-jsdom';
import userEvent from '@testing-library/user-event';
import type { Instance, Props } from 'tippy.js';
import {
  createForm,
  createDOM,
  cleanupDOM,
  createInputElement,
} from './common';
import { screen, waitFor } from '@testing-library/dom';
import reporter from '../src';
use(chaiDom);

function getTippy(element: any): Instance<Props> | undefined {
  return element?._tippy;
}

const Reporter = suite('Reporter Tippy Custom Position');

Reporter.before.each(createDOM);
Reporter.after.each(cleanupDOM);

Reporter('sets aria-invalid to input and removes if valid', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form, validate } = createForm({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'test';
  formElement.appendChild(labelElement);
  formElement.appendChild(inputElement);

  form(formElement);

  await validate();

  await waitFor(() => {
    expect(inputElement).to.be.invalid;
  });

  mockValidate.callsFake(() => ({} as any));

  await validate();

  await waitFor(() => {
    expect(inputElement).not.to.be.invalid;
  });
});

Reporter('show tippy on hover and hide on unhover', async () => {
  const mockErrors = { test: 'A test error' };
  const mockValidate = sinon.stub().callsFake(() => mockErrors);
  const { form, validate } = createForm({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'test';
  formElement.appendChild(labelElement);
  formElement.appendChild(inputElement);

  const { destroy } = form(formElement);

  await validate();

  expect(getTippy(labelElement)).to.be.ok;

  userEvent.hover(inputElement);

  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(mockErrors.test);
  });

  userEvent.unhover(inputElement);

  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.not.be.ok;
  });

  mockValidate.callsFake(() => ({} as any));

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.not.be.ok;
    expect(tippyInstance?.state.isVisible).to.not.be.ok;
  });

  destroy();
});

Reporter('shows tippy if active element is input', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form, validate } = createForm({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
    id: 'test',
  });
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'test';
  formElement.appendChild(labelElement);
  formElement.appendChild(inputElement);

  inputElement.focus();

  form(formElement);

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(mockErrors.test);
  });
});

Reporter('focuses first invalid input and shows tippy on submit', async () => {
  const mockErrors = { test: 'A test error' };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form } = createForm({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'test';
  formElement.appendChild(labelElement);
  formElement.appendChild(inputElement);

  form(formElement);

  formElement.submit();

  await waitFor(() => {
    expect(inputElement).to.have.focus;
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(mockErrors.test);
  });
});

Reporter('sets custom content', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.stub().returns(mockErrors);
  const { form, validate } = createForm({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter({
      setContent: (messages) => {
        return messages?.map((message) => `<p>${message}</p>`).join('');
      },
    }),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
    id: 'test',
  });
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'test';
  formElement.appendChild(labelElement);
  formElement.appendChild(inputElement);

  inputElement.focus();

  form(formElement);

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(
      `<p>${mockErrors.test}</p>`
    );
  });
});

Reporter('sets custom props per field', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.stub().returns(mockErrors);
  type TestData = {
    test: string;
  };
  const { form, validate } = createForm<TestData>({
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter<TestData>({
      tippyPropsMap: {
        test: {
          hideOnClick: false,
        },
      },
    }),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
    id: 'test',
  });
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'test';
  formElement.appendChild(labelElement);
  formElement.appendChild(inputElement);

  inputElement.focus();

  form(formElement);

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
  });

  userEvent.click(formElement);
  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
  });
});

Reporter('ignores tippy', async () => {
  const { form } = createForm({
    onSubmit: sinon.fake(),
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });
  inputElement.dataset.felteReporterTippyIgnore = '';
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'test';
  formElement.appendChild(labelElement);
  formElement.appendChild(inputElement);

  form(formElement);

  await waitFor(() => {
    const tippyInstance = getTippy(labelElement);
    expect(tippyInstance).to.not.be.ok;
  });
});

Reporter('shows custom position properly on nested forms', async () => {
  const { form } = createForm({
    onSubmit: sinon.fake(),
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createInputElement({
    name: 'group.test',
    type: 'text',
    id: 'group-test',
  });
  const fieldsetElement = document.createElement('fieldset');
  const labelElement = document.createElement('label');
  labelElement.dataset.felteReporterTippyPositionFor = 'group.test';
  labelElement.htmlFor = 'group-test';
  fieldsetElement.appendChild(labelElement);
  fieldsetElement.appendChild(inputElement);
  formElement.appendChild(fieldsetElement);

  form(formElement);

  await waitFor(() => {
    expect(getTippy(labelElement)).to.be.ok;
    expect(getTippy(inputElement)).to.not.be.ok;
  });
});

Reporter.run();
