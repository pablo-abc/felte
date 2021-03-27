<blockquote><slot></slot></blockquote>

<style>
  blockquote {
    background: var(--header-background);
    padding: 0.5rem 1rem;
    border-left: 4px solid var(--primary-color);
    width: 95%;
    margin: 1.5rem auto;
  }

  blockquote > :global(*) {
    margin: 0.5rem 0;
  }
</style>
