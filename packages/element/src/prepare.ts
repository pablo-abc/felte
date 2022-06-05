import type { FormConfig, Obj } from '@felte/core';
export { FelteSubmitError } from '@felte/core';
export type {
  FelteSubmitEvent,
  FelteErrorEvent,
  FelteSuccessEvent,
} from '@felte/core';

export function prepareForm<Data extends Obj = any>(
  id: string,
  config: FormConfig<Data>
): Promise<HTMLFelteFormElement> {
  function handleConnect(e: Event) {
    const felteForm = e.composedPath()[0] as HTMLFelteFormElement;
    if (felteForm.id !== id) return;
    felteForm.configuration = config;
    document.removeEventListener('felteconnect', handleConnect);
  }

  document.addEventListener('felteconnect', handleConnect);

  return new Promise((resolve) => {
    function handleReady(e: Event) {
      const felteForm = e.composedPath()[0] as HTMLFelteFormElement;
      if (felteForm.id !== id) return;
      resolve(felteForm);
      document.removeEventListener('felteready', handleReady);
    }
    document.addEventListener('felteready', handleReady);
  });
}
