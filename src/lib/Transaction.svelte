<script>
  export let transaction;

  function reformatDate(dateString) {
    // Split the date string into an array [YYYY, MM, DD]
    const [year, month, day] = dateString.split('-');

    // Return the reformatted date string
    return `${month}/${day}/${year}`;
}
  
  function currencyFormat(amount) {
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
</script>

<div class="transaction" data-amount={transaction.amount}>
  <span class="description">{transaction.description}</span>
  <span class="date">{reformatDate(transaction.date)}</span>
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