export function createDOM(): void {
  const formElement = document.createElement('form');
  formElement.name = 'test-form';
  document.body.appendChild(formElement);
}

export function cleanupDOM(): void {
  removeAllChildren(document.body);
}

export type InputAttributes = {
  type?: string;
  required?: boolean;
  name?: string;
  value?: string;
  checked?: boolean;
};

export function createInputElement(attrs: InputAttributes): HTMLInputElement {
  const inputElement = document.createElement('input');
  if (attrs.name) inputElement.name = attrs.name;
  if (attrs.type) inputElement.type = attrs.type;
  if (attrs.value) inputElement.value = attrs.value;
  if (attrs.checked) inputElement.checked = attrs.checked;
  inputElement.required = !!attrs.required;
  return inputElement;
}

export function removeAllChildren(parent: Node): void {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
