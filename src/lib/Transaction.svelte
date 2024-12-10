<script>
  let { accountTitle, envelopeID, transaction, currencyFormat, numberFormat, updateTransaction, deleteTransaction } = $props()
  let transactionID = transaction.transactionID;
  let amountStr = $state(currencyFormat(transaction.amount));

  function reformatDate(dateString) {
    // Split the date string into an array [YYYY, MM, DD]
    const [year, month, day] = dateString.split('-');

    // Return the reformatted date string
    return `${month}/${day}/${year}`;
  }

  function updateDescription(event) {
    updateTransaction(accountTitle, envelopeID, transactionID, 'transactionDescription', this.value)
  }

  const toggleRepeat = (event) => updateTransaction(accountTitle, envelopeID, transactionID, 'repeating', !transaction.repeating)
  
  function updateAmountStr(event) {
    const num = numberFormat(this.value)
    updateTransaction(accountTitle, envelopeID, transactionID, 'amount', num)
  }
</script>

<div class="transaction {transaction.repeating ? 'repeating' : ''}">
  <input class="description" type="text" value={transaction.transactionDescription} onblur={updateDescription}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <i class="fa-solid fa-trash delete-transaction" title="delete transaction" onclick={() => deleteTransaction(accountTitle, envelopeID, transactionID)}></i>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <i class="fa-solid fa-repeat toggle-repeating" title="turn repeat on or off for this transaction" onclick={toggleRepeat}></i>
  <input class="date" type="date" value={transaction.date}>
  <input class="amount" type="text" size={amountStr.length - 1} bind:value={amountStr} onblur={updateAmountStr}>
</div>

<style>
  .transaction {
    display: grid;
    grid-template-columns: 1fr 40px 40px 140px 125px;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
    border-bottom: 2px solid var(--accent);
    i {
      text-align: center;
      cursor: pointer;
      color: var(--grey-500);
      opacity: 0;
      transition: 200ms;
      &:hover {
        transform: scale(1.2);
      }
      &:active {
        transition: 100ms;
        transform: scale(0.8);
        color: var(--grey-100);
      }
    }
    .amount {
      justify-self: end;
    }
    &:hover {
      i {
        opacity: 1;
      }
    }
    &.repeating {
      .toggle-repeating {
        color: var(--grey-100);
        opacity: 1;
      }
    }
  }
</style>