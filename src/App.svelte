<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import EnvelopeGroup from './lib/EnvelopeGroup.svelte';
  import { checkingAccount } from './lib/placeholderData';

  let expenses = checkingAccount["2024-11"].expenses;

  let sectionDisplayed = "checking-account";
</script>

<div class="section-buttons">
  <button on:click={() => sectionDisplayed = "budget"}>Budget</button>
  <button on:click={() => sectionDisplayed = "checking-account"}>Checking Account</button>
  <button on:click={() => sectionDisplayed = "savings-account"}>Savings Account</button>
</div>
<main>
  <section class="budget" style={sectionDisplayed == "budget" ? "" : "display: none;"}>
    Budget section coming soon!
  </section>
  <section id="checking-account" style={sectionDisplayed == "checking-account" ? "" : "display: none;"}>
    <EnvelopeGroup heading={"Expenses"} envelopes={expenses} />
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
