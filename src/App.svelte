<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import IncomeCard from './lib/IncomeCard.svelte';
  import EnvelopeGroup from './lib/EnvelopeGroup.svelte';

  const accountNames = ["budget", "checking", "savings"];
  let sectionDisplayed = $state("checking");
  let date = new Date();
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let day = String(date.getDate()).padStart(2, '0');
  let today = `${year}-${month}-${day}`;
  
  // import { placeholderData } from './lib/placeholderData.svelte.js';
  // let data = $state(placeholderData);
  // let dataReady = $state(true);

  let data = $state();
  let dataReady = $state(false);
  async function fetchData() {
    const response = await fetch('../php/read.php');
    data = await response.json();
    dataReady = true;
  }
  fetchData();

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
    transactionDescription: description,
    date: date,
    amount: amount,
    repeating: repeating,
    envelopeID: envelopeID
  };

  const result = await fetchRequest('../php/create.php', newTransaction);
  if (result) {
    data[accountTitle][envelopeIndex].transactions.push(newTransaction);
    data.highestTransactionID++;
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

  const result = await fetchRequest('../php/update.php', updatedTransaction);
  if (result) {
    data[accountTitle][envelopeIndex].transactions[transactionIndex][property] = value;
  }
}

async function deleteTransaction(accountTitle, envelopeID, transactionID) {
  const account = data[accountTitle];
  const envelopeIndex = findEnvelopeIndex(account, envelopeID);
  const transactionIndex = account[envelopeIndex].transactions.indexOf(account[envelopeIndex].transactions.find(item => item.transactionID == transactionID));

  const result = await fetchRequest('../php/delete.php', { transactionID: transactionID });
  if (result) {
    data[accountTitle][envelopeIndex].transactions.splice(transactionIndex, 1);
    if (transactionID === data.highestTransactionID) {
      data.highestTransactionID--;
    }
  }
}
</script>

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
        <IncomeCard
          accountTitle={account}
          income={data[account].find(item => item.envelopeTitle === "Income")}
          {currencyFormat}
          {numberFormat}
          {updateTransaction}
        />
        <EnvelopeGroup
          accountTitle={account}
          envelopes={data[account].filter((item) => item.envelopeTitle !== "Income")}
          {today}
          {currencyFormat}
          {numberFormat}
          {addTransaction}
          {updateTransaction}
          {deleteTransaction}
        />
      </section>
    {/each}
  {/if}
</main>

<style>
  .section-buttons {
    display: flex;
    justify-content: center;
    gap: 15px 30px;
    flex-wrap: wrap;
    margin-bottom: 40px;
    button {
      text-transform: capitalize;
    }
  }
  h1 {
    text-transform: capitalize;
  }
</style>
