<script>
  import { page } from '$app/stores';
</script>

<header>
  <nav>
    <h1>
      <a
        href="/"
        aria-current="{$page.path === '/' ? 'page' : undefined}"
        >
        <span class="sr-only">Felte Home</span>
        <img src="felte-logo.svg" width="98" height="53" alt="">
      </a>
    </h1>
    <ul>
      <li>
        <a
          aria-current="{$page.path === '/docs' ? 'page' : undefined}"
          href="docs"
          sveltekit:prefetch
          >
          docs
        </a>
      </li>
      <li><a href="https://api.felte.dev">API</a></li>
      <li>
        <a
          class=icon-link
          rel=noreferrer
          href="https://github.com/pablo-abc/felte"
          aria-label="Github Repository"
          >
          <img height=25 width=25 src="icons/github-icon.svg" alt="" />
        </a>
      </li>
    </ul>
  </nav>
</header>

<style>
  .sr-only {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  header {
    border-bottom: 1px solid rgba(255, 62, 0, 0.1);
    z-index: 99999;
    width: 100%;
    background: rgba(255, 255, 255, 0.6);
    min-height: 57px;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 auto;
    width: 95%;
  }

  h1 {
    margin: 0;
    padding: 0;
    padding-left: 2rem;
  }

  h1 a {
    padding: 0;
  }

  h1 a img {
    height: 3.3rem;
  }

  ul {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    padding-right: 2rem;
  }

  /* clearfix */
  ul::after {
    content: '';
    display: block;
    clear: both;
  }

  li {
    display: block;
    float: left;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
  }

  [aria-current]::after {
    position: absolute;
    content: '';
    width: calc(100%);
    height: 2px;
    background-color: rgb(255,62,0);
    display: block;
    left: 0;
    right: 0;
    bottom: -1px;
  }

  a {
    text-decoration: none;
    padding: 1em 0.5em;
    display: block;
  }

  .icon-link {
    margin-top: 0.3rem;
    padding: 0 0.8em;
  }
</style>
