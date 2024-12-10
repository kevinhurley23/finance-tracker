<script>
  import Envelope from './Envelope.svelte';
  let { accountTitle, envelopes, currencyFormat, numberFormat, addTransaction, updateTransaction, deleteTransaction } = $props();

  let allExpanded = $state(true);
</script>

<div class="envelope-group">
  <div class="heading-button-row">
    <h2>Transactions</h2>
    <div class="buttons">
      <!-- <button onclick={() => allExpanded = true}>Open All</button>
      <button onclick={() => allExpanded = false}>Close All</button> -->
    </div>
  </div>
  {#each envelopes as envelope}
    <Envelope
      {envelope}
      {accountTitle}
      {allExpanded}
      {currencyFormat}
      {numberFormat}
      {addTransaction}
      {updateTransaction}
      {deleteTransaction}
    />
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