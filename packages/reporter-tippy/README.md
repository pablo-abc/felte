# @felte/reporter-tippy

![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-tippy)
![NPM Version](https://img.shields.io/npm/v/@felte/reporter-tippy)

A Felte reporter that uses [Tippy.js](https://atomiks.github.io/tippyjs/) to display your error messages.

## Installation

```sh
npm install --save @felte/reporter-tippy tippy.js

# Or, if you use yarn

yarn add @felte/reporter-tippy tippy.js
```

## Usage

Add it to the `reporter` property of Felte's `createForm` configuration object.

```javascript
import reporter from '@felte/reporter-tippy';

const { form } = createForm({
  // ...
  reporter,
  // ...
});
```

You might want to add Tippy's styles somewhere in your repo as well

```javascript
import 'tippy.js/dist/tippy.css';
```
