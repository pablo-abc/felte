import { screen, waitFor } from '@testing-library/dom';
import { cleanupDOM, createInputElement, createDOM } from './common';
import { createForm } from '../src';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';

function createLoginForm() {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const emailInput = createInputElement({ name: 'email', type: 'email' });
  const passwordInput = createInputElement({
    name: 'password',
    type: 'password',
  });
  const submitInput = createInputElement({ type: 'submit' });
  const accountFieldset = document.createElement('fieldset');
  accountFieldset.name = 'account';
  accountFieldset.append(emailInput, passwordInput);
  formElement.append(accountFieldset, submitInput);
  return { formElement, emailInput, passwordInput, submitInput };
}

function createSignupForm() {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const emailInput = createInputElement({ name: 'email', type: 'email' });
  const passwordInput = createInputElement({
    name: 'password',
    type: 'password',
  });
  const showPasswordInput = createInputElement({
    name: 'showPassword',
    type: 'checkbox',
  });
  const confirmPasswordInput = createInputElement({
    name: 'confirmPassword',
    type: 'password',
  });
  const publicEmailYesRadio = createInputElement({
    name: 'publicEmail',
    value: 'yes',
    type: 'radio',
  });
  const publicEmailNoRadio = createInputElement({
    name: 'publicEmail',
    value: 'no',
    type: 'radio',
  });
  const accountFieldset = document.createElement('fieldset');
  accountFieldset.name = 'account';
  accountFieldset.append(
    emailInput,
    passwordInput,
    showPasswordInput,
    publicEmailYesRadio,
    publicEmailNoRadio,
    confirmPasswordInput
  );
  formElement.appendChild(accountFieldset);
  const profileFieldset = document.createElement('fieldset');
  profileFieldset.name = 'profile';
  const firstNameInput = createInputElement({ name: 'firstName' });
  const lastNameInput = createInputElement({ name: 'lastName' });
  const bioInput = createInputElement({ name: 'bio' });
  profileFieldset.append(firstNameInput, lastNameInput, bioInput);
  formElement.appendChild(profileFieldset);
  const pictureInput = createInputElement({
    name: 'profile.picture',
    type: 'file',
  });
  formElement.appendChild(pictureInput);
  const extraPicsInput = createInputElement({
    name: 'extra.pictures',
    type: 'file',
  });
  extraPicsInput.multiple = true;
  formElement.appendChild(extraPicsInput);
  const submitInput = createInputElement({ type: 'submit' });
  const techCheckbox = createInputElement({
    type: 'checkbox',
    name: 'preferences',
    value: 'technology',
  });
  const filmsCheckbox = createInputElement({
    type: 'checkbox',
    name: 'preferences',
    value: 'films',
  });
  formElement.append(techCheckbox, filmsCheckbox, submitInput);
  return {
    formElement,
    emailInput,
    passwordInput,
    confirmPasswordInput,
    showPasswordInput,
    publicEmailYesRadio,
    publicEmailNoRadio,
    firstNameInput,
    lastNameInput,
    bioInput,
    pictureInput,
    extraPicsInput,
    techCheckbox,
    filmsCheckbox,
    submitInput,
  };
}

