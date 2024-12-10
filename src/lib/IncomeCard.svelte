<script>
  import Card from "./Card.svelte";
  let { accountTitle, income, currencyFormat, numberFormat, updateTransaction } = $props();
  let envelopeID = income.envelopeID;
  let transactions = income.transactions;

  function updateAmount(transactionID) {
    // need to figure out how to pass "this" into the function
    const num = numberFormat(this.value)
    if (num === "NaN") {
      alert(`${this.value} is not a valid number`)
    } else {
      updateTransaction(accountTitle, envelopeID, transactionID, 'amount', num)
    }
  }
</script>

<Card>
  <h2>Income</h2>
  <div class="body">
    {#each transactions as item}
      <p>{item.transactionDescription}:</p>
      <input class="amount" type="text" size="9" value={currencyFormat(item.amount)} onblur={() => updateAmount(item.transactionID)}>
    {/each}
  </div>
</Card>

<style>
  h2 {
    text-align: center;
    margin-bottom: 0;
  }
  .body {
    display: grid;
    grid-template-columns: 180px 120px;
    align-items: center;
    padding: 20px 30px;
    font-weight: 500;
  }
  p {
    margin: 0;
  }
  input {
    margin-block: 2px;
  }
</style>