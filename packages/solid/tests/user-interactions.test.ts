import { screen, waitFor } from '@testing-library/dom';
import {
  cleanupDOM,
  createInputElement,
  createDOM,
  createMultipleInputElements,
} from './common';
import { createForm } from '../src';
import userEvent from '@testing-library/user-event';
import { isFormControl } from '@felte/core';

function createLoginForm() {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const emailInput = createInputElement({
    name: 'account.email',
    type: 'email',
  });
  const passwordInput = createInputElement({
    name: 'account.password',
    type: 'password',
  });
  const submitInput = createInputElement({ type: 'submit' });
  const accountFieldset = document.createElement('fieldset');
  accountFieldset.append(emailInput, passwordInput);
  formElement.append(accountFieldset, submitInput);
  return { formElement, emailInput, passwordInput, submitInput };
}

function createSignupForm() {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const emailInput = createInputElement({
    name: 'account.email',
    type: 'email',
  });
  const passwordInput = createInputElement({
    name: 'account.password',
    type: 'password',
  });
  const showPasswordInput = createInputElement({
    name: 'account.showPassword',
    type: 'checkbox',
  });
  const confirmPasswordInput = createInputElement({
    name: 'account.confirmPassword',
    type: 'password',
  });
  const publicEmailYesRadio = createInputElement({
    name: 'account.publicEmail',
    value: 'yes',
    type: 'radio',
  });
  const publicEmailNoRadio = createInputElement({
    name: 'account.publicEmail',
    value: 'no',
    type: 'radio',
  });
  const accountFieldset = document.createElement('fieldset');
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
  const firstNameInput = createInputElement({ name: 'profile.firstName' });
  const lastNameInput = createInputElement({ name: 'profile.lastName' });
  const bioInput = createInputElement({ name: 'profile.bio' });
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
  const multipleFieldsetElement = document.createElement('fieldset');
  const extraTextInputs = createMultipleInputElements({
    type: 'text',
    name: 'multiple.extraText',
  });
  const extraNumberInputs = createMultipleInputElements({
    type: 'number',
    name: 'multiple.extraNumber',
  });
  const extraFileInputs = createMultipleInputElements({
    type: 'file',
    name: 'multiple.extraFiles',
  });
  const extraCheckboxes = createMultipleInputElements({
    type: 'checkbox',
    name: 'multiple.extraCheckbox',
  });
  const extraPreferences1 = createMultipleInputElements({
    type: 'checkbox',
    name: 'multiple.extraPreference',
    value: 'preference1',
  });
  const extraPreferences2 = createMultipleInputElements({
    type: 'checkbox',
    name: 'multiple.extraPreference',
    value: 'preference2',
  });
  multipleFieldsetElement.append(
    ...extraTextInputs,
    ...extraNumberInputs,
    ...extraFileInputs,
    ...extraCheckboxes,
    ...extraPreferences1,
    ...extraPreferences2
  );
  formElement.appendChild(multipleFieldsetElement);

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
    extraTextInputs,
    extraNumberInputs,
    extraFileInputs,
    extraCheckboxes,
    extraPreferences1,
    extraPreferences2,
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
    const $data = data();
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

  test('Validates default data correctly', async () => {
    const { form, data, errors, touched, setTouched } = createForm({
      onSubmit: jest.fn(),
      validate: (values: any) => {
        const errors: {
          account: { password?: string; email?: string };
        } = { account: {} };
        if (!values?.account?.email) errors.account.email = 'Must not be empty';
        if (!values?.account?.password)
          errors.account.password = 'Must not be empty';
        return errors;
      },
    });
    const { formElement } = createSignupForm();
    form(formElement);
    const $data = data();
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
        multiple: {
          extraText: expect.arrayContaining(['', '', '']),
          extraNumber: expect.arrayContaining([
            undefined,
            undefined,
            undefined,
          ]),
          extraFiles: expect.arrayContaining([undefined, undefined, undefined]),
          extraCheckbox: expect.arrayContaining([false, false, false]),
          extraPreference: expect.arrayContaining([[], [], []]),
        },
      })
    );
    expect(errors()).toMatchObject({
      account: {
        email: null,
        password: null,
      },
    });
    setTouched('account.email', true);
    await waitFor(() => {
      expect(touched()).toMatchObject({
        account: {
          email: true,
          password: false,
        },
      });
    });

    await waitFor(() => {
      expect(errors()).toMatchObject({
        account: {
          email: 'Must not be empty',
          password: null,
        },
      });
    });
    setTouched('account.password', true);
    await waitFor(() => {
      expect(errors()).toMatchObject({
        account: {
          email: 'Must not be empty',
          password: 'Must not be empty',
        },
      });
    });
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
      extraTextInputs,
      extraNumberInputs,
      extraCheckboxes,
      extraPreferences1,
    } = createSignupForm();
    emailInput.value = 'jacek@soplica.com';
    const bioTest = 'Litwo! Ojczyzno moja! ty jesteś jak zdrowie';
    bioInput.value = bioTest;
    publicEmailYesRadio.checked = true;
    showPasswordInput.checked = true;
    techCheckbox.checked = true;
    extraTextInputs[1].value = 'demo text';
    extraNumberInputs[1].value = '1';
    extraCheckboxes[1].checked = true;
    extraPreferences1[1].checked = true;
    form(formElement);
    const $data = data();
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
        multiple: {
          extraText: expect.arrayContaining(['', 'demo text', '']),
          extraNumber: expect.arrayContaining([undefined, 1, undefined]),
          extraFiles: expect.arrayContaining([undefined, undefined, undefined]),
          extraCheckbox: expect.arrayContaining([false, true, false]),
          extraPreference: expect.arrayContaining([[], ['preference1'], []]),
        },
      })
    );
    expect(isValid()).toBeTruthy();
  });

  test('Input and data object get same value', () => {
    const { form, data } = createForm({
      onSubmit: jest.fn(),
    });
    const { formElement, emailInput, passwordInput } = createLoginForm();
    form(formElement);
    userEvent.type(emailInput, 'jacek@soplica.com');
    userEvent.type(passwordInput, 'password');
    const $data = data();
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
        }),
        expect.objectContaining({
          form: formElement,
          controls: Array.from(formElement.elements).filter(isFormControl),
        })
      );
      expect(isSubmitting()).toBeFalsy();
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
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(isValid()).toBeFalsy();
      expect(isSubmitting()).toBeFalsy();
    });
  });

  test('Calls validate on input', async () => {
    const validate = jest.fn(() => ({}));
    const onSubmit = jest.fn();
    const { form, isValid } = createForm({
      onSubmit,
      validate,
    });
    const { formElement, emailInput } = createLoginForm();
    form(formElement);
    userEvent.type(emailInput, 'jacek@soplica.com');
    await waitFor(() => {
      expect(validate).toHaveBeenCalled();
      expect(isValid()).toBeTruthy();
    });
  });

  test('Handles user events', () => {
    type Data = {
      account: {
        email: string;
        password: string;
        confirmPassword: string;
        showPassword: boolean;
        publicEmail?: 'yes' | 'no';
      };
      profile: {
        firstName: string;
        lastName: string;
        bio: string;
        picture: any;
      };
      extra: {
        pictures: any[];
      };
      preferences: any[];
    };
    const { form, touched, data } = createForm<Data>({
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
      extraTextInputs,
      extraNumberInputs,
      extraCheckboxes,
      extraPreferences1,
      extraFileInputs,
    } = createSignupForm();

    form(formElement);

    expect(data()).toEqual(
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
        multiple: {
          extraText: expect.arrayContaining(['', '', '']),
          extraNumber: expect.arrayContaining([
            undefined,
            undefined,
            undefined,
          ]),
          extraFiles: expect.arrayContaining([undefined, undefined, undefined]),
          extraCheckbox: expect.arrayContaining([false, false, false]),
          extraPreference: expect.arrayContaining([[], [], []]),
        },
      })
    );

    const mockFile = new File(['test file'], 'test.png', { type: 'image/png' });
    userEvent.type(emailInput, 'jacek@soplica.com');
    expect(touched('account.email')).toBe(false);
    userEvent.type(passwordInput, 'password');
    expect(touched(($touched) => $touched.account.email)).toBe(true);
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
    userEvent.type(extraTextInputs[1], 'demo text');
    userEvent.type(extraNumberInputs[1], '1');
    userEvent.click(extraCheckboxes[1]);
    userEvent.click(extraPreferences1[1]);
    userEvent.upload(extraFileInputs[1], mockFile);

    expect(data()).toEqual(
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
        multiple: {
          extraText: expect.arrayContaining(['', 'demo text', '']),
          extraNumber: expect.arrayContaining([undefined, 1, undefined]),
          extraFiles: expect.arrayContaining([undefined, mockFile, undefined]),
          extraCheckbox: expect.arrayContaining([false, true, false]),
          extraPreference: expect.arrayContaining([[], ['preference1'], []]),
        },
      })
    );
  });

  test('Sets default data with initialValues', () => {
    const { emailInput, passwordInput, formElement } = createLoginForm();
    const { data, form } = createForm({
      onSubmit: jest.fn(),
      initialValues: {
        account: {
          email: 'jacek@soplica.com',
          password: 'password',
        },
      },
    });
    expect(data()).toEqual(
      expect.objectContaining({
        account: {
          email: 'jacek@soplica.com',
          password: 'password',
        },
      })
    );

    form(formElement);

    expect(emailInput.value).toBe('jacek@soplica.com');
    expect(passwordInput.value).toBe('password');
  });

  test('Validates initial values correctly', async () => {
    type Data = {
      account: {
        email: string;
        password: string;
      };
    };
    const { data, errors, setTouched, touched } = createForm<Data>({
      onSubmit: jest.fn(),
      validate: (values: any) => {
        const errors: any = { account: {} };
        if (!values.account.email) errors.account.email = 'Must not be empty';
        if (!values.account.password)
          errors.account.password = 'Must not be empty';
        return errors;
      },
      initialValues: {
        account: {
          email: 'jacek@soplica.com',
          password: '',
        },
      },
    });
    expect(errors()).toEqual({
      account: {
        email: null,
        password: null,
      },
    });
    setTouched('account.email', true);
    expect(touched()).toEqual({
      account: {
        email: true,
        password: false,
      },
    });
    expect(errors()).toEqual({
      account: {
        email: null,
        password: null,
      },
    });
    setTouched('account.password', true);
    expect(touched()).toEqual({
      account: {
        email: true,
        password: true,
      },
    });
    await waitFor(() => {
      expect(errors()).toEqual({
        account: {
          email: null,
          password: 'Must not be empty',
        },
      });
    });
    expect(data()).toEqual(
      expect.objectContaining({
        account: {
          email: 'jacek@soplica.com',
          password: '',
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
      expect(onError).toHaveBeenCalledWith(mockErrors, expect.anything());
      expect(isSubmitting()).toBeFalsy();
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
      expect(isSubmitting()).toBeFalsy();
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
      expect(isSubmitting()).toBeFalsy();
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
      expect(isSubmitting()).toBeFalsy();
    });
  });
});
