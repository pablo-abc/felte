import * as sinon from 'sinon';
import { suite } from 'uvu';
import { expect } from 'uvu-expect';
import 'uvu-expect-dom/extend';
import { screen } from '@testing-library/dom';
import type { AssignableErrors } from '../src';
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
  runValidations,
  getInputTextOrNumber,
  shouldIgnore,
  executeTransforms,
  getValue,
  mergeErrors,
  createId,
  isEqual,
} from '../src';

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

function createMultipleInputElements(attr: InputAttributes, amount = 3) {
  const inputs = [];
  for (let i = 0; i < amount; i++) {
    const input = createInputElement({ ...attr, index: i });
    inputs.push(input);
  }
  return inputs;
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
  const ageInput = createInputElement({ name: 'profile.age', type: 'number' });
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
  const fieldsets = [0, 1, 2].map((index) => {
    const input = createInputElement({ name: `fieldsets.${index}.otherText` });
    const fieldset = document.createElement('fieldset');
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

const Utils = suite('Utils');

Utils.before.each(createDOM);
Utils.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

Utils('_some', () => {
  const testObj = {
    username: 'test',
    password: '',
  };
  const truthyResult = _some(
    testObj,
    (value) => typeof value === 'string' && value === 'test'
  );
  expect(truthyResult).to.be.true;

  const falsyResult = _some(
    testObj,
    (value) => typeof value === 'string' && value === 'not in object'
  );
  expect(falsyResult).to.be.false;
});

Utils('_mapValues', () => {
  const testObj = {
    username: 'test',
    password: '',
  };
  const mapped = _mapValues(testObj, (value) => !!value);
  expect(mapped).to.deep.equal({
    username: true,
    password: false,
  });
});

Utils('_get', () => {
  const testObj = {
    account: {
      username: 'test',
      password: '',
    },
  };
  expect(_get(testObj, 'account.username')).to.equal('test');
  expect(_get(testObj, 'account.nonExistent')).to.equal(undefined);
  expect(_get(testObj, 'account.nonExistent', 'default')).to.equal('default');
  expect(_get(testObj, 'account.deep.nonExistent', 'default')).to.equal(
    'default'
  );
  expect(_get(testObj, 'account')).to.deep.equal({
    username: 'test',
    password: '',
  });
});

Utils('_set', () => {
  const testObj: any = {
    account: {
      username: 'test',
      password: '',
    },
  };

  expect(
    _set(testObj, 'account.password', 'password').account.password
  ).to.equal('password');
  expect(_set(testObj, 'account.toExist', 'value').account.toExist).to.equal(
    'value'
  );
  expect(
    _set(testObj, ['account', 'toExist'], 'otherValue').account.toExist
  ).to.equal('otherValue');
  expect(
    _set(undefined as any, 'account[0].toExist', 'value').account[0].toExist
  ).to.equal('value');
});

Utils('_unset', () => {
  const testObj: any = {
    account: {
      username: 'test',
      password: '',
      confirm: '',
      preferences: ['tech', 'sports', 'fashion'],
    },
  };

  expect(_unset(testObj, 'account.password').account.password).to.equal(
    undefined
  );
  expect(_unset(testObj, 'account.noExist').account.noExist).to.equal(
    undefined
  );
  expect(_unset(testObj, ['account', 'confirm']).account.confirm).to.equal(
    undefined
  );
  expect(
    _unset(testObj, 'account.preferences[1]').account.preferences
  ).to.deep.equal(['tech', 'fashion']);
  expect(_unset(undefined, 'account.noExist')).to.equal(undefined);
  expect(_unset({}, 'account.noExist')).to.deep.equal({});
  expect(_unset(testObj, '')).to.deep.equal(testObj);
});

Utils('_update', () => {
  const testObj: any = {
    account: {
      username: 'test',
      password: '',
    },
  };
  expect(
    _update(testObj, 'account.password', () => 'password').account.password
  ).to.equal('password');
  expect(
    _update(testObj, ['account', 'toExist'], () => 'value').account.toExist
  ).to.equal('value');
  expect(
    _update(undefined as any, 'account[0].toExist', () => 'value').account[0]
      .toExist
  ).to.equal('value');
  expect(_update({}, 'account[0][0]', () => 'value')).to.deep.include({
    account: [['value']],
  });
  expect(_update({}, '', () => 'value')).to.deep.equal({});
});

Utils('_isPlainObject', () => {
  expect(_isPlainObject({})).to.be.true;
  expect(_isPlainObject('')).to.be.false;
  expect(_isPlainObject(() => undefined)).to.be.false;
  expect(_isPlainObject(1)).to.be.false;
  expect(_isPlainObject(true)).to.be.false;
  expect(_isPlainObject(new File([], 'test'))).to.be.false;
  expect(_isPlainObject([])).to.be.false;
});

Utils('deepSet', () => {
  const testObj = {
    account: {
      username: 'test',
      password: '',
      preferences: ['tech', 'film'],
      friends: [
        {
          name: 'name1',
          key: 'key1',
        },
        {
          name: 'name2',
        },
      ],
    },
  };

  expect(deepSet(testObj, true)).to.deep.equal({
    account: {
      username: true,
      password: true,
      preferences: [true, true],
      friends: [
        {
          name: true,
        },
        {
          name: true,
        },
      ],
    },
  });
});

Utils('deepSome', () => {
  const testObj = {
    account: {
      username: 'test',
      password: '',
      strings: ['string1'],
      friends: [
        {
          name: 'name1',
        },
      ],
    },
  };
  const truthyResult = deepSome(
    testObj,
    (value) => typeof value === 'string' && value === 'test'
  );
  expect(truthyResult).to.be.true;

  const falsyResult = deepSome(
    testObj,
    (value) => typeof value === 'string' && value === 'not in object'
  );
  expect(falsyResult).to.be.false;

  expect(deepSome(testObj, (value) => value === 'name1')).to.be.true;
  expect(
    deepSome(testObj, (value) => Array.isArray(value) && value.length === 1)
  ).to.be.true;
  expect(deepSome({ test: { value: [true] } }, (v) => !!v)).to.be.true;
});

Utils('isFieldSetElement', () => {
  expect(isFieldSetElement(document.createElement('fieldset'))).to.be.true;
  expect(isFieldSetElement(document.createElement('input'))).to.be.false;
  expect(isFieldSetElement(undefined as any)).to.be.false;
});

Utils('isFormControl', () => {
  expect(isFormControl(document.createElement('fieldset'))).to.be.false;
  expect(isFormControl(document.createElement('input'))).to.be.true;
  expect(isFormControl(document.createElement('textarea'))).to.be.true;
  expect(isFormControl(document.createElement('select'))).to.be.true;
  expect(isFormControl(undefined as any)).to.be.false;
});

Utils('isElement', () => {
  expect(isElement(document.createTextNode(''))).to.be.false;
  expect(isElement(document.createElement('input'))).to.be.true;
  expect(isElement(document.createElement('textarea'))).to.be.true;
  expect(isElement(document.createElement('select'))).to.be.true;
});

Utils('getPath', () => {
  const inputElement = document.createElement('input');
  inputElement.name = 'container.test';
  expect(getPath(inputElement)).to.equal('container.test');
  expect(getPath(inputElement, 'container.overriden')).to.equal(
    'container.overriden'
  );
  expect(getPath(document.createElement('div'))).to.equal('');
});

Utils('getFormControls', () => {
  const { formElement } = createLoginForm();
  expect(formElement).to.not.be.focused;
  expect(getFormControls(formElement)).to.have.lengthOf(3);
});

Utils('addAttrsFromFieldset', () => {
  const fieldset = document.createElement('fieldset');
  fieldset.name = 'container';
  const fieldsetUnset = document.createElement('fieldset');
  fieldsetUnset.name = 'containerUnset';
  fieldsetUnset.setAttribute('data-felte-keep-on-remove', 'false');
  const inputElement = createInputElement({ name: 'test' });
  fieldset.appendChild(inputElement);
  const inputUnsetElement = createInputElement({ name: 'test' });
  fieldsetUnset.appendChild(inputUnsetElement);

  addAttrsFromFieldset(fieldset);

  addAttrsFromFieldset(fieldsetUnset);
  expect(inputUnsetElement)
    .to.have.attribute('data-felte-keep-on-remove')
    .that.equals('false');
});

Utils('getFormDefaultValues', () => {
  const { formElement } = createSignupForm();

  const { defaultData } = getFormDefaultValues(formElement);
  expect(defaultData).to.deep.include({
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
      age: undefined,
    },
    extra: {
      pictures: [],
    },
    preferences: [],
    multiple: {
      extraText: ['', '', ''],
      extraNumber: [undefined, undefined, undefined],
      extraFiles: [undefined, undefined, undefined],
      extraCheckbox: [false, false, false],
      extraPreference: [[], [], []],
    },
    fieldsets: [{ otherText: '' }, { otherText: '' }, { otherText: '' }],
  });
});

Utils('setForm', () => {
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
  expect(defaultData).to.deep.equal(formData);
});

Utils('runValidations', async () => {
  const mockValues = {
    account: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  };
  type Error = AssignableErrors<typeof mockValues>;
  const mockErrors: Error = {
    account: {
      email: 'required',
      password: null,
      confirmPassword: undefined,
    },
  };
  const validate = sinon
    .stub()
    .onSecondCall()
    .returns(mockErrors)
    .onThirdCall()
    .returns(mockErrors);

  validate.onFirstCall().returns({
    account: {
      email: 'not an email',
      password: 'required',
      confirmPassword: 'required',
    },
  });

  const errors = await Promise.all(
    runValidations(mockValues, [validate, validate])
  );

  expect(mergeErrors([deepSet(mockValues, []), ...errors])).to.deep.equal({
    account: {
      email: ['not an email', 'required'],
      password: ['required'],
      confirmPassword: ['required'],
    },
  });
  expect(runValidations(mockValues, validate)[0]).to.deep.equal(mockErrors);
});

Utils('executeTransforms', () => {
  const mockValues: any = {
    progress: {
      percentage: 0.42,
    },
  };
  const transformToBase100 = (values: any) => ({
    progress: {
      percentage: values.progress.percentage * 100,
    },
  });
  const transformToString = (values: any) => ({
    progress: {
      percentage: String(values.progress.percentage.toFixed(0)) + '%',
    },
  });
  expect(executeTransforms(mockValues)).to.equal(mockValues);
  expect(executeTransforms(mockValues, transformToBase100)).to.deep.equal({
    progress: { percentage: 42 },
  });
  expect(
    executeTransforms(mockValues, [
      transformToBase100,
      transformToString,
    ] as any[])
  ).to.deep.equal({
    progress: {
      percentage: '42%',
    },
  });
});

Utils('getInputTextOrNumber', () => {
  const textElement = createInputElement({
    name: 'text',
    value: '',
  });
  const numberElement = createInputElement({
    name: 'number',
    type: 'number',
  });

  expect(getInputTextOrNumber(textElement)).to.equal('');
  expect(getInputTextOrNumber(numberElement)).to.equal(undefined);

  textElement.value = 'test';
  numberElement.value = 'test';
  expect(getInputTextOrNumber(textElement)).to.equal('test');
  expect(getInputTextOrNumber(numberElement)).to.equal(undefined);

  numberElement.value = '42';
  expect(getInputTextOrNumber(numberElement)).to.equal(42);
});

Utils('isFieldValue', () => {
  expect(isFieldValue([])).to.equal(true);
  expect(isFieldValue(['test'])).to.equal(true);
  expect(isFieldValue([new File([], 'test')])).to.equal(true);
  expect(isFieldValue('test')).to.equal(true);
  expect(isFieldValue(2)).to.equal(true);
  expect(isFieldValue(false)).to.equal(true);
  expect(isFieldValue(new File([], 'test'))).to.equal(true);
});

Utils('_cloneDeep', () => {
  const obj = {
    account: {
      email: 'test',
      password: 'password',
    },
  };
  expect(_cloneDeep(obj)).to.deep.equal({
    account: {
      email: 'test',
      password: 'password',
    },
  });
  expect(_cloneDeep(obj)).not.to.equal(obj);
  expect(_cloneDeep(obj).account).not.to.equal(obj.account);
});

Utils('_merge', () => {
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
  expect(_merge({}, source1)).to.deep.equal(source1);
  expect(_merge(obj, source1)).to.deep.equal({
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
  expect(_merge({}, obj, source1)).to.deep.equal({
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
  expect(obj).to.deep.equal({
    account: {
      email: 'test',
      password: 'password',
      leftAlone: 'original',
    },
    leftAlone: 'original',
    objectArray: [{ value: 'test' }, { value: 'test' }],
    stringArray: ['test', 'test2'],
  });
  expect(source1).to.deep.equal({
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

Utils('_mergeWith', () => {
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
  expect(_mergeWith(errors, touched, errorFilterer)).to.deep.equal({
    account: {
      email: 'Not valid',
      password: null,
    },
    email: 'Not valid',
    password: null,
  });
  expect(_mergeWith({}, touched, errorFilterer)).to.deep.equal({
    account: {
      email: null,
      password: null,
    },
    email: null,
    password: null,
  });
  expect(_mergeWith(null, null, errorFilterer)).to.deep.equal({});
  expect(_mergeWith('test')).to.deep.equal({});
  expect(_mergeWith({}, {}, () => 'test')).to.equal('test');
});

Utils('_defaultsDeep', () => {
  const obj = {
    account: {
      email: 'test',
      password: 'password',
      leftAlone: 'original',
    },
    leftAlone: 'original',
    preferences: [null, 'leftAlone'],
    friends: [],
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
    friends: [{ name: 'name' }],
    other: [],
  };
  expect(_defaultsDeep(obj, source1)).to.deep.equal({
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
    friends: [{ name: 'name' }],
    other: [],
  });
});

Utils('shouldIgnore', () => {
  const ignoredInput = createInputElement({ type: 'text', name: 'test' });
  ignoredInput.setAttribute('data-felte-ignore', '');
  expect(shouldIgnore(ignoredInput)).to.equal(true);
  const input = createInputElement({ type: 'text', name: 'test' });
  const container = document.createElement('div');
  container.appendChild(input);
  expect(shouldIgnore(input)).to.equal(false);
  container.setAttribute('data-felte-ignore', '');
  expect(shouldIgnore(input)).to.equal(true);
});

Utils('getValue', () => {
  const data = {
    account: {
      email: 'zaphod@beeblebrox.com',
    },
  };
  expect(getValue(data, 'account.email')).to.equal('zaphod@beeblebrox.com');
  expect(getValue(data, ($data) => $data.account.email)).to.equal(
    'zaphod@beeblebrox.com'
  );
  expect(getValue('test')).to.equal('test');
});

Utils('mergeErrors', () => {
  const empty = {
    account: {
      array: [
        {
          value: [],
        },
        {
          value: [],
        },
        {
          value: [],
        },
      ],
      strings: [],
    },
  };
  const data: any = {
    account: {
      array: [
        undefined,
        {
          value: 'test',
        },
        {
          value: ['test in array'],
        },
      ],
      strings: [undefined, 'test', 'test in array'],
    },
  };
  const other: any = {
    account: {
      array: [
        undefined,
        {
          value: 'another',
        },
        null,
      ],
      strings: 'another',
    },
  };
  expect(mergeErrors([empty, data, other])).to.deep.equal({
    account: {
      array: [
        {
          value: [],
        },
        {
          value: ['test', 'another'],
        },
        {
          value: ['test in array'],
        },
      ],
      strings: ['test', 'test in array', 'another'],
    },
  });
  expect(
    mergeErrors([
      {
        test: 'error',
      },
      {
        test: 'another',
      },
    ])
  ).to.deep.equal({
    test: ['error', 'another'],
  });
});

Utils('createId', () => {
  expect(createId()).to.have.lengthOf(8);
  expect(createId(21)).to.have.lengthOf(21);
});

Utils('isEqual', () => {
  expect(isEqual(1, 1)).to.equal(true);
  expect(isEqual(1, 2)).to.equal(false);
  expect(isEqual('1', '1')).to.equal(true);
  expect(isEqual([1, 2, 3], [1, 2, 3])).to.equal(true);
  expect(isEqual([1, 2, 3], [1, 3, 2])).to.equal(false);
  expect(isEqual([1, 2, 3], [1, 2, 3, 4])).to.equal(false);
  expect(isEqual([1, 2, 3], { name: 'test' })).to.equal(false);
  expect(
    isEqual(
      {
        account: {
          name: 'test',
          likes: 1,
          friends: [
            {
              name: 'friend1',
            },
            {
              name: 'friend2',
            },
          ],
        },
      },
      {
        account: {
          friends: [
            {
              name: 'friend1',
            },
            {
              name: 'friend2',
            },
          ],
          likes: 1,
          name: 'test',
        },
      }
    )
  ).to.equal(true);
  expect(
    isEqual(
      {
        account: {
          name: 'test',
          likes: 1,
          friends: [
            {
              name: 'friend1',
            },
            {
              name: 'friend2',
            },
          ],
        },
      },
      {
        account: {
          friends: [
            {
              name: 'friend1',
            },
            {
              name: 'friend2',
            },
          ],
          preferences: [],
          likes: 1,
          name: 'test',
        },
      }
    )
  ).to.equal(false);
});

Utils.run();
