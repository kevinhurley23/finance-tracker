<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import EnvelopeGroup from './lib/EnvelopeGroup.svelte';
  import Switch from './lib/Switch.svelte';
  import Modal from './lib/Modal.svelte';
  import { placeholderData } from './lib/placeholderData.svelte.js';
  import { todayObj, todayStr } from './lib/dates.js';

  const accountNames = ["budget", "checking", "savings"];
  let sectionDisplayed = $state(["checking"]);
  let testingMode = $state(false);
  let canToggleTestingMode = $state(true);
  let oneSectionAtATime = $state(true);
  let showConnectErrorModal = $state(false);
  let showCopyingTransactionsModal = $state(false);

  let months = $state([]);

  let data = $state();
  let dataReady = $state(false);
  let maxEnvelopes = $state(0);
  async function fetchData() {
    try {
      const response = await fetch('../php/read.php');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      data = await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      data = placeholderData;
      showConnectErrorModal = true;
      testingMode = true;
      canToggleTestingMode = false;
      setTimeout(() => showConnectErrorModal = false, 2000);
    }
    dataReady = true;
    maxEnvelopes = data.checking.length;
    populateMonths();
  }
  fetchData();

  function populateMonths() {
    let dateIterator = new Date(data.firstTransactionDate);
    while (dateIterator <= todayObj) {
      months.push(dateIterator.toISOString().slice(0, 7));
      dateIterator.setMonth(dateIterator.getMonth() + 1);
    }
  }

  let budgetEnvelopeTotals = $state({});
  $effect(() => {
		if (dataReady) {
      data.budget.forEach((envelope) => {
        let envelopeAccumulator = 0;
        envelope.transactions.forEach(transaction => {
          envelopeAccumulator += transaction.amount;
        })
        budgetEnvelopeTotals[envelope.envelopeTitle] = envelopeAccumulator;
      })
    };
	});

  function currencyFormat(amount) {
    if (amount == undefined) {
      return;
    } else {
      let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      return USDollar.format(amount);
    }
  }

  function numberFormat(string) {
    const cleanedString = string.replace(/[$,]/g, '');
    // Check if the cleaned string contains only numbers, periods, and negative signs
    if (/^[-?\d.]+$/.test(cleanedString)) {
      const numberValue = parseFloat(cleanedString);
      return numberValue;
    } else {
      return "NaN";
    }
  }

  async function fetchRequest(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

  function findEnvelopeIndex(account, envelopeID) {
    return account.indexOf(account.find(item => item.envelopeID == envelopeID));
  }

  async function addTransaction(accountTitle, envelopeID, description, date, amount, repeating) {
    const account = data[accountTitle];
    const envelopeIndex = findEnvelopeIndex(account, envelopeID);
    const newTransaction = {
      transactionID: data.highestTransactionID + 1,
      transactionDescription: description,
      date: date,
      amount: amount,
      repeating: repeating,
      envelopeID: envelopeID
    };
    function updateFrontEnd() {
      data[accountTitle][envelopeIndex].transactions.push(newTransaction);
      data.highestTransactionID++;
    }

    if (testingMode) {
      updateFrontEnd();
    } else {
      const result = await fetchRequest('../php/create.php', newTransaction);
      if (result) {
        updateFrontEnd();
      }
    }
  }

  async function updateTransaction(accountTitle, envelopeID, transactionID, property, value) {
    const account = data[accountTitle];
    const envelopeIndex = findEnvelopeIndex(account, envelopeID);
    const transactionIndex = account[envelopeIndex].transactions.indexOf(account[envelopeIndex].transactions.find(item => item.transactionID == transactionID));
    const updatedTransaction = {
      transactionID: transactionID,
      property: property,
      value: value
    };
    function updateFrontEnd() {
      data[accountTitle][envelopeIndex].transactions[transactionIndex][property] = value;
    }

    if (testingMode) {
      updateFrontEnd();
    } else {
      const result = await fetchRequest('../php/update.php', updatedTransaction);
      if (result) {
        updateFrontEnd();
      }
    }
  }

  async function deleteTransaction(accountTitle, envelopeID, transactionID) {
    const account = data[accountTitle];
    const envelopeIndex = findEnvelopeIndex(account, envelopeID);
    const transactionIndex = account[envelopeIndex].transactions.indexOf(account[envelopeIndex].transactions.find(item => item.transactionID == transactionID));
    function updateFrontEnd() {
      data[accountTitle][envelopeIndex].transactions.splice(transactionIndex, 1);
      if (transactionID === data.highestTransactionID) {
        data.highestTransactionID--;
      }
    }

    if (testingMode) {
      updateFrontEnd();
    } else {
      const result = await fetchRequest('../php/delete.php', { transactionID: transactionID });
      if (result) {
        updateFrontEnd();
      }
    }
  }

  async function copyTransactions(selectedMonth) {
    showCopyingTransactionsModal = true;
    const previousMonthEnd = new Date(selectedMonth);
    const previousMonthStart = new Date(previousMonthEnd);
    previousMonthStart.setDate(0);
    previousMonthEnd.setDate(previousMonthEnd.getDate() - 1);
    const startStr = previousMonthStart.toISOString().slice(0, 10);
    const endStr = previousMonthEnd.toISOString().slice(0, 10);
    for (const account of accountNames) {
      for (const envelope of data[account]) {
        for (const transaction of envelope.transactions) {
          if (transaction.date >= startStr && transaction.date <= endStr && transaction.repeating) {
            const parts = transaction.date.split('-');
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
            const newDate = `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            await addTransaction(account, envelope.envelopeID, transaction.transactionDescription, newDate, transaction.amount, true);
          }
        }
      }
    }
    showCopyingTransactionsModal = false;
  }

  function toggleSection(section) {
    if (oneSectionAtATime) {
      sectionDisplayed = [section];
    } else {
      if (sectionDisplayed.includes(section)) {
        sectionDisplayed = sectionDisplayed.filter(s => s !== section);
      } else {
        sectionDisplayed = [...sectionDisplayed, section];
      }
    }
  }
</script>

<div id="app-body" class={testingMode ? "testing-mode" : ""}>
  <header>
    <div id="testing-mode-toggle" class="toggle" title="When testing mode is on, no changes will be written to the database">
      <p>Testing Mode</p>
      <Switch bind:state={testingMode} color={'testing-accent'} />
      {#if !canToggleTestingMode}
        <div class="overlay" title="When using placeholder data, testing mode cannot be disabled"></div>
      {/if}
    </div>
    <div class="section-buttons">
      {#each accountNames as account}
        <button class={`account-selector ${sectionDisplayed.includes(account) ? "" : "inactive"}`} style={`--accent: var(--${account}-accent)`} onclick={() => toggleSection(account)}>{account}</button>
      {/each}
    </div>
    <div id="one-section" class="toggle" title="When enabled, only one section will be displayed at a time">
      <p>One At A Time</p>
      <Switch bind:state={oneSectionAtATime} color={`${sectionDisplayed[0]}-accent`} />
    </div>
  </header>
  <main class={sectionDisplayed.length > 1 ? 'multiple-accounts' : ''} style={`--grid-rows: ${maxEnvelopes + 2}`}>
    {#if !dataReady}
      <p>Data is loading</p>
    {:else}
      {#each accountNames as account}
        <section id={account} class="account-section" style={`--accent: var(--${account}-accent); ${sectionDisplayed.includes(account) ? "" : "display: none;"}`}>
          <h1>{account}</h1>
          <EnvelopeGroup
            accountTitle={account}
            envelopes={data[account]}
            {budgetEnvelopeTotals}
            firstTransactionDate={data.firstTransactionDate}
            {todayStr}
            {currencyFormat}
            {numberFormat}
            {addTransaction}
            {updateTransaction}
            {deleteTransaction}
            {copyTransactions}
            {months}
          />
        </section>
      {/each}
    {/if}
    {#if showConnectErrorModal}
      <Modal bind:showModal={showConnectErrorModal}>
        {#snippet modalBody()}
          <p>Could not connect to database. Placeholder Data loaded instead.</p>
        {/snippet}
        {#snippet modalButtons()}
          <button onclick={() => showConnectErrorModal = false}>OK</button>
        {/snippet}
      </Modal>
    {/if}
    {#if showCopyingTransactionsModal}
      <Modal bind:showModal={showCopyingTransactionsModal}>
        {#snippet modalBody()}
          <p>Transactions copying, please wait...</p>
          <div class="row">
            <div class="spinner"></div>
          </div>
        {/snippet}
      </Modal>
    {/if}
  </main>
</div>

<style>
  #app-body {
    color: var(--grey-100);
    margin: 0;
    font-family: "open sans";
    font-size: 1.2rem;
    position: relative;
    border: 5px solid var(--grey-600);
    border-right-width: 0;
    height: 100vh;
    overflow-y: auto;
    &.testing-mode {
      border-color: var(--testing-accent);
      border-right-width: 5px;
    }
  }
  header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    gap: 15px 30px;
    background-color: var(--grey-600);
    padding: 10px;
    box-shadow: 0 0 15px 0 var(--grey-500);
    .toggle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      p {
        margin: 0;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background-color: var(--grey-600);
        opacity: 0.7;
      }
    }
    .section-buttons {
      display: flex;
      align-items: center;
      gap: 15px 30px;
      flex-wrap: wrap;
      .account-selector {
        text-transform: capitalize;
        &.inactive {
          opacity: 0.5;
        }
      }
    }
  }
  main {
    margin-inline: auto;
    padding: 10px 25px 40px;
    display: grid;
    grid-auto-flow: column;
    gap: 30px 50px;
  }
  .account-section {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span var(--grid-rows);
  }
  h1 {
    text-transform: capitalize;
    margin: 0;
  }
</style>
