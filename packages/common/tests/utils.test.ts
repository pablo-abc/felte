import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/dom';
import {
  createInputElement,
  createDOM,
  cleanupDOM,
  InputAttributes,
} from './common';
import {
  _some,
  _mapValues,
  _get,
  _set,
  _unset,
  _update,
  _isPlainObject,
  _cloneDeep,
  _mergeWith,
  _merge,
  _defaultsDeep,
  deepSet,
  deepSome,
  isFieldSetElement,
  isFieldValue,
  isFormControl,
  isElement,
  getPath,
  getFormControls,
  addAttrsFromFieldset,
  getFormDefaultValues,
  setForm,
  executeValidation,
  getInputTextOrNumber,
  getIndex,
  getPathFromDataset,
  shouldIgnore,
} from '../src';

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

function createMultipleInputElements(attr: InputAttributes, amount = 3) {
  const inputs = [];
  for (let i = 0; i < amount; i++) {
    const input = createInputElement(attr);
    input.dataset.felteIndex = String(i);
    inputs.push(input);
  }
  return inputs;
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
  const ageInput = createInputElement({ name: 'age', type: 'number' });
  profileFieldset.append(firstNameInput, lastNameInput, bioInput, ageInput);
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
  const fieldsets = [0, 1, 2].map((index) => {
    const input = createInputElement({ name: 'otherText' });
    const fieldset = document.createElement('fieldset');
    fieldset.name = 'fieldsets';
    fieldset.dataset.felteIndex = String(index);
    fieldset.appendChild(input);
    return fieldset;
  });
  formElement.appendChild(multipleFieldsetElement);
  formElement.append(...fieldsets);

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
    ageInput,
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

describe('Utils', () => {
  test('_some', () => {
    const testObj = {
      username: 'test',
      password: '',
    };
    const truthyResult = _some(
      testObj,
      (value) => typeof value === 'string' && value === 'test'
    );
    expect(truthyResult).toBeTruthy();

    const falsyResult = _some(
      testObj,
      (value) => typeof value === 'string' && value === 'not in object'
    );
    expect(falsyResult).toBeFalsy();
  });

  test('_mapValues', () => {
    const testObj = {
      username: 'test',
      password: '',
    };
    const mapped = _mapValues(testObj, (value) => !!value);
    expect(mapped).toEqual({
      username: true,
      password: false,
    });
  });

  test('_get', () => {
    const testObj = {
      account: {
        username: 'test',
        password: '',
      },
    };

    expect(_get(testObj, 'account.username')).toBe('test');
    expect(_get(testObj, 'account.nonExistent')).toBe(undefined);
    expect(_get(testObj, 'account.nonExistent', 'default')).toBe('default');
    expect(_get(testObj, 'account.deep.nonExistent', 'default')).toBe(
      'default'
    );
    expect(_get(testObj, 'account')).toEqual({
      username: 'test',
      password: '',
    });
  });

  test('_set', () => {
    const testObj: any = {
      account: {
        username: 'test',
        password: '',
      },
    };

    expect(_set(testObj, 'account.password', 'password').account.password).toBe(
      'password'
    );
    expect(_set(testObj, 'account.toExist', 'value').account.toExist).toBe(
      'value'
    );
    expect(
      _set(testObj, ['account', 'toExist'], 'otherValue').account.toExist
    ).toBe('otherValue');
    expect(
      _set(undefined as any, 'account[0].toExist', 'value').account[0].toExist
    ).toBe('value');
  });

  test('_unset', () => {
    const testObj: any = {
      account: {
        username: 'test',
        password: '',
        confirm: '',
        preferences: ['tech'],
      },
    };

    expect(_unset(testObj, 'account.password').account.password).toBe(
      undefined
    );
    expect(_unset(testObj, 'account.noExist').account.noExist).toBe(undefined);
    expect(_unset(testObj, ['account', 'confirm']).account.confirm).toBe(
      undefined
    );
    expect(_unset(undefined, 'account.noExist')).toBe(undefined);
    expect(_unset({}, 'account.noExist')).toEqual({});
  });

  test('_update', () => {
    const testObj: any = {
      account: {
        username: 'test',
        password: '',
      },
    };
    expect(
      _update(testObj, 'account.password', () => 'password').account.password
    ).toBe('password');
    expect(
      _update(testObj, 'account.toExist', () => 'value').account.toExist
    ).toBe('value');
    expect(
      _update(undefined as any, 'account[0].toExist', () => 'value').account[0]
        .toExist
    ).toBe('value');
  });

  test('_isPlainObject', () => {
    expect(_isPlainObject({})).toBeTruthy();
    expect(_isPlainObject('')).toBeFalsy();
    expect(_isPlainObject(() => undefined)).toBeFalsy();
    expect(_isPlainObject(1)).toBeFalsy();
    expect(_isPlainObject(true)).toBeFalsy();
    expect(_isPlainObject(new File([], 'test'))).toBeFalsy();
    expect(_isPlainObject([])).toBeFalsy();
  });

  test('deepSet', () => {
    const testObj = {
      account: {
        username: 'test',
        password: '',
        preferences: ['tech', 'film'],
      },
    };

    expect(deepSet(testObj, true)).toEqual({
      account: {
        username: true,
        password: true,
        preferences: [true, true],
      },
    });
  });

  test('deepSome', () => {
    const testObj = {
      account: {
        username: 'test',
        password: '',
      },
    };
    const truthyResult = deepSome(
      testObj,
      (value) => typeof value === 'string' && value === 'test'
    );
    expect(truthyResult).toBeTruthy();

    const falsyResult = deepSome(
      testObj,
      (value) => typeof value === 'string' && value === 'not in object'
    );
    expect(falsyResult).toBeFalsy();
  });

  test('isFieldSetElement', () => {
    expect(isFieldSetElement(document.createElement('fieldset'))).toBeTruthy();
    expect(isFieldSetElement(document.createElement('input'))).toBeFalsy();
  });

  test('isFormControl', () => {
    expect(isFormControl(document.createElement('fieldset'))).toBeFalsy();
    expect(isFormControl(document.createElement('input'))).toBeTruthy();
    expect(isFormControl(document.createElement('textarea'))).toBeTruthy();
    expect(isFormControl(document.createElement('select'))).toBeTruthy();
  });

  test('isElement', () => {
    expect(isElement(document.createTextNode(''))).toBeFalsy();
    expect(isElement(document.createElement('input'))).toBeTruthy();
    expect(isElement(document.createElement('textarea'))).toBeTruthy();
    expect(isElement(document.createElement('select'))).toBeTruthy();
  });

  test('getPath', () => {
    const inputElement = document.createElement('input');
    inputElement.name = 'test';
    expect(getPath(inputElement)).toBe('test');
    const fieldsetElement = document.createElement('fieldset');
    fieldsetElement.name = 'container';
    fieldsetElement.appendChild(inputElement);
    expect(getPath(inputElement)).toBe('container.test');
    inputElement.setAttribute('data-felte-index', '1');
    expect(getPath(inputElement)).toBe('container.test[1]');
    expect(getPath(inputElement, 'overriden')).toBe('container.overriden[1]');
  });

  test('getPathFromDataset', () => {
    const inputElement = document.createElement('input');
    inputElement.name = 'test';
    expect(getPathFromDataset(inputElement)).toBe('test');
    inputElement.dataset.felteFieldset = 'container';
    expect(getPathFromDataset(inputElement)).toBe('container.test');
    inputElement.setAttribute('data-felte-index', '1');
    expect(getPathFromDataset(inputElement)).toBe('container.test[1]');
  });

  test('getFormControls', () => {
    createDOM();
    const { formElement } = createLoginForm();
    expect(getFormControls(formElement)).toHaveLength(3);
    cleanupDOM();
  });

  test('addAttrsFromFieldset', () => {
    const fieldset = document.createElement('fieldset');
    fieldset.name = 'container';
    const fieldsetUnset = document.createElement('fieldset');
    fieldsetUnset.name = 'containerUnset';
    fieldsetUnset.setAttribute('data-felte-unset-on-remove', 'true');
    const inputElement = createInputElement({ name: 'test' });
    fieldset.appendChild(inputElement);
    const inputUnsetElement = createInputElement({ name: 'test' });
    fieldsetUnset.appendChild(inputUnsetElement);

    addAttrsFromFieldset(fieldset);
    expect(inputElement).toHaveAttribute('data-felte-fieldset', 'container');

    addAttrsFromFieldset(fieldsetUnset);
    expect(inputUnsetElement).toHaveAttribute(
      'data-felte-fieldset',
      'containerUnset'
    );
    expect(inputUnsetElement).toHaveAttribute(
      'data-felte-unset-on-remove',
      'true'
    );
  });

  test('getFormDefaultValues', () => {
    createDOM();
    const { formElement } = createSignupForm();

    const { defaultData } = getFormDefaultValues(formElement);
    expect(defaultData).toEqual(
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
        fieldsets: expect.arrayContaining([
          { otherText: '' },
          { otherText: '' },
          { otherText: '' },
        ]),
      })
    );
    cleanupDOM();
  });

  test('setForm', () => {
    createDOM();
    const formData = {
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
        bio: 'bio',
        picture: undefined,
        age: 0,
      },
      extra: {
        pictures: [],
      },
      preferences: ['technology', 'films'],
      multiple: {
        extraText: ['text1', 'text2', 'text3'],
        extraNumber: [1, 2, 3],
        extraFiles: [undefined, undefined, undefined],
        extraCheckbox: [true, false, true],
        extraPreference: [['preference1'], ['preference1', 'preference2'], []],
      },
      fieldsets: [
        { otherText: 'text' },
        { otherText: 'other' },
        { otherText: 'more' },
      ],
    };
    const { formElement } = createSignupForm();

    setForm(formElement, formData);
    const { defaultData } = getFormDefaultValues(formElement);
    expect(defaultData).toEqual(formData);
    cleanupDOM();
  });

  test('executeValidation', async () => {
    const mockValues = {
      account: {
        email: '',
      },
    };
    const validate = jest.fn(
      () =>
        ({
          account: {
            email: 'required',
            password: null,
            confirmPassword: undefined,
          },
        } as any)
    );

    validate.mockReturnValueOnce({
      account: {
        email: 'not an email',
        password: 'required',
        confirmPassword: 'required',
      },
    });

    const errors = await executeValidation(mockValues, [validate, validate]);

    expect(errors).toEqual({
      account: {
        email: ['not an email', 'required'],
        password: 'required',
        confirmPassword: 'required',
      },
    });
  });

  test('getInputTextOrNumber', () => {
    const textElement = createInputElement({
      name: 'text',
      value: '',
    });
    const numberElement = createInputElement({
      name: 'number',
      type: 'number',
    });

    expect(getInputTextOrNumber(textElement)).toBe('');
    expect(getInputTextOrNumber(numberElement)).toBe(undefined);

    textElement.value = 'test';
    numberElement.value = 'test';
    expect(getInputTextOrNumber(textElement)).toBe('test');
    expect(getInputTextOrNumber(numberElement)).toBe(undefined);

    numberElement.value = '42';
    expect(getInputTextOrNumber(numberElement)).toBe(42);
  });

  test('isFieldValue', () => {
    expect(isFieldValue([])).toBe(true);
    expect(isFieldValue(['test'])).toBe(true);
    expect(isFieldValue([new File([], 'test')])).toBe(true);
    expect(isFieldValue('test')).toBe(true);
    expect(isFieldValue(2)).toBe(true);
    expect(isFieldValue(false)).toBe(true);
    expect(isFieldValue(new File([], 'test'))).toBe(true);
  });

  test('_cloneDeep', () => {
    const obj = {
      account: {
        email: 'test',
        password: 'password',
      },
    };
    expect(_cloneDeep(obj)).toEqual({
      account: {
        email: 'test',
        password: 'password',
      },
    });
    expect(_cloneDeep(obj)).not.toBe(obj);
    expect(_cloneDeep(obj).account).not.toBe(obj.account);
  });

  test('_merge', () => {
    const obj = {
      account: {
        email: 'test',
        password: 'password',
        leftAlone: 'original',
      },
      leftAlone: 'original',
      objectArray: [{ value: 'test' }, { value: 'test' }],
      stringArray: ['test', 'test2'],
    };
    const source1 = {
      account: {
        email: 'overriden',
        password: {
          type: 'overriden',
          value: 'password',
        },
      },
      added: 'value',
      objectArray: [{ otherValue: 'test' }, { otherValue: 'test' }],
      stringArray: ['test3', 'test4'],
    };
    expect(_merge({}, source1)).toEqual(source1);
    expect(_merge(obj, source1)).toEqual({
      account: {
        email: 'overriden',
        password: {
          type: 'overriden',
          value: 'password',
        },
        leftAlone: 'original',
      },
      added: 'value',
      leftAlone: 'original',
      objectArray: [
        { otherValue: 'test', value: 'test' },
        { otherValue: 'test', value: 'test' },
      ],
      stringArray: ['test3', 'test4'],
    });
    expect(_merge({}, obj, source1)).toEqual({
      account: {
        email: 'overriden',
        password: {
          type: 'overriden',
          value: 'password',
        },
        leftAlone: 'original',
      },
      added: 'value',
      leftAlone: 'original',
      objectArray: [
        { otherValue: 'test', value: 'test' },
        { otherValue: 'test', value: 'test' },
      ],
      stringArray: ['test3', 'test4'],
    });
    expect(obj).toEqual({
      account: {
        email: 'test',
        password: 'password',
        leftAlone: 'original',
      },
      leftAlone: 'original',
      objectArray: [{ value: 'test' }, { value: 'test' }],
      stringArray: ['test', 'test2'],
    });
    expect(source1).toEqual({
      account: {
        email: 'overriden',
        password: {
          type: 'overriden',
          value: 'password',
        },
      },
      added: 'value',
      objectArray: [{ otherValue: 'test' }, { otherValue: 'test' }],
      stringArray: ['test3', 'test4'],
    });
  });

  test('_mergeWith', () => {
    const touched = {
      account: {
        email: true,
        password: false,
      },
      email: true,
      password: false,
    };
    const errors = {
      account: {
        email: 'Not valid',
        password: 'Not valid',
      },
      email: 'Not valid',
      password: 'Not valid',
    };
    function errorFilterer(errValue?: string, touchValue?: boolean) {
      if (_isPlainObject(touchValue)) return;
      return (touchValue && errValue) || null;
    }
    expect(_mergeWith(errors, touched, errorFilterer)).toEqual({
      account: {
        email: 'Not valid',
        password: null,
      },
      email: 'Not valid',
      password: null,
    });
    expect(_mergeWith({}, touched, errorFilterer)).toEqual({
      account: {
        email: null,
        password: null,
      },
      email: null,
      password: null,
    });
  });

  test('_defaultsDeep', () => {
    const obj = {
      account: {
        email: 'test',
        password: 'password',
        leftAlone: 'original',
      },
      leftAlone: 'original',
      preferences: [null, 'leftAlone'],
    };
    const source1 = {
      account: {
        email: 'overriden',
        password: {
          type: 'overriden',
          value: 'password',
        },
        added: 'value',
        addedObj: {
          prop: 'test',
        },
      },
      added: 'value',
      preferences: ['added', 'ignored', 'added'],
    };
    expect(_defaultsDeep(obj, source1)).toEqual({
      account: {
        email: 'test',
        password: 'password',
        leftAlone: 'original',
        added: 'value',
        addedObj: {
          prop: 'test',
        },
      },
      added: 'value',
      leftAlone: 'original',
      preferences: ['added', 'leftAlone', 'added'],
    });
  });

  test('getIndex', () => {
    const input = createInputElement({ type: 'text', name: 'test' });
    expect(getIndex(input)).toBe(undefined);
    const multipleInput = createMultipleInputElements(
      { type: 'text', name: 'test' },
      1
    );
    expect(getIndex(multipleInput[0])).toBe(0);
  });

  test('shouldIgnore', () => {
    const ignoredInput = createInputElement({ type: 'text', name: 'test' });
    ignoredInput.setAttribute('data-felte-ignore', '');
    expect(shouldIgnore(ignoredInput)).toBe(true);
    const input = createInputElement({ type: 'text', name: 'test' });
    const container = document.createElement('div');
    container.appendChild(input);
    expect(shouldIgnore(input)).toBe(false);
    container.setAttribute('data-felte-ignore', '');
    expect(shouldIgnore(input)).toBe(true);
  });
});
