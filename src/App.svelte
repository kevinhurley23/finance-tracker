<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import IncomeCard from './lib/IncomeCard.svelte';
  import EnvelopeGroup from './lib/EnvelopeGroup.svelte';

  import { placeholderData } from './lib/placeholderData.svelte.js';
  let data = $state(placeholderData);
  let dataReady = $state(true);

  // let data = $state();
  // let dataReady = $state(false);
  let sectionDisplayed = $state("checking-account");

  // async function fetchData() {
  //   const response = await fetch('../php/read.php');
  //   data = await response.json();
  //   dataReady = true;
  // }
  // fetchData();

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
  const numberValue = parseFloat(cleanedString);
  return numberValue;
}
  
  function setHighestTransactionID(newID) {
    data.highestTransactionID = newID;
  }

  function addTransaction() {
    // const newHighestTransactionID = highestTransactionID + 1;
    // const newTransaction = {
    //   transactionID: newHighestTransactionID,
    //   description: '',
    //   date: '',
    //   amount: 0,
    // }
    // transactions.push(newTransaction);
    // setHighestTransactionID(newHighestTransactionID);
  }

  function deleteTransaction(accountTitle, envelopeID, transactionID) {
    const account = data[accountTitle];
    const envelopeIndex = account.indexOf(account.find(item => item.envelopeID == envelopeID));
    const transactionIndex = account[envelopeIndex].transactions.indexOf(account[envelopeIndex].transactions.find(item => item.transactionID == transactionID));
    data[accountTitle][envelopeIndex].transactions.splice(transactionIndex, 1);
  }
</script>

<div class="section-buttons">
  <button onclick={() => sectionDisplayed = "budget"}>Budget</button>
  <button onclick={() => sectionDisplayed = "checking-account"}>Checking Account</button>
  <button onclick={() => sectionDisplayed = "savings-account"}>Savings Account</button>
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
        accountTitle={"budget"}
        envelopes={data.budget.filter((item) => item.envelopeTitle !== "Income")}
        {currencyFormat}
        {numberFormat}
        {addTransaction}
        {deleteTransaction}
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
        accountTitle={"checking"}
        envelopes={data.checking.filter((item) => item.envelopeTitle !== "Income")}
        {currencyFormat}
        {numberFormat}
        {addTransaction}
        {deleteTransaction}
      />
    </section>
    <section class="savings-account" style={sectionDisplayed == "savings-account" ? "" : "display: none;"}>
      <h1>Savings Account</h1>
      <EnvelopeGroup
        heading={"Envelopes"}
        accountTitle={"savings"}
        envelopes={data.savings.filter((item) => item.envelopeTitle !== "Income")}
        {currencyFormat}
        {numberFormat}
        {addTransaction}
        {deleteTransaction}
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
