<script>
  import IncomeCard from './IncomeCard.svelte';
  import Envelope from './Envelope.svelte';
  let { accountTitle, envelopes, budgetEnvelopeTotals, todayStr, currencyFormat, numberFormat, addTransaction, updateTransaction, deleteTransaction } = $props();

  envelopes.forEach(item => item.expanded = true)

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

  function expandAll() {
    envelopes.forEach(item => item.expanded = true)
  }
  function closeAll() {
    envelopes.forEach(item => item.expanded = false)
  }
  function toggleExpanded(envelopeID) {
    let envelope = envelopes.find(item => item.envelopeID === envelopeID);
    envelope.expanded = !envelope.expanded;
  }
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
      <button class="open-envelopes" onclick={expandAll}>Open All</button>
      <button class="close-envelopes" onclick={closeAll}>Close All</button>
    </div>
  </div>
  {#each expenses as envelope (envelope.envelopeID)}
    <Envelope
      {envelope}
      {budgetEnvelopeTotals}
      {accountTitle}
      {todayStr}
      {toggleExpanded}
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