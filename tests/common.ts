export function createDOM(): void {
  const formElement = document.createElement('form');
  formElement.name = 'test-form';
  document.body.appendChild(formElement);
}

export type InputAttributes = {
  type?: string;
  required?: boolean;
  name?: string;
};

export function createInputElement(attrs: InputAttributes): HTMLInputElement {
  const inputElement = document.createElement('input');
  if (attrs.name) inputElement.name = attrs.name;
  if (attrs.type) inputElement.type = attrs.type;
  inputElement.required = !!attrs.required;
  return inputElement;
}

export function removeAllChildren(parent: Node): void {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
