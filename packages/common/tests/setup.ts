if (typeof DataTransfer === 'undefined') {
  const fileCache = new WeakMap();

  // from: https://github.com/jsdom/jsdom/issues/1272#issuecomment-1433806654
  Object.defineProperty(HTMLInputElement.prototype, 'files', {
    set(fileList) {
      fileCache.set(this, fileList);

      Object.defineProperty(this, 'files', {
        get() {
          return fileCache.get(this);
        },
        set(value) {
          fileCache.set(this, value);
        },
      });
    },
  });

  // @ts-expect-error DataTransfer is not defined in jsdom
  global.DataTransfer = class DataTransfer {
    #values: File[] = [];
    items = {
      add: (item: File) => {
        this.#values.push(item);
      },
    };
    get files() {
      const fileList = Object.assign([...this.#values], {
        item: (index: number) => this.#values[index],
      });
      Object.setPrototypeOf(fileList, FileList.prototype);
      return (fileList as unknown) as FileList;
    }
  };
}
