<div class="card">
  <slot></slot>
</div>

<style>
  .card {
    background-color: #fff;
    margin-block: 40px;
    border: 2px solid var(--accent);
    border-radius: 10px;
    &:not(:has(.envelope)) {
      width: fit-content;
      margin-inline: auto;
    }
  }
</style>