<script>
  import Card from "./Card.svelte";
  import Transaction from "./Transaction.svelte";
  export let expense;
</script>

<Card>
  <div class="envelope">
    <div class="heading">
      <h3>{expense.envelope}</h3>
      <span class="amount-total"></span>
    </div>
    <!-- Need a conditional here -->
    <p>{expense.description}</p>
    {#each expense.transactions as transaction}
      <Transaction {transaction}/>
    {/each}
  </div>
</Card>

<style>
  .envelope {
    .heading {
      display: grid;
      grid-template-columns: 1fr 125px;
    }
    h3 {
      margin: 0;
    }
  }
</style>