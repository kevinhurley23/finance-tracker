<script>
  import Envelope from './Envelope.svelte';
  // export let heading;
  // export let envelopes;
  // export let currencyFormat;
  let { heading, envelopes, currencyFormat, highestTransactionID, setHighestTransactionID } = $props();

  let allExpanded = $state(true);
</script>

<div class="envelope-group">
  <div class="heading-button-row">
    <h2>{heading}</h2>
    <div class="buttons">
      <button onclick={() => allExpanded = true}>Open All</button>
      <button onclick={() => allExpanded = false}>Close All</button>
    </div>
  </div>
  {#each envelopes as envelope}
    <Envelope {envelope} {allExpanded} {currencyFormat} {highestTransactionID} {setHighestTransactionID}/>
  {/each}
</div>

<style>
  .heading-button-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .buttons {
      display: flex;
      gap: 20px;
    }
  }
</style>