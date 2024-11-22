<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import IncomeCard from './lib/IncomeCard.svelte';
  import EnvelopeGroup from './lib/EnvelopeGroup.svelte';
  import { budget, checkingAccount } from './lib/placeholderData';

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

  let budgetIncome = budget.find(item => item.envelope === "Income").transactions;
  let budgetExpenses = budget.filter((item) => item.envelope !== "Income");
  let checkingIncome = checkingAccount.find(item => item.envelope === "Income").transactions;
  let checkingExpenses = checkingAccount.filter((item) => item.envelope !== "Income");

  let sectionDisplayed = "checking-account";
</script>

<div class="section-buttons">
  <button on:click={() => sectionDisplayed = "budget"}>Budget</button>
  <button on:click={() => sectionDisplayed = "checking-account"}>Checking Account</button>
  <button on:click={() => sectionDisplayed = "savings-account"}>Savings Account</button>
</div>
<main>
  <section class="budget" style={sectionDisplayed == "budget" ? "" : "display: none;"}>
    <h1>Budget</h1>
    <IncomeCard income={budgetIncome} {currencyFormat} />
    <EnvelopeGroup heading={"Expenses"} envelopes={budgetExpenses} {currencyFormat} />
  </section>
  <section id="checking-account" style={sectionDisplayed == "checking-account" ? "" : "display: none;"}>
    <h1>Checking Account</h1>
    <IncomeCard income={checkingIncome} {currencyFormat} />
    <EnvelopeGroup heading={"Expenses"} envelopes={checkingExpenses} {currencyFormat} />
  </section>
  <section class="savings-account" style={sectionDisplayed == "savings-account" ? "" : "display: none;"}>
    Savings section coming soon!
  </section>
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
