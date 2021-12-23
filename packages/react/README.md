# @felte/react

Experimental package to integrate Felte with React. Currently using a `useState` per store. We subscribe to each store on an `useEffect`, triggering a state setter for the respective store on update. We also make sure to only call `createForm` once on component initialization by using our own `useConst` hook.

Unlike other integrations, to maintain consistency with React, the function to create a form is called `useForm` and, instead of `form` it returns `formRef`. API changes will be needed to make the API more friendly and consistent. And Svelte is a dependency since we're using its `writable` store as a store factory. Although this does not add much to the bundle, just a few lines.

More documentation coming soon.
