<script>
  let { cardBody, cardClass = '' } = $props();
  let classes = `card ${cardClass}`;
</script>

<div class={classes}>
  {@render cardBody?.()}
</div>

<style>
  .card {
    background-color: #fff;
    border: 2px solid var(--accent);
    border-radius: 10px;
    height: fit-content;
    &.income-card {
      width: fit-content;
      margin-inline: auto;
    }
  }
</style>