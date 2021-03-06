import type { Obj, ExtenderHandler, FormControl } from '@felte/common';
import {
  _unset,
  _get,
  CurrentForm,
  setForm,
  _cloneDeep,
  getPath,
} from '@felte/common';

type ExtenderConfig = {
  ignore?: string[];
  id: string;
};

const loaded: { [key: string]: boolean } = {};

export function extender(config: ExtenderConfig) {
  return function <Data extends Obj = Obj>(
    currentForm: CurrentForm<Data>
  ): ExtenderHandler<Data> {
    const { controls, form } = currentForm;
    if (!controls || !form) return {};
    const unsubscribe = currentForm.data.subscribe(($data) => {
      if (!loaded[config.id]) return;
      let savedData = _cloneDeep($data);
      for (const control of controls) {
        const path = getPath(control);
        if (
          control.type === 'file' ||
          control.hasAttribute('data-felte-extender-persist-ignore') ||
          config.ignore?.includes(path)
        ) {
          savedData = _unset(savedData, path);
        }
      }
      localStorage.setItem(config.id, JSON.stringify(savedData));
    });
    if (!loaded[config.id]) {
      setTimeout(() => {
        const dataString = localStorage.getItem(config.id);
        const retrievedData = dataString && JSON.parse(dataString);
        currentForm.data.set(retrievedData);
        setForm(form, retrievedData);
        loaded[config.id] = true;
      });
    }
    return {
      destroy() {
        unsubscribe();
      },
    };
  };
}
