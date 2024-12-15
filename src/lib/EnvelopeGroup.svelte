<script>
  import IncomeCard from './IncomeCard.svelte';
  import Envelope from './Envelope.svelte';
  let { accountTitle, envelopes, todayStr, currencyFormat, numberFormat, addTransaction, updateTransaction, deleteTransaction } = $props();

  let assets = $derived.by(() => envelopes.find(item => item.envelopeTitle === "Income"));
  let expenses = $derived.by(() => envelopes.filter((item) => item.envelopeTitle !== "Income"));
  
  let totalExpenses = $derived.by(() => {
    let accountAccumulator = 0;
    expenses.forEach((envelope) => {
      let envelopeAccumulator = 0;
      envelope.transactions.forEach(transaction => {
        envelopeAccumulator += transaction.amount;
      })
      accountAccumulator += envelopeAccumulator;
    })
    return accountAccumulator;
  })

  let allExpanded = $state(true);
</script>

<div class="envelope-group">
  <IncomeCard
    {accountTitle}
    {assets}
    {totalExpenses}
    {currencyFormat}
    {numberFormat}
    {updateTransaction}
  />
  <div class="heading-button-row">
    <h2>Transactions</h2>
    <div class="buttons">
      <!-- <button onclick={() => allExpanded = true}>Open All</button>
      <button onclick={() => allExpanded = false}>Close All</button> -->
    </div>
  </div>
  {#each expenses as envelope}
    <Envelope
      {envelope}
      {accountTitle}
      {allExpanded}
      {todayStr}
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