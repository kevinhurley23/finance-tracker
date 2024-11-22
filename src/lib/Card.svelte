<div class="card">
  <slot></slot>
</div>

<style>
  .card {
    background-color: #fff;
    margin-block: 30px;
    border: 2px solid var(--accent);
    border-radius: 10px;
    overflow: hidden;
    &:not(:has(.envelope)) {
      width: fit-content;
      min-width: 300px;
      margin-inline: auto;
    }
  }
</style>