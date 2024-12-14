<script>
  let { showModal = $bindable(), body, confirmBtn } = $props();
	let dialog = $state();

	$effect(() => {
		if (showModal) dialog.showModal();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
>
  {@render body?.()}
  <div class="row">
    {@render confirmBtn?.()}
    <button onclick={() => dialog.close()}>Cancel</button>
  </div>
</dialog>

<style>
	dialog {
    background-color: #fff;
    border: 2px solid var(--accent);
    border-radius: 10px;
	}
	dialog::backdrop {
		background: var(--grey-600);
    opacity: 0.5;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 0.5;
		}
	}
  .row {
    margin-block: 16px;
  }
</style>
