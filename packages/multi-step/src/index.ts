import type { Writable } from 'svelte/store';
import type { Obj, FormConfig, Form } from '@felte/common';
import { createForm } from 'felte';
import { writable, get } from 'svelte/store';

type FormSubmitValues<Datas extends Obj[], Data extends Obj> = {
  values: Data;
  allValues: Datas;
  currentStep: number;
  increaseStep: () => void;
  decreaseStep: () => void;
  step: Writable<number>;
};

type MultiFormConfig<Datas extends Obj[], Data extends Obj> = {
  onSubmit: (forms: FormSubmitValues<Datas, Data>) => Promise<void> | void;
  [key: string]: unknown;
} & Pick<FormConfig<Data>, 'initialValues' | 'extend' | 'validate' | 'onError'>;

type FormConfigs<Datas extends Obj[]> = {
  [key in keyof Datas]: Datas[key] extends Obj
    ? MultiFormConfig<Datas, Datas[key]>
    : never;
};

type Forms<Datas extends Obj[]> = {
  [key in keyof Datas]: Datas[key] extends Obj ? Form<Datas[key]> : never;
};

type MultiStepForm<Datas extends Obj[]> = {
  step: Writable<number>;
  totalSteps: number;
  pages: Forms<Datas>;
  increaseStep: () => void;
  decreaseStep: () => void;
};

type Config<Datas extends Obj[]> = {
  initialStep?: number;
  pages: FormConfigs<Datas>;
};

export function createForms<Datas extends Obj[]>({
  pages: configs,
  initialStep = 0,
}: Config<Datas>): MultiStepForm<Datas> {
  const step = writable(initialStep);
  const increaseStep = () => step.update(($step) => $step + 1);
  const decreaseStep = () => step.update(($step) => $step - 1);
  let pageDataStores: Writable<Obj>[] = configs.map((config) => {
    return writable((config?.initialValues as Obj) ?? {});
  });
  const formConfigs = configs.map((config) => ({
    ...config,
    onSubmit: (values: Obj) => {
      return config.onSubmit({
        step,
        values,
        increaseStep,
        decreaseStep,
        currentStep: get(step),
        allValues: pageDataStores.map(get),
      });
    },
  }));
  const pages = formConfigs.map((config) => createForm(config)) as Forms<Datas>;
  pageDataStores = pages.map((page) => page.data);
  return {
    step,
    increaseStep,
    decreaseStep,
    totalSteps: configs.length,
    pages,
  };
}
