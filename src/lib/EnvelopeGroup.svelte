<script>
  import IncomeCard from './IncomeCard.svelte';
  import Envelope from './Envelope.svelte';
  let { accountTitle, envelopes, budgetEnvelopeTotals, firstTransactionDate, todayStr, currencyFormat, numberFormat, addTransaction, updateTransaction, deleteTransaction, months } = $props();

  function getLastDayOfMonth(dateStr) {
    const parts = dateStr.split('-');
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    return new Date(year, month, 0).toISOString().slice(0, 10);
  }

  function formatMonthYear(dateStr) {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  
  let selectedMonth = $state(todayStr.slice(0, 7));
  let dateRangeStart = $state(firstTransactionDate.toISOString().slice(0, 10));
  let dateRangeEnd = $state(getLastDayOfMonth(todayStr));
  let dateRange = $derived.by(() => {
    if (accountTitle === "checking") {
      return [`${selectedMonth}-01`, getLastDayOfMonth(selectedMonth)];
    } else if (accountTitle === "savings") {
      return [dateRangeStart, dateRangeEnd];
    }
  });

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
    {dateRange}
    {totalExpenses}
    {currencyFormat}
    {numberFormat}
    {updateTransaction}
  />
  <div class="heading-button-row">
    <h2>Transactions</h2>
    {#if accountTitle === "checking"}
      <div class="month-selector">
        <label for="month">Select Month:</label>
        <select id="month" bind:value={selectedMonth}>
          {#each months as month}
            <option value={month}>{formatMonthYear(month)}</option>
          {/each}
        </select>
      </div>
    <!-- {:else if accountTitle === "savings"}
      <div class="date-range-selector">
        <div>Select Date Range:</div>
        <input type="date" id="date-range-start" bind:value={dateRangeStart}>
        <input type="date" id="date-range-end" bind:value={dateRangeEnd}>
      </div> -->
    {/if}
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
      {dateRange}
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
    align-items: end;
    gap: 25px;
    h2 {
      margin-bottom: 0;
    }
    .month-selector {
      select {
        font-size: 1.1rem;
        padding: 5px;
        border: 2px solid var(--accent);
        border-radius: 5px;
      }
    }
    .date-range-selector {
      input {
        width: 140px;
        font-size: 1.1rem;
        margin-top: 5px;
      }
    }
    .buttons {
      display: flex;
      gap: 20px;
    }
  }
</style>