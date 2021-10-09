import { screen, waitFor } from '@testing-library/dom';
import {
  cleanupDOM,
  createInputElement,
  createDOM,
  createMultipleInputElements,
} from './common';
import { createForm } from '../src';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { isFormControl } from '@felte/core';

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
  const multipleFieldsetElement = document.createElement('fieldset');
  multipleFieldsetElement.name = 'multiple';
  const extraTextInputs = createMultipleInputElements({
    type: 'text',
    name: 'extraText',
  });
  const extraNumberInputs = createMultipleInputElements({
    type: 'number',
    name: 'extraNumber',
  });
  const extraFileInputs = createMultipleInputElements({
    type: 'file',
    name: 'extraFiles',
  });
  const extraCheckboxes = createMultipleInputElements({
    type: 'checkbox',
    name: 'extraCheckbox',
  });
  const extraPreferences1 = createMultipleInputElements({
    type: 'checkbox',
    name: 'extraPreference',
    value: 'preference1',
  });
  const extraPreferences2 = createMultipleInputElements({
    type: 'checkbox',
    name: 'extraPreference',
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
    accountFieldset,
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

  test('Validates default data correctly', async () => {
    const { form, data, errors, setTouched } = createForm({
      onSubmit: jest.fn(),
      validate: (values: any) => {
        const errors: {
          account: { password?: string; email?: string };
        } = { account: {} };
        if (!values.account.email) errors.account.email = 'Must not be empty';
        if (!values.account.password)
          errors.account.password = 'Must not be empty';
        return errors;
      },
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
    expect(get(errors)).toMatchObject({
      account: {
        email: null,
        password: null,
      },
    });
    setTouched('account.email');
    await waitFor(() => {
      expect(get(errors)).toMatchObject({
        account: {
          email: 'Must not be empty',
          password: null,
        },
      });
    });
    setTouched('account.password');
    await waitFor(() => {
      expect(get(errors)).toMatchObject({
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
        multiple: {
          extraText: expect.arrayContaining(['', 'demo text', '']),
          extraNumber: expect.arrayContaining([undefined, 1, undefined]),
          extraFiles: expect.arrayContaining([undefined, undefined, undefined]),
          extraCheckbox: expect.arrayContaining([false, true, false]),
          extraPreference: expect.arrayContaining([[], ['preference1'], []]),
        },
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
        }),
        expect.objectContaining({
          form: formElement,
          controls: Array.from(formElement.elements).filter(isFormControl),
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
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
    expect(get(isValid)).toBeFalsy();
    await waitFor(() => {
      expect(get(isSubmitting)).toBeFalsy();
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
      expect(get(isValid)).toBeTruthy();
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
    expect(get(touched).account.email).toBe(false);
    userEvent.type(passwordInput, 'password');
    expect(get(touched).account.email).toBe(true);
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
    expect(get(data)).toEqual(
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
    const { data, errors, setTouched, touched } = createForm({
      onSubmit: jest.fn(),
      validate: (values) => {
        const errors: {
          account: { password?: string; email?: string };
        } = { account: {} };
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
    expect(get(errors)).toEqual({
      account: {
        email: null,
        password: null,
      },
    });
    setTouched('account.email');
    expect(get(touched)).toEqual({
      account: {
        email: true,
        password: false,
      },
    });
    expect(get(errors)).toEqual({
      account: {
        email: null,
        password: null,
      },
    });
    setTouched('account.password');
    expect(get(touched)).toEqual({
      account: {
        email: true,
        password: true,
      },
    });
    await waitFor(() => {
      expect(get(errors)).toEqual({
        account: {
          email: null,
          password: 'Must not be empty',
        },
      });
    });
    expect(get(data)).toEqual(
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

  test('ignores inputs with data-felte-ignore', async () => {
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
    const {
      formElement,
      accountFieldset,
      emailInput,
      passwordInput,
      firstNameInput,
      lastNameInput,
      publicEmailYesRadio,
    } = createSignupForm();
    accountFieldset.setAttribute('data-felte-ignore', '');
    firstNameInput.setAttribute('data-felte-ignore', '');
    const { data, form } = createForm<Data>({
      onSubmit: jest.fn(),
    });
    form(formElement);
    userEvent.type(emailInput, 'jacek@soplica.com');
    userEvent.type(passwordInput, 'password');
    userEvent.type(firstNameInput, 'Jacek');
    userEvent.type(lastNameInput, 'Soplica');
    userEvent.click(publicEmailYesRadio);
    await waitFor(() => {
      expect(get(data).profile.lastName).toBe('Soplica');
      expect(get(data).profile.firstName).toBe('');
      expect(get(data).account.email).toBe('');
      expect(get(data).account.password).toBe('');
      expect(get(data).account.publicEmail).toBe(undefined);
    });
  });

  test('transforms data', async () => {
    type Data = {
      account: {
        email: string;
        password: string;
        confirmPassword: string;
        showPassword: boolean;
        publicEmail?: boolean;
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
    const {
      formElement,
      publicEmailYesRadio,
      publicEmailNoRadio,
    } = createSignupForm();
    const { data, form } = createForm<Data>({
      onSubmit: jest.fn(),
      transform: (values: any) => {
        if (values.account.publicEmail === 'yes') {
          values.account.publicEmail = true;
        } else {
          values.account.publicEmail = false;
        }
        return values;
      },
    });

    form(formElement);

    userEvent.click(publicEmailYesRadio);
    await waitFor(() => {
      expect(get(data).account.publicEmail).toBe(true);
    });
    userEvent.click(publicEmailNoRadio);
    await waitFor(() => {
      expect(get(data).account.publicEmail).toBe(false);
    });
  });
});