describe('User interactions with form', () => {
  beforeEach(createDOM);

  afterEach(cleanupDOM);

  test('Sets default data correctly', () => {
    const { form, data } = createForm({
      onSubmit: jest.fn(),
    });
    const { formElement } = createSignupForm();
    form(formElement);
    const $data = get(data);
    expect($data).toEqual(
      expect.objectContaining({
        account: {
          email: '',
          password: '',
          confirmPassword: '',
          showPassword: false,
          publicEmail: undefined,
        },
        profile: {
          firstName: '',
          lastName: '',
          bio: '',
          picture: undefined,
        },
        extra: {
          pictures: expect.arrayContaining([]),
        },
        preferences: expect.arrayContaining([]),
      })
    );
  });

  test('Sets custom default data correctly', () => {
    const { form, data, isValid } = createForm({
      onSubmit: jest.fn(),
    });
    const {
      formElement,
      emailInput,
      bioInput,
      publicEmailYesRadio,
      showPasswordInput,
      techCheckbox,
    } = createSignupForm();
    emailInput.value = 'jacek@soplica.com';
    const bioTest = 'Litwo! Ojczyzno moja! ty jesteś jak zdrowie';
    bioInput.value = bioTest;
    publicEmailYesRadio.checked = true;
    showPasswordInput.checked = true;
    techCheckbox.checked = true;
    form(formElement);
    const $data = get(data);
    expect($data).toEqual(
      expect.objectContaining({
        account: {
          email: 'jacek@soplica.com',
          password: '',
          confirmPassword: '',
          showPassword: true,
          publicEmail: 'yes',
        },
        profile: {
          firstName: '',
          lastName: '',
          bio: bioTest,
          picture: undefined,
        },
        extra: {
          pictures: expect.arrayContaining([]),
        },
        preferences: expect.arrayContaining(['technology']),
      })
    );
    expect(get(isValid)).toBeTruthy();
  });

  test('Input and data object get same value', () => {
    const { form, data } = createForm({
      onSubmit: jest.fn(),
    });
    const { formElement, emailInput, passwordInput } = createLoginForm();
    form(formElement);
    userEvent.type(emailInput, 'jacek@soplica.com');
    userEvent.type(passwordInput, 'password');
    const $data = get(data);
    expect($data).toEqual(
      expect.objectContaining({
        account: {
          email: 'jacek@soplica.com',
          password: 'password',
        },
      })
    );
  });

  test('Calls validation function on submit', async () => {
    const validate = jest.fn(() => ({}));
    const onSubmit = jest.fn();
    const { form, isSubmitting } = createForm({
      onSubmit,
      validate,
    });
    const { formElement } = createLoginForm();
    form(formElement);
    formElement.submit();
    expect(validate).toHaveBeenCalled();
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          account: {
            email: '',
            password: '',
          },
        })
      );
      expect(get(isSubmitting)).toBeFalsy();
    });
  });

  test('Calls validation function on submit without calling onSubmit', async () => {
    const validate = jest.fn(() => ({ account: { email: 'Not email' } }));
    const onSubmit = jest.fn();
    const { form, isValid, isSubmitting } = createForm({
      onSubmit,
      validate,
    });
    const { formElement } = createLoginForm();
    form(formElement);
    formElement.submit();
    expect(validate).toHaveBeenCalled();
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(get(isValid)).toBeFalsy();
    expect(get(isSubmitting)).toBeFalsy();
  });

  test('Calls validate on input', async () => {
    const validate = jest.fn(() => ({}));
    const onSubmit = jest.fn();
    const { form, errors, isValid } = createForm({
      onSubmit,
      validate,
    });
    const { formElement, emailInput } = createLoginForm();
    form(formElement);
    userEvent.type(emailInput, 'jacek@soplica.com');
    get(errors);
    await waitFor(() => expect(validate).toHaveBeenCalled());
    expect(get(isValid)).toBeTruthy();
  });

  test('Handles user events', () => {
    const { form, data } = createForm({
      onSubmit: jest.fn(),
    });
    const {
      formElement,
      emailInput,
      passwordInput,
      confirmPasswordInput,
      showPasswordInput,
      publicEmailYesRadio,
      firstNameInput,
      lastNameInput,
      bioInput,
      techCheckbox,
      pictureInput,
      extraPicsInput,
    } = createSignupForm();

    form(formElement);

    expect(get(data)).toEqual(
      expect.objectContaining({
        account: {
          email: '',
          password: '',
          confirmPassword: '',
          showPassword: false,
          publicEmail: undefined,
        },
        profile: {
          firstName: '',
          lastName: '',
          bio: '',
          picture: undefined,
        },
        extra: {
          pictures: expect.arrayContaining([]),
        },
        preferences: expect.arrayContaining([]),
      })
    );

    const mockFile = new File(['test file'], 'test.png', { type: 'image/png' });
    userEvent.type(emailInput, 'jacek@soplica.com');
    userEvent.type(passwordInput, 'password');
    userEvent.type(confirmPasswordInput, 'password');
    userEvent.click(showPasswordInput);
    userEvent.click(publicEmailYesRadio);
    userEvent.type(firstNameInput, 'Jacek');
    userEvent.type(lastNameInput, 'Soplica');
    const bioTest = 'Litwo! Ojczyzno moja! ty jesteś jak zdrowie';
    userEvent.type(bioInput, bioTest);
    userEvent.click(techCheckbox);
    userEvent.upload(pictureInput, mockFile);
    userEvent.upload(extraPicsInput, [mockFile, mockFile]);

    expect(get(data)).toEqual(
      expect.objectContaining({
        account: {
          email: 'jacek@soplica.com',
          password: 'password',
          confirmPassword: 'password',
          showPassword: true,
          publicEmail: 'yes',
        },
        profile: {
          firstName: 'Jacek',
          lastName: 'Soplica',
          bio: bioTest,
          picture: mockFile,
        },
        extra: {
          pictures: expect.arrayContaining([mockFile, mockFile]),
        },
        preferences: expect.arrayContaining(['technology']),
      })
    );
  });

  test('Sets default data with initialValues', () => {
    const { data } = createForm({
      onSubmit: jest.fn(),
      initialValues: {
        account: {
          email: 'jacek@soplica.com',
          password: 'password',
        },
      },
    });
    expect(get(data)).toEqual(
      expect.objectContaining({
        account: {
          email: 'jacek@soplica.com',
          password: 'password',
        },
      })
    );
  });

  test('calls onError', async () => {
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const onError = jest.fn();
    const mockErrors = { account: { email: 'Not email' } };
    const onSubmit = jest.fn(() => {
      throw mockErrors;
    });

    const { form, isSubmitting } = createForm<any>({
      onSubmit,
      onError,
    });

    form(formElement);

    expect(onError).not.toHaveBeenCalled();

    formElement.submit();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(mockErrors);
      expect(get(isSubmitting)).toBeFalsy();
    });
  });

  test('use createSubmitHandler to override submit', async () => {
    const mockOnSubmit = jest.fn();
    const mockValidate = jest.fn();
    const mockOnError = jest.fn();
    const formElement = screen.getByRole('form') as HTMLFormElement;
    const defaultConfig = {
      onSubmit: jest.fn(),
      validate: jest.fn(),
      onError: jest.fn(),
    };
    const { form, createSubmitHandler, isSubmitting } = createForm(
      defaultConfig
    );
    const altOnSubmit = createSubmitHandler({
      onSubmit: mockOnSubmit,
      onError: mockOnError,
      validate: mockValidate,
    });

    form(formElement);

    const submitInput = createInputElement({
      type: 'submit',
      value: 'Alt Submit',
    });

    submitInput.addEventListener('click', altOnSubmit);

    formElement.appendChild(submitInput);

    userEvent.click(submitInput);

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalledTimes(1);
      expect(defaultConfig.onSubmit).not.toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(defaultConfig.onError).not.toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
      expect(get(isSubmitting)).toBeFalsy();
    });

    const mockErrors = { account: { email: 'Not email' } };
    mockOnSubmit.mockImplementationOnce(() => {
      throw mockErrors;
    });

    userEvent.click(submitInput);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
      expect(mockValidate).toHaveBeenCalledTimes(2);
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
      expect(get(isSubmitting)).toBeFalsy();
    });
  });

  test('calls submit handler without event', async () => {
    const { createSubmitHandler, isSubmitting } = createForm({
      onSubmit: jest.fn(),
    });
    const mockOnSubmit = jest.fn();
    const altOnSubmit = createSubmitHandler({ onSubmit: mockOnSubmit });
    altOnSubmit();
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(get(isSubmitting)).toBeFalsy();
    });
  });
});
