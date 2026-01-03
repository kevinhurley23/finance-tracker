<script>
	import {scale} from "svelte/transition";
	import {quartInOut} from "svelte/easing";
  let { showModal = $bindable(), modalBody, modalButtons = undefined } = $props();
	let dialog = $state();

	$effect(() => {
		if (showModal) dialog.showModal();
	});

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent default Enter behavior (e.g., form submission)
			const submitButton = dialog.querySelector('.modal-submit-button');
			if (submitButton) {
				submitButton.click(); // Programmatically click the designated button
			}
		}
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onkeydown={handleKeydown}
	transition:scale={{duration: 200, easing: quartInOut}}
>
  {@render modalBody?.()}
  {#if modalButtons}
		<div class="row">
			{@render modalButtons?.()}
		</div>
	{/if}
</dialog>

<style>
	dialog {
    background-color: var(--background-secondary);
		color: unset;
		border: 2px solid var(--accent, var(--checking-accent));
    border-radius: 10px;
	}
	dialog::backdrop {
		background: var(--background-secondary);
    opacity: 0.5;
		transition: 500ms;
	}
  .row {
    margin-block: 16px;
  }
</style>
