<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import EnvelopeGroup from './lib/EnvelopeGroup.svelte';
  import Switch from './lib/Switch.svelte';
  import Modal from './lib/Modal.svelte';
  import { placeholderData } from './lib/placeholderData.svelte.js';

  const accountNames = ["budget", "checking", "savings"];
  let sectionDisplayed = $state("checking");
  let testingMode = $state(false);
  let canToggleTestingMode = $state(true);
  let showModal = $state(false);

  let todayObj = new Date();
  let year = todayObj.getFullYear();
  let month = String(todayObj.getMonth() + 1).padStart(2, '0');
  let day = String(todayObj.getDate()).padStart(2, '0');
  let todayStr = `${year}-${month}-${day}`;

  let data = $state();
  let dataReady = $state(false);
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
      showModal = true;
      testingMode = true;
      canToggleTestingMode = false;
      setTimeout(() => showModal = false, 2000);
    }
    dataReady = true;
  }
  fetchData();

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
</script>

<div id="app-body" style={testingMode ? 'border-color: var(--testing-accent)' : ''}>
  <!-- {#if canToggleTestingMode} -->
    <div id="testing-mode-toggle" title="When testing mode is on, no changes will be written to the database">
      <p>Testing Mode</p>
      <Switch bind:state={testingMode} />
      {#if !canToggleTestingMode}
        <div class="overlay" title="When using placeholder data, testing mode cannot be disabled"></div>
      {/if}
    </div>
  <!-- {/if} -->
  <div class="section-buttons">
    {#each accountNames as account}
      <button style={`--accent: var(--${account}-accent)`} onclick={() => sectionDisplayed = account}>{account}</button>
    {/each}
  </div>
  <main style={`--accent: var(--${sectionDisplayed}-accent)`}>
    {#if !dataReady}
      <p>Data is loading</p>
    {:else}
      {#each accountNames as account}
        <section id={account} style={sectionDisplayed == account ? "" : "display: none;"}>
          <h1>{account}</h1>
          <EnvelopeGroup
            accountTitle={account}
            envelopes={data[account]}
            {budgetEnvelopeTotals}
            {todayStr}
            {currencyFormat}
            {numberFormat}
            {addTransaction}
            {updateTransaction}
            {deleteTransaction}
          />
        </section>
      {/each}
    {/if}
    {#if showModal}
      <Modal bind:showModal>
        {#snippet modalBody()}
          <p>Could not connect to database. Placeholder Data loaded instead.</p>
        {/snippet}
        {#snippet modalButtons()}
          <button onclick={() => showModal = false}>OK</button>
        {/snippet}
      </Modal>
    {/if}
  </main>
</div>

<style>
  #app-body {
    background-color: var(--grey-600);
    color: var(--grey-100);
    margin: 0;
    padding-bottom: 30px;
    font-family: "open sans";
    font-size: 1.2rem;
    position: relative;
    border: 5px solid var(--grey-600);
  }
  #testing-mode-toggle {
    position: fixed;
    width: fit-content;
    top: 20px;
    left: 88%;
    z-index: 20;
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
    position: sticky;
    top: 0;
    z-index: 10;
    width: calc(100% - 10px);
    display: flex;
    justify-content: center;
    gap: 15px 30px;
    flex-wrap: wrap;
    background-color: var(--grey-600);
    padding: 25px;
    button {
      text-transform: capitalize;
    }
  }
  h1 {
    text-transform: capitalize;
  }
</style>
