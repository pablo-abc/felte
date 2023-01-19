import type { Obj, ExtenderHandler } from '@felte/common';
import {
  _unset,
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
    if (currentForm.stage === 'SETUP') return {};
    const { controls, form } = currentForm;
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

        if(dataString){
          const retrievedData = JSON.parse(dataString)
          currentForm.data.set(retrievedData);
          setForm(form, retrievedData);
        }

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
