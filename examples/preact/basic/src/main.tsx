import { render } from 'preact';
import { App } from './app';
import './reset.css';
import './index.css';

render(<App />, document.getElementById('app')!);
