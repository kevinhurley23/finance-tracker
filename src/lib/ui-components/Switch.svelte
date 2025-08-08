<script>
  let { state = $bindable(), color = 'grey-100' } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="switch" data-active={state} onclick={() => {state = !state}} style="--accent: {state ? `var(--${color})` : 'var(--background-secondary)'}">
  <div class="handle"></div>
</div>

<style>
  .switch {
    width: 3em;
    background-color: var(--switch-background);
    border: 2px solid var(--accent);
    border-radius: 100vw;
    padding: 3px;
    cursor: pointer;
    &[data-active=true] .handle {
      transform: translateX(1.2em);
    }
    .handle {
      width: 1.2em;
      height: 1.2em;
      background-color: var(--accent);
      border-radius: 50%;
      transition: transform 300ms;
    }
  }
</style>