<script>
  import IncomeSection from './IncomeSection.svelte';
  import Envelope from './Envelope.svelte';
  import Modal from '../ui-components/Modal.svelte';
  import { months } from '../data.svelte.js'
  import { todayStr } from '../dates.js'
  import { data, transactionsToCopy } from '../data.svelte.js';
  import { dateISOToDisplay, dateISOToMonthAndYear, addTransaction, findEnvelopeIndex } from '../functions.js';
  let { accountTitle, envelopes, budgetEnvelopeTotals, firstTransactionDate } = $props();

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

  let showCopyingTransactionsModal = $state(false);
  let copyingTransactionsInProgress = $state(false);
  
  let transactionCount = $state(0);
  let totalExpenses = $state(0);
  let assets = $derived.by(() => envelopes.find(item => item.envelopeTitle === "Income"));
  let expenses = $derived.by(() => envelopes.filter(item => item.envelopeTitle !== "Income"));
  let latestTransaction = $derived.by(() => {
    let latest = new Date(0);
    for (const envelope of envelopes) {
      for (const transaction of envelope.transactions) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate > latest && !transaction.repeating) {
          latest = transactionDate;
        }
      }
    }
    return dateISOToDisplay(latest.toISOString().slice(0, 10));
  });

  function getLastDayOfMonth(dateStr) {
    const parts = dateStr.split('-');
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    return new Date(year, month, 0).toISOString().slice(0, 10);
  }
  function changeSelectedMonth(e) {
    if (e.target.value === "add-month") {
      addMonth();
    } else {
      selectedMonth = e.target.value;
    }
  }
  function addMonth() {
    let lastMonth = months[months.length - 1];
    let newMonth = new Date(`${lastMonth}-02`);
    newMonth.setMonth(newMonth.getMonth() + 1);
    let newMonthStr = newMonth.toISOString().slice(0, 7);
    months.push(newMonthStr);
    selectedMonth = newMonthStr;
  }

  function expandAll() {
    envelopes.forEach(item => {
      if (item.envelopeTitle !== "Income") {
        item.expanded = true;
      }
    })
  }
  function closeAll() {
    envelopes.forEach(item => {
      if (item.envelopeTitle !== "Income") {
        item.expanded = false;
      }
    })
  }
  function toggleExpanded(envelopeID) {
    let envelope = envelopes.find(item => item.envelopeID === envelopeID);
    envelope.expanded = !envelope.expanded;
  }

  function prepareToCopyTransactions() {
    const previousMonthEnd = new Date(selectedMonth);
    const previousMonthStart = new Date(previousMonthEnd);
    previousMonthStart.setDate(0);
    previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);
    const startStr = previousMonthStart.toISOString().slice(0, 10);
    const endStr = previousMonthEnd.toISOString().slice(0, 10);
    for (const envelope of data[accountTitle]) {
      for (const transaction of envelope.transactions) {
        if (
          transaction.date >= startStr &&
          transaction.date <= endStr &&
          transaction.repeating
        ) {
          const parts = transaction.date.split("-");
          let year = parseInt(parts[0], 10);
          let month = parseInt(parts[1], 10);
          let day = parseInt(parts[2], 10);
          if (month === 12) {
            month = 1;
            year++;
          } else {
            month++;
          }
          day = day > 28 ? 28 : day;
          const newDate = `${String(year)}-${String(month).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          const envelopeIndex = findEnvelopeIndex(accountTitle, envelope.envelopeID);
          const duplicateTransaction = data[accountTitle][envelopeIndex].transactions.find(
            (item) => item.date === newDate && item.transactionDescription === transaction.transactionDescription
          );

          if (!duplicateTransaction) {
            transactionsToCopy.push({
              envelopeID: envelope.envelopeID,
              envelopeTitle: envelope.envelopeTitle,
              description: transaction.transactionDescription,
              oldDate: transaction.date,
              newDate: newDate,
              amount: transaction.amount,
            });
          }
        }
      }
    }
    showCopyingTransactionsModal = true;
  }

  async function copyTransactions() {
    for (const transaction of transactionsToCopy) {
      await addTransaction(
        accountTitle,
        transaction.envelopeID,
        transaction.description,
        transaction.newDate,
        transaction.amount,
        true
      );
    }
    resetCopyingTransactionsModal()
  }

  function resetCopyingTransactionsModal() {
    transactionsToCopy.length = 0;
    showCopyingTransactionsModal = false;
  }

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
      <button onclick={prepareToCopyTransactions}>Copy Transactions</button>
    </div>
  </div>
{:else}
  <IncomeSection
    {accountTitle}
    {assets}
    {dateRange}
    {latestTransaction}
    {totalExpenses}
    {toggleExpanded}
  />
{/if}
<div class="heading-button-row">
  <h2>Transactions</h2>
  {#if accountTitle === "checking"}
    <div class="month-selector">
      <label for="month">Select Month:</label>
      <select id="month" value={selectedMonth} onchange={changeSelectedMonth}>
        {#each months as month}
          <option value={month}>{dateISOToMonthAndYear(month)}</option>
        {/each}
        <option value="add-month">Add Month</option>
      </select>
    </div>
  {:else if accountTitle === "savings"}
    <button onclick={prepareToCopyTransactions}>Copy Transactions</button>
    <!-- <div class="date-range-selector">
      <div>Select Date Range:</div>
      <input type="date" id="date-range-start" bind:value={dateRangeStart}>
      <input type="date" id="date-range-end" bind:value={dateRangeEnd}>
    </div> -->
  {/if}
  {#if transactionCount !== 0}
    <div class="buttons">
      <button class="open-envelopes" onclick={expandAll}>Open All</button>
      <button class="close-envelopes" onclick={closeAll}>Close All</button>
    </div>
  {/if}
</div>
{#if transactionCount !== 0}
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
{/if}

{#if showCopyingTransactionsModal}
  <Modal bind:showModal={showCopyingTransactionsModal}>
    {#snippet modalBody()}
      {#if copyingTransactionsInProgress}
        <p>Transactions copying, please wait...</p>
        <div class="row">
          <div class="spinner"></div>
        </div>
      {:else}
        {#if transactionsToCopy.length > 0}
          <h3>The following transactions will be copied:</h3>
          <div class="transactions-to-copy">
            {#each transactionsToCopy as transaction}
              <p>
                <span>{transaction.envelopeTitle}: {transaction.description}</span>
                <span>{dateISOToDisplay(transaction.oldDate)} <i class="fa-solid fa-arrow-right"></i> {dateISOToDisplay(transaction.newDate)}</span>
              </p>
            {/each}
          </div>
          <p class="text-center">Would you like to proceed?</p>
        {:else}
          <p>No transactions to copy</p>
        {/if}
      {/if}
    {/snippet}
    {#snippet modalButtons()}
      {#if !copyingTransactionsInProgress}
        {#if transactionsToCopy.length > 0}
          <button onclick={copyTransactions}>Copy</button>
          <button onclick={resetCopyingTransactionsModal}>Cancel</button>
        {:else}
          <button onclick={resetCopyingTransactionsModal}>Ok</button>
        {/if}
      {/if}
    {/snippet}
  </Modal>
{/if}

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
  .transactions-to-copy {
    max-height: 500px;
    overflow-y: auto;
    margin-block: 10px;
    padding-inline: 20px;
		p {
			margin: 0.25em 0;
      display: flex;
      justify-content: space-between;
      gap: 20px;
		}
	}
</style>