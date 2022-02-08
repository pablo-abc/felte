import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect, use } from 'chai';
import chaiDom from 'chai-jsdom';
import userEvent from '@testing-library/user-event';
import type { Instance, Props } from 'tippy.js';
import { createForm, createDOM, cleanupDOM } from './common';
import { screen, waitFor } from '@testing-library/dom';
import reporter from '../src';
use(chaiDom);

function getTippy(element: any): Instance<Props> | undefined {
  return element?._tippy;
}

type ContentEditableProps = {
  name?: string;
  id?: string;
};

function createContentEditableInput(props: ContentEditableProps = {}) {
  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.setAttribute('tabindex', '0');
  if (props.name) div.dataset.felteReporterTippyFor = props.name;
  if (props.id) div.id = props.id;
  return div;
}

const Reporter = suite('Reporter Tippy Custom Control');

Reporter.before.each(createDOM);
Reporter.after.each(cleanupDOM);

Reporter('sets aria-invalid to input and removes if valid', async () => {
  type Data = {
    test: string;
    deep: {
      value: string;
    };
  };
  const mockErrors = { test: 'An error', deep: { value: 'Deep error' } };
  const mockValidate = sinon.stub().callsFake(() => mockErrors);
  const { form, validate } = createForm<Data>({
    initialValues: {
      test: '',
      deep: {
        value: '',
      },
    },
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditableInput({
    name: 'test',
  });
  const valueElement = createContentEditableInput({
    name: 'deep.value',
  });
  const fieldsetElement = document.createElement('fieldset');
  fieldsetElement.appendChild(valueElement);
  formElement.appendChild(inputElement);
  formElement.appendChild(fieldsetElement);

  form(formElement);

  await validate();

  await waitFor(() => {
    const inputInstance = getTippy(inputElement);
    expect(inputInstance?.popper).to.have.text.that.contains(mockErrors.test);
    expect(inputElement).to.be.invalid;
    const valueInstance = getTippy(valueElement);
    expect(valueInstance).to.be.ok;
    expect(valueInstance?.popper).to.have.text.that.contains(
      mockErrors.deep.value
    );
    expect(valueElement).to.be.invalid;
  });

  mockValidate.callsFake(() => ({} as any));

  await validate();

  await waitFor(() => {
    expect(inputElement).not.to.be.invalid;
    expect(valueElement).not.to.be.invalid;
  });
});

Reporter('show tippy on hover and hide on unhover', async () => {
  const mockErrors = { test: 'A test error' };
  const mockValidate = sinon.stub().callsFake(() => mockErrors);
  const { form, validate } = createForm({
    initialValues: {
      test: '',
    },
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditableInput({
    name: 'test',
  });
  formElement.appendChild(inputElement);

  const { destroy } = form(formElement);

  await validate();

  expect(getTippy(inputElement)).to.be.ok;

  userEvent.hover(inputElement);

  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(mockErrors.test);
  });

  userEvent.unhover(inputElement);

  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.not.be.ok;
  });

  mockValidate.callsFake(() => ({} as any));

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.not.be.ok;
    expect(tippyInstance?.state.isVisible).to.not.be.ok;
  });

  destroy();
});

Reporter('shows tippy if active element is input', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.fake(() => mockErrors);
  const { form, validate } = createForm({
    initialValues: {
      test: '',
    },
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditableInput({
    name: 'test',
    id: 'test',
  });
  formElement.appendChild(inputElement);

  inputElement.focus();

  form(formElement);

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(mockErrors.test);
  });
});

Reporter('focuses first invalid input and shows tippy on submit', async () => {
  type Data = {
    test: string;
    deep: {
      value: string;
    };
  };
  const mockErrors = { test: 'An error', deep: { value: 'Deep error' } };
  const mockValidate = sinon.fake(() => mockErrors);
  const { form } = createForm<Data>({
    initialValues: {
      test: '',
      deep: {
        value: '',
      },
    },
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter(),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditableInput({
    name: 'test',
  });
  const valueElement = createContentEditableInput({
    name: 'deep.value',
  });
  const fieldsetElement = document.createElement('fieldset');
  fieldsetElement.appendChild(valueElement);
  formElement.appendChild(fieldsetElement);
  formElement.appendChild(inputElement);

  form(formElement);

  formElement.submit();

  await waitFor(() => {
    expect(valueElement).to.be.focused;
    let tippyInstance = getTippy(valueElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(
      mockErrors.deep.value
    );
    tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(mockErrors.test);
  });
});

Reporter('sets custom content', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.fake(() => mockErrors);
  const { form, validate } = createForm({
    initialValues: {
      test: '',
    },
    onSubmit: sinon.fake(),
    validate: mockValidate,
    extend: reporter({
      setContent: (messages) => {
        return messages?.map((message) => `<p>${message}</p>`).join('');
      },
    }),
  });

  const formElement = screen.getByRole('form') as HTMLFormElement;
  const inputElement = createContentEditableInput({
    name: 'test',
    id: 'test',
  });
  formElement.appendChild(inputElement);

  inputElement.focus();

  form(formElement);

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
    expect(tippyInstance?.popper).to.have.text.that.contains(
      `<p>${mockErrors.test}</p>`
    );
  });
});

Reporter('sets custom props per field', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.fake(() => mockErrors);
  type TestData = {
    test: string;
  };
  const { form, validate } = createForm<TestData>({
    initialValues: {
      test: '',
    },
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
  const inputElement = createContentEditableInput({
    name: 'test',
    id: 'test',
  });
  formElement.appendChild(inputElement);

  inputElement.focus();

  form(formElement);

  await validate();

  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
  });

  userEvent.click(formElement);
  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance?.state.isEnabled).to.be.ok;
    expect(tippyInstance?.state.isVisible).to.be.ok;
  });
});

Reporter('handles mutation of DOM', async () => {
  const mockErrors = { test: 'An error' };
  const mockValidate = sinon.fake(() => mockErrors);
  type TestData = {
    test: string;
  };
  const { form } = createForm<TestData>({
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
  const inputElement = createContentEditableInput({
    name: 'test',
    id: 'test',
  });

  expect(getTippy(inputElement)).to.not.be.ok;

  form(formElement);

  formElement.appendChild(inputElement);

  await waitFor(() => {
    const tippyInstance = getTippy(inputElement);
    expect(tippyInstance).to.be.ok;
  });
});

Reporter.run();
