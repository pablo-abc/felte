<script setup lang="ts">
import { createForm } from '@felte/vue';
import { ref } from 'vue';

type Data = {
  email: string;
  password: string;
};

const submitted = ref<Data | null>(null);

const { vForm, errors } = createForm<Data>({
  onSubmit(values) {
    submitted.value = values;
  },
  validate(values) {
    const errors: { email: string[]; password: string[] } = {
      email: [],
      password: [],
    };
    if (!values.email) errors.email.push('Must not be empty');
    if (!/[a-zA-Z][^@]*@[a-zA-Z][^@.]*\.[a-z]{2,}/.test(values.email))
      errors.email.push('Must be a valid email');
    if (!values.password) errors.password.push('Must not be empty');
    return errors;
  },
});
const emailMessage = errors('email');
const passwordMessage = errors('password');
</script>

<template>
  <h1>Basic Example - VueJS</h1>
  <form v-form>
    <fieldset>
      <legend>Sign In</legend>
      <label for="email">Email:</label>
      <input type="email" name="email" id="email" />
      <ul v-if="emailMessage" aria-live="polite">
        <li v-for="message in emailMessage" :key="message">{{ message }}</li>
      </ul>
      <label for="password">Password:</label>
      <input type="password" name="password" id="password" />
      <ul v-if="passwordMessage" aria-live="polite">
        <li v-for="message in passwordMessage" :key="message">{{ message }}</li>
      </ul>
    </fieldset>
    <button type="submit">Submit</button>
    <button type="reset" @click="submitted = null">Reset</button>
  </form>
  <pre v-if="submitted">{{ JSON.stringify(submitted, null, 2) }}</pre>
</template>
