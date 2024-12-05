<script>
  import Card from "./Card.svelte";
  export let income;
  export let currencyFormat;

  let startingBalance = currencyFormat(income.find(item => item.transactionDescription === "Starting Balance")?.amount);
  let bryant = currencyFormat(income.find(item => item.transactionDescription === "Bryant")?.amount);
  let takeda = currencyFormat(income.find(item => item.transactionDescription === "Takeda")?.amount);
</script>

<Card>
  <h2>Income</h2>
  <div class="row body">
    {#if startingBalance}
      <div class="starting-balance">
        <p style="margin-block: 9px; text-align: right;">Starting Balance:</p>
        <input class="amount" type="text" size="13" value={startingBalance}>
      </div>
    {/if}
    <div>
      <p>Bryant: <input class="amount" type="text" size="7" value={bryant}></p>
      <p>Takeda: <input class="amount" type="text" size="7" value={takeda}></p>
    </div>
  </div>
</Card>

<style>
  h2 {
    text-align: center;
    margin-bottom: 0;
  }
  .row {
    display: flex;
    gap: 15px;
    &:not(:has(.starting-balance)) {
      justify-content: center;
    }
  }
  .body {
    gap: 40px;
    padding: 20px 30px;
    font-weight: 500;
  }
  p {
    margin-block: 5px;
  }
</style>