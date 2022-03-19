import 'focus-visible';
import { setLocale } from 'yup';

setLocale({
  mixed: {
    default: 'Not valid',
    required: 'Must not be empty',
  },
  string: {
    email: 'Must be a valid email address',
  },
});
