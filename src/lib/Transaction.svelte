<script>
  import Modal from "./Modal.svelte";
  import { slide } from "svelte/transition";
  let { accountTitle, envelopeID, transaction, currencyFormat, numberFormat, updateTransaction, deleteTransaction } = $props()
  const transactionID = transaction.transactionID;
  const canDelete = transaction.transactionDescription == "Starting Balance" ? false : true;
  let amountStr = $state(currencyFormat(transaction.amount));
  let showDeleteTransactionModal = $state(false);

  let dayOfMonth = transaction.date.split("-")[2];
  if (dayOfMonth == "01") {
    dayOfMonth = "1st";
  } else if (dayOfMonth == "02") {
    dayOfMonth = "2nd";
  } else if (dayOfMonth == "03") {
    dayOfMonth = "3rd";
  } else {
    dayOfMonth = dayOfMonth.replace(/^0+/, '');
    dayOfMonth = dayOfMonth + "th";
  }

  function updateDescription() {
    updateTransaction(accountTitle, envelopeID, transactionID, 'transactionDescription', this.value)
  }

  const toggleRepeat = () => updateTransaction(accountTitle, envelopeID, transactionID, 'repeating', !transaction.repeating)

  function updateDate() {
    updateTransaction(accountTitle, envelopeID, transactionID, 'date', this.value)
  }
  
  function updateAmount() {
    const num = numberFormat(this.value)
    if (num === "NaN") {
      alert(`${this.value} is not a valid number`)
    } else {
      updateTransaction(accountTitle, envelopeID, transactionID, 'amount', num)
    }
  }
</script>

<div id={transaction.transactionID} class="transaction {transaction.repeating ? 'repeating' : ''}" transition:slide={{duration: 50}}>
  <input class="description" type="text" value={transaction.transactionDescription} onblur={updateDescription}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  {#if canDelete}
    <i class="fa-solid fa-trash delete-transaction" title="delete transaction" onclick={() => (showDeleteTransactionModal = true)}></i>
  {:else}
    <div></div>
  {/if}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  {#if accountTitle != 'budget'}
    <i class="fa-solid fa-repeat toggle-repeating" title="turn repeat on or off for this transaction" onclick={toggleRepeat}></i>
  {:else}
    <div></div>
  {/if}
  {#if accountTitle == 'budget'}
    <span>{dayOfMonth}</span>
  {:else}
    <input class="date" type="date" value={transaction.date} onchange={updateDate}>
  {/if}
  <input class="amount" type="text" size="8" value={amountStr} onblur={updateAmount}>
</div>

{#if showDeleteTransactionModal}
  <Modal bind:showModal={showDeleteTransactionModal}>
    {#snippet modalBody()}
      <p>Are you sure you want to delete this transaction?</p>
      <div class="row">
        <span>{transaction.transactionDescription}</span>
        <span>{transaction.date}</span>
        <span>{amountStr}</span>
      </div>
    {/snippet}
    {#snippet modalButtons()}
      <button onclick={() => deleteTransaction(accountTitle, envelopeID, transactionID)}>Delete</button>
      <button onclick={() => showDeleteTransactionModal = false}>Cancel</button>
    {/snippet}
  </Modal>
{/if}

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
        color: var(--accent);
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
  }
  .repeating {
    .toggle-repeating {
      color: var(--grey-100);
      opacity: 1;
    }
  }
</style>