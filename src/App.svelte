<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import IncomeCard from './lib/IncomeCard.svelte';
  import EnvelopeGroup from './lib/EnvelopeGroup.svelte';
  // import { data } from './lib/placeholderData.svelte.js';

  let data = $state();
  let dataReady = $state(false);
  let sectionDisplayed = $state("checking-account");

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
      // Convert the amount to a string and split it into integer and decimal parts
      let [integerPart, decimalPart] = amount.toString().split('.');

      // Add commas to the integer part
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      // If there's no decimal part, add ".00"
      if (!decimalPart) {
          decimalPart = '00';
      }

      // Combine the integer and decimal parts with a dollar sign
      const formattedAmount = `$${integerPart}.${decimalPart}`;

      return formattedAmount;
    }
  }
  
  function setHighestTransactionID(newID) {
    data.highestTransactionID = newID;
  }

  function deleteTransaction(accountTitle, envelopeID, transaction) {
    const account = data[accountTitle];
    const envelope = account.find(item => item.envelopeID == envelopeID);
    console.log(account)
    console.log(envelope)

    // data[account][envelope].transactions = data[account][envelope].transactions.filter(item => item.transactionID !== transaction);
  }
</script>

<div class="section-buttons">
  <button onclick={() => sectionDisplayed = "budget"}>Budget</button>
  <button onclick={() => sectionDisplayed = "checking-account"}>Checking Account</button>
  <button onclick={() => sectionDisplayed = "savings-account"}>Savings Account</button>
  <button onclick={() => deleteTransaction('budget', 2, 4)}>Delete</button>
</div>
<main>
  {#if !dataReady}
    <p>Data is loading</p>
  {:else}
    <section class="budget" style={sectionDisplayed == "budget" ? "" : "display: none;"}>
      <h1>Budget</h1>
      <IncomeCard
        income={data.budget.find(item => item.envelopeTitle === "Income").transactions}
        {currencyFormat}
      />
      <EnvelopeGroup
        heading={"Expenses"}
        envelopes={data.budget.filter((item) => item.envelopeTitle !== "Income")}
        {currencyFormat}
      />
    </section>
    <section id="checking-account" style={sectionDisplayed == "checking-account" ? "" : "display: none;"}>
      <h1>Checking Account</h1>
      <IncomeCard
        income={data.checking.find(item => item.envelopeTitle === "Income").transactions}
        {currencyFormat}
      />
      <EnvelopeGroup
        heading={"Expenses"}
        envelopes={data.checking.filter((item) => item.envelopeTitle !== "Income")}
        {currencyFormat}
      />
    </section>
    <section class="savings-account" style={sectionDisplayed == "savings-account" ? "" : "display: none;"}>
      <h1>Savings Account</h1>
      <EnvelopeGroup
        heading={"Envelopes"}
        envelopes={data.savings.filter((item) => item.envelopeTitle !== "Income")}
        {currencyFormat}
      />
    </section>
  {/if}
</main>

<style>
  .section-buttons {
    display: flex;
    justify-content: center;
    gap: 15px 30px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }
</style>
