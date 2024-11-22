<script>
  export let transaction;
  export let currencyFormat;

  function reformatDate(dateString) {
    // Split the date string into an array [YYYY, MM, DD]
    const [year, month, day] = dateString.split('-');

    // Return the reformatted date string
    return `${month}/${day}/${year}`;
}
</script>

<div class="transaction" data-amount={transaction.amount}>
  <span class="description">{transaction.description}</span>
  <span class="date">{transaction.date ? reformatDate(transaction.date) : ''}</span>
  <span class="amount">{currencyFormat(transaction.amount)}</span>
</div>

<style>
  .transaction {
    display: grid;
    grid-template-columns: 1fr 125px 125px;
    padding: 8px 0;
    border-bottom: 2px solid var(--accent);
    .amount {
      text-align: right;
    }
  }
</style>