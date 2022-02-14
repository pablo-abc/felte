import * as sinon from 'sinon';
import { suite } from 'uvu';
import { waitFor, screen } from '@testing-library/dom';
import { get } from 'svelte/store';
import {
  createInputElement,
  createDOM,
  cleanupDOM,
  createForm,
} from './common';
import type { CurrentForm } from '@felte/common';

const Extenders = suite('Extenders');

Extenders.before.each(createDOM);
Extenders.after.each(() => {
  cleanupDOM();
  sinon.restore();
});

Extenders('calls extender', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const mockExtenderHandler = {
    destroy: sinon.fake(),
  };
  const mockExtender = sinon.fake.returns(mockExtenderHandler);
  const {
    form,
    data: { set, ...data },
    errors,
    touched,
  } = createForm({
    onSubmit: sinon.fake(),
    extend: mockExtender,
  });

  sinon.assert.calledWith(
    mockExtender,
    sinon.match({
      data: sinon.match(data),
      errors,
      touched,
      stage: 'SETUP',
    })
  );

  sinon.assert.calledOnce(mockExtender);

  form(formElement);

  sinon.assert.calledWith(
    mockExtender,
    sinon.match({
      data: sinon.match(data),
      stage: 'MOUNT',
      errors,
      touched,
      form: formElement,
      controls: sinon.match([]),
    })
  );

  sinon.assert.calledTwice(mockExtender);

  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });

  formElement.appendChild(inputElement);

  await waitFor(() => {
    sinon.assert.calledWith(
      mockExtender,
      sinon.match({
        data: sinon.match(data),
        stage: 'UPDATE',
        errors,
        touched,
        form: formElement,
        controls: sinon.match([inputElement]),
      })
    );

    sinon.assert.calledThrice(mockExtender);

    sinon.assert.calledOnce(mockExtenderHandler.destroy);
  });

  formElement.removeChild(inputElement);

  await waitFor(() => {
    sinon.assert.calledWith(
      mockExtender,
      sinon.match({
        data: sinon.match(data),
        stage: 'UPDATE',
        errors,
        touched,
        form: formElement,
        controls: sinon.match([]),
      })
    );

    sinon.assert.callCount(mockExtender, 4);

    sinon.assert.calledTwice(mockExtenderHandler.destroy);
  });
});

Extenders('calls multiple extenders', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const mockExtenderHandler = {
    destroy: sinon.fake(),
  };
  const mockExtenderHandlerNoD = {};
  const mockExtender = sinon.fake.returns(mockExtenderHandler);
  const mockExtenderNoD = sinon.fake.returns(mockExtenderHandlerNoD);
  const {
    form,
    data: { set, ...data },
    errors,
    touched,
  } = createForm({
    onSubmit: sinon.fake(),
    extend: [mockExtender, mockExtenderNoD],
  });

  sinon.assert.calledWith(
    mockExtender,
    sinon.match({
      data: sinon.match(data),
      errors,
      touched,
    })
  );

  sinon.assert.callCount(mockExtender, 1);

  sinon.assert.calledWith(
    mockExtenderNoD,
    sinon.match({
      data: sinon.match(data),
      errors,
      touched,
    })
  );

  sinon.assert.callCount(mockExtenderNoD, 1);

  const { destroy } = form(formElement);

  sinon.assert.calledWith(
    mockExtender,
    sinon.match({
      data: sinon.match(data),
      errors,
      touched,
      form: formElement,
      controls: sinon.match([]),
    })
  );

  sinon.assert.callCount(mockExtender, 2);

  sinon.assert.calledWith(
    mockExtenderNoD,
    sinon.match({
      data: sinon.match(data),
      errors,
      touched,
      form: formElement,
      controls: sinon.match([]),
    })
  );

  sinon.assert.callCount(mockExtenderNoD, 2);

  const inputElement = createInputElement({
    name: 'test',
    type: 'text',
  });

  formElement.appendChild(inputElement);

  await waitFor(() => {
    sinon.assert.calledWith(
      mockExtender,
      sinon.match({
        data: sinon.match(data),
        errors,
        touched,
        form: formElement,
        controls: sinon.match([inputElement]),
      })
    );

    sinon.assert.callCount(mockExtender, 3);

    sinon.assert.callCount(mockExtenderHandler.destroy, 1);
  });

  formElement.removeChild(inputElement);

  await waitFor(() => {
    sinon.assert.calledWith(
      mockExtender,
      sinon.match({
        data: sinon.match(data),
        errors,
        touched,
        form: formElement,
        controls: sinon.match([]),
      })
    );

    sinon.assert.callCount(mockExtender, 4);

    sinon.assert.callCount(mockExtenderHandler.destroy, 2);
  });

  destroy();
});

Extenders('calls onSubmitError', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const mockExtenderHandler = {
    onSubmitError: sinon.fake(),
  };
  const mockExtender = sinon.fake(() => mockExtenderHandler);
  const mockErrors = { account: { email: 'Not email' } };

  const { form, data } = createForm<any>({
    onSubmit: sinon.fake(() => {
      throw mockErrors;
    }),
    onError: () => mockErrors,
    extend: mockExtender,
  });

  form(formElement);

  formElement.submit();

  await waitFor(() => {
    sinon.assert.calledWith(
      mockExtenderHandler.onSubmitError,
      sinon.match({
        data: sinon.match(get(data)),
        errors: mockErrors,
      })
    );
  });
});

Extenders('calls onSubmitError on multiple extenders', async () => {
  const formElement = screen.getByRole('form') as HTMLFormElement;
  const mockExtenderHandler = {
    onSubmitError: sinon.fake(),
  };
  const mockExtender = sinon.fake(() => mockExtenderHandler);
  const validate = sinon.stub();
  const mockErrors = { account: { email: 'Not email' } };
  const onSubmit = sinon.fake(() => {
    throw mockErrors;
  });

  const { form, data } = createForm<any>({
    onSubmit,
    onError: () => mockErrors,
    validate,
    extend: [mockExtender, mockExtender],
  });

  form(formElement);

  formElement.submit();

  await waitFor(() => {
    sinon.assert.alwaysCalledWith(
      mockExtenderHandler.onSubmitError,
      sinon.match({
        data: get(data),
        errors: mockErrors,
      })
    );
    sinon.assert.callCount(mockExtenderHandler.onSubmitError, 2);
    sinon.assert.callCount(onSubmit, 1);
  });

  validate.returns(mockErrors);
  validate.resetHistory();

  formElement.submit();

  await waitFor(() => {
    sinon.assert.alwaysCalledWith(
      mockExtenderHandler.onSubmitError,
      sinon.match({
        data: get(data),
        errors: mockErrors,
      })
    );
    sinon.assert.callCount(mockExtenderHandler.onSubmitError, 4);
    sinon.assert.callCount(onSubmit, 1);
  });
});

Extenders(
  'adds validator when no validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator);
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
    });
    await validate();
    sinon.assert.callCount(validator, 1);
  }
);

Extenders(
  'adds validator when validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator);
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
      validate: validator,
    });
    await validate();
    sinon.assert.callCount(validator, 3);
  }
);

Extenders(
  'adds warn validator when no validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { level: 'warning' });
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
    });
    await validate();
    sinon.assert.callCount(validator, 1);
  }
);

Extenders(
  'adds warn validator when validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { level: 'warning' });
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
      warn: validator,
    });
    await validate();
    sinon.assert.callCount(validator, 3);
  }
);

// DEBOUNCED
Extenders(
  'adds debounced validator when no validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { debounced: true });
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
    });
    await validate();
    sinon.assert.callCount(validator, 1);
  }
);

Extenders(
  'adds debounced validator when validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, { debounced: true });
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
      validate: validator,
    });
    await validate();
    sinon.assert.callCount(validator, 3);
  }
);

Extenders(
  'adds debounced warn validator when no validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, {
        level: 'warning',
        debounced: true,
      });
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
    });
    await validate();
    sinon.assert.callCount(validator, 1);
  }
);

Extenders(
  'adds debounced warn validator when validators are present with addValidator',
  async () => {
    const validator = sinon.fake();
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addValidator(validator, {
        level: 'warning',
        debounced: true,
      });
      return {};
    }
    const { validate } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
      warn: validator,
    });
    await validate();
    sinon.assert.callCount(validator, 3);
  }
);

Extenders(
  'adds transformer when no validators are present with addTransformer',
  async () => {
    const transformer = sinon.fake((v) => v);
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addTransformer(transformer);
      return {};
    }
    const { data } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
    });
    data.set({});
    sinon.assert.callCount(transformer, 1);
  }
);

Extenders(
  'adds transformer when validators are present with addTransformer',
  async () => {
    const transformer = sinon.fake((v) => v);
    function extender(currentForm: CurrentForm<any>) {
      currentForm.addTransformer(transformer);
      return {};
    }
    const { data } = createForm({
      onSubmit: sinon.fake(),
      extend: extender,
      transform: transformer,
    });
    data.set({});
    sinon.assert.callCount(transformer, 2);
  }
);

Extenders.run();
