<script>
  import IncomeCard from './IncomeCard.svelte';
  import Envelope from './Envelope.svelte';
  import { months } from './data.svelte.js'
  import { todayStr } from './dates.js'
  import { copyTransactions } from './functions.js';
  let { accountTitle, envelopes, budgetEnvelopeTotals, firstTransactionDate } = $props();

  function getLastDayOfMonth(dateStr) {
    const parts = dateStr.split('-');
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    return new Date(year, month, 0).toISOString().slice(0, 10);
  }
  function formatMonthYear(dateStr) {
    const date = new Date(dateStr);
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

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

  envelopes.forEach(item => item.expanded = true)
  
  let selectedMonth = $state(todayStr.slice(0, 7));
  // let dateRangeStart = $state(firstTransactionDate.toISOString().slice(0, 10));
  // let dateRangeEnd = $state(getLastDayOfMonth(todayStr));
  let dateRange = $derived.by(() => {
    if (accountTitle === "budget") {
      return ["2025-01-01", "2025-01-31"];
    } else if (accountTitle === "checking") {
      return [`${selectedMonth}-01`, getLastDayOfMonth(selectedMonth)];
    } else if (accountTitle === "savings") {
      // return [dateRangeStart, dateRangeEnd];
      return [firstTransactionDate, getLastDayOfMonth(todayStr)];
    }
  });

  let transactionCount = $state(0);
  let totalExpenses = $state(0);
  let assets = $derived.by(() => envelopes.find(item => item.envelopeTitle === "Income"));
  let expenses = $derived.by(() => envelopes.filter(item => item.envelopeTitle !== "Income"));

  $effect(() => {
    let accountExpensesTotal = 0;
    let accountTransactionCount = 0;
    expenses.forEach((envelope) => {
      let envelopeExpensesTotal = 0;
      let envelopeTransactionCount = 0;
      envelope.transactions.forEach(transaction => {
        if (accountTitle === "checking") {
          if (transaction.date >= dateRange[0] && transaction.date <= dateRange[1]) {
            envelopeExpensesTotal += transaction.amount;
            envelopeTransactionCount++;
          }
        } else {
          envelopeExpensesTotal += transaction.amount;
          envelopeTransactionCount++;
        }
      })
      envelope.totalAmount = envelopeExpensesTotal;
      accountExpensesTotal += envelopeExpensesTotal;
      accountTransactionCount += envelopeTransactionCount;
    })
    totalExpenses = accountExpensesTotal;
    transactionCount = accountTransactionCount;
  })
</script>

{#if transactionCount === 0}
  <div class="copy-transactions-dialog">
    <p>There are no transactions this month. Would you like to copy all of the repeating transactions from the previous month?</p>
    <div class="row">
      <button onclick={() => copyTransactions(selectedMonth)}>Copy Transactions</button>
    </div>
  </div>
{:else}
  <IncomeCard
    {accountTitle}
    {assets}
    {dateRange}
    {totalExpenses}
  />
{/if}
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
<div class="transaction-envelopes">
  {#each expenses as envelope (envelope.envelopeID)}
    <Envelope
      {envelope}
      {budgetEnvelopeTotals}
      {accountTitle}
      {dateRange}
      {toggleExpanded}
    />
  {/each}
</div>

<style>
  .copy-transactions-dialog {
    max-width: 750px;
    margin-inline: auto;
  }
  .heading-button-row {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 25px;
    margin-inline: auto;
    h2 {
      margin: 0;
    }
    .month-selector {
      text-align: center;
      select {
        font-size: 1.1rem;
        padding: 5px;
        border: 2px solid var(--accent);
        border-radius: 5px;
      }
    }
    /* .date-range-selector {
      input {
        width: 140px;
        font-size: 1.1rem;
        margin-top: 5px;
      }
    } */
    .buttons {
      display: flex;
      gap: 20px;
    }
  }
  .transaction-envelopes {
    display: grid;
    grid-template-columns: repeat(auto-fit, 750px);
    grid-template-rows: masonry;
    grid-row: span 90;
    justify-content: center;
    gap: 30px;
  }
</style>