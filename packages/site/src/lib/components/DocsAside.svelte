<script>
  import { onDestroy, onMount, getContext } from 'svelte';
  import { session } from '$app/stores';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { cubicIn } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import DocsNav from './DocsNav.svelte';
  import { portal } from 'svelte-portal';
  import { useFocusOn } from 'svelte-focus-on';

  const focusOn = useFocusOn();

  export let framework = 'svelte';
  const itemsStore = getContext('items');
  let items = $itemsStore;
  let open = false;
  let mqList;
  let isDesktop;

  function menuTransition() {
    return {
      duration: 300,
      css: (t, u) => `
        transform: translateX(-${cubicIn(u) * 300}px);
        opacity: ${t};
      `,
    };
  }

  async function updateItems(framework) {
    const res = await fetch(`/docs/${framework}/all.json`);
    items = await res.json();
    $itemsStore = items;
  }

  function watchMedia(e) {
    isDesktop = e.matches;
  }

  onMount(() => {
    if (!$session.framework) $session.framework = framework;
    mqList = matchMedia('(min-width: 966px)');
    isDesktop = mqList.matches;
    mqList.addEventListener('change', watchMedia);
  });

  onDestroy(() => {
    mqList?.removeEventListener('change', watchMedia);
  });

  function handleChange(e) {
    const framework = e.currentTarget.value;
    $session.framework = framework;
    updateItems(framework);
    let path = $page.path.split('/');
    if (path.length === 2) return;
    path[2] = framework;
    path = path.join('/')
    goto(path);
  }

  function handleClickOutside(event) {
    if (event.currentTarget === event.target) open = false;
  }

  $: $session.framework && $session.framework !== framework && updateItems($session.framework);

  $: asideItems = items.map(section => ({
    id: section.attributes.id,
    section: section.attributes.section,
    subsections: section.attributes.subsections,
  }));
</script>

<div class=desktop-menu>
  <div class=sidebar>
    <label for="framework-select">Choose your framework:</label>
    <select id="framework-select" on:input={handleChange} value="{$session.framework}">
      <option value="svelte">Svelte</option>
      <option value="solid">Solid</option>
    </select>
    <DocsNav framework={$session.framework ?? 'svelte'} items={asideItems} />
  </div>
</div>

<div class=mobile-menu>
  {#if open && !isDesktop}
    <div use:portal class=overlay on:click="{handleClickOutside}" transition:fade >
      <div use:focusOn class=sidebar aria-label="Side menu" transition:menuTransition>
        <div class=actions>
          <button
            class=close-button
            on:click="{() => (open = false)}"
            aria-label="Close side menu"
            >
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <label for="framework-select">Choose your framework:</label>
        <select id="framework-select" on:input={handleChange} value="{$session.framework}">
          <option value="svelte">Svelte</option>
          <option value="solid">Solid</option>
        </select>
        <DocsNav framework={$session.framework ?? 'svelte'} on:close="{() => (open = false)}" items={asideItems} />
      </div>
    </div>
  {:else}
    <div class=menu-button transition:fade="{{ duration: 200 }}">
      <button
        on:click="{() => (open = true)}"
        class=menu-button
        aria-label="Open side menu"
        >
        <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  {/if}
</div>

<style>
  .desktop-menu {
    display: none;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
  }

  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    background: var(--primary-background);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    box-shadow:
      0 2.8px 2.2px rgba(0, 0, 0, 0.034),
      0 6.7px 5.3px rgba(0, 0, 0, 0.048),
      0 12.5px 10px rgba(0, 0, 0, 0.06),
      0 22.3px 17.9px rgba(0, 0, 0, 0.072),
      0 41.8px 33.4px rgba(0, 0, 0, 0.086),
      0 100px 80px rgba(0, 0, 0, 0.12)
    ;
  }

  @media (min-width: 966px) {
    .desktop-menu {
      display: block;
      grid-area: aside;
    }

    .mobile-menu {
      display: none;
    }

    .sidebar {
      position: -webkit-sticky;
      position: sticky;
      top: 2rem;
      min-height: 0;
      max-height: calc(100vh - 4rem);
      box-shadow: none;
    }
  }

  .menu-button {
    position: fixed;
    display: grid;
    place-items: center;
    background: var(--primary-color);
    height: 56px;
    width: 56px;
    left: 2rem;
    bottom: 2rem;
    transition: background 100ms;
    border-radius: 50%;
    box-shadow:
      0 2.8px 6.2px rgba(77, 64, 43, 0.064),
      0 6.7px 8.3px rgba(0, 0, 0, 0.098)
    ;
  }

  .menu-button:hover {
    background: var(--primary-color-hover);
  }

  .menu-button button {
    background: transparent;
    color: var(--on-primary-color);
  }

  .menu-button svg {
    width: 36px;
  }

  .close-button {
    height: 44px;
    width: 44px;
    transition: color 100ms;
  }

  .close-button:hover {
    color: var(--primary-font-color-hover);
  }

  .overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  label {
    margin: 16px;
  }

  select {
    display: block;
    color: #111111;
    width: 18ch;
    max-width: 30ch;
    border: 1px solid var(--primary-color);
    appearance: auto;
    border-radius: 0.25em;
    padding: 0.25em 0.5em;
    cursor: pointer;
    line-height: 1.1;
    background-color: #fff;
    margin: 8px 16px;
  }
</style>
