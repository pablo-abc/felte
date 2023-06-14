if (typeof DataTransfer === 'undefined') {
  const input = document.createElement('input');
  input.type = 'file';
  // @ts-expect-error DataTransfer is not defined in jsdom
  global.DataTransfer = class DataTransfer {
    items = {
      add: () => {
        return;
      },
    };
    files = input.files;
  };
}
