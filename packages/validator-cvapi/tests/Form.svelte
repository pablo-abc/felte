<script>
  import { createForm } from 'felte';
  import { validator } from '../src';

  const { form } = createForm({
    extend: validator({
      legal: 'You have to confirm!',

      password: (state) => {
        if (state.tooShort) {
          return 'Yoda once said: Your password strong has to be!';
        }

        if (state.valueMissing) {
          return 'No entry without password!';
        }

        return 'Nice try, buddy!';
      },
    }),
    onSubmit: async (values) => {},
  });
</script>

<form use:form>
  <input type="email" required name="email" data-testid="email" />
  <input
    type="password"
    required
    name="password"
    minlength={8}
    data-testid="password"
  />
  <input type="checkbox" required name="legal" data-testid="legal" />
  <button type="submit" data-testid="submit">Submit</button>
</form>
