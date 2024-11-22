<script>
  import Card from "./Card.svelte";
  export let income;
  export let currencyFormat;

  let startingBalance = currencyFormat(income.find(item => item.description === "Starting Balance")?.amount);
  let bryant = currencyFormat(income.find(item => item.description === "Bryant")?.amount);
  let takeda = currencyFormat(income.find(item => item.description === "Takeda")?.amount);
</script>

<Card>
  <h2>Income</h2>
  <div class="row body">
    {#if startingBalance}
      <div>
        <p>Starting Balance:</p>
        <p class="currency">{startingBalance}</p>
      </div>
    {/if}
    <div>
      <p class="row">Bryant: <span class="currency">{bryant}</span></p>
      <p class="row">Takeda: <span class="currency">{takeda}</span></p>
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
  }
  .body {
    gap: 40px;
    padding: 20px 30px;
    font-weight: 500;
  }
  p {
    margin-block: 5px;
  }
  .currency {
    width: 100%;
    text-align: right;
  }
</style>