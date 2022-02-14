import 'uvu-expect-dom/extend';

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
  index?: number;
};

export function createInputElement(attrs: InputAttributes): HTMLInputElement {
  const inputElement = document.createElement('input');
  if (attrs.name) inputElement.name = attrs.name;
  if (attrs.type) inputElement.type = attrs.type;
  if (attrs.value) inputElement.value = attrs.value;
  if (attrs.checked) inputElement.checked = attrs.checked;
  if (typeof attrs.index !== 'undefined')
    inputElement.name = `${attrs.name}.${attrs.index}.value`;
  inputElement.required = !!attrs.required;
  return inputElement;
}

export function removeAllChildren(parent: Node): void {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export function createMultipleInputElements(
  attr: InputAttributes,
  amount = 3
): HTMLInputElement[] {
  const inputs = [];
  for (let i = 0; i < amount; i++) {
    const input = createInputElement({ ...attr, index: i });
    inputs.push(input);
  }
  return inputs;
}
