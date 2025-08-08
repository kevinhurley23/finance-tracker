<script>
  import Modal from "../ui-components/Modal.svelte";
  import { slide } from "svelte/transition";
  import { todayStr } from "../dates";
  import { accountNames, accountsAndEnvelopes } from "../data.svelte.js";
  import { currencyFormat, numberFormat, dateObjToISO, dateISOToObj, dateISOToDisplay, addTransaction, updateTransaction, deleteTransaction } from "../functions.js";

  let { accountTitle, envelopeID, envelopeTitle, transaction, dateRange, copyTransaction } = $props()
  const transactionID = transaction.transactionID;
  const description = transaction.transactionDescription;
  const date = transaction.date;
  const amount = transaction.amount;
  const canModify = description == "Starting Balance" || description == "Balance" ? false : true;
  let amountStr = $state(currencyFormat(amount));
  let showMoveTransactionModal = $state(false);
  let showDeleteTransactionModal = $state(false);
  let newAccount = $state(accountTitle);
  let newEnvelopeID = $state(envelopeID);
  let moveTransactionError = $state("");

  // svelte-ignore non_reactive_update
  let dayOfMonth = date.split("-")[2];
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

  async function moveTransaction() {
    moveTransactionError = "";
    if (!(newEnvelopeID in accountsAndEnvelopes[newAccount])) {
      moveTransactionError = "Invalid account/envelope combination. Did you select an option in the Envelope dropdown?";
      return;
    }
    if (newEnvelopeID === envelopeID) {
      moveTransactionError = "Transaction is already in the selected envelope. Did you select an option in the Envelope dropdown?";
      return;
    }

    const success = await addTransaction(newAccount, newEnvelopeID, description, date, amount, transaction.repeating);
    if (success) {
      deleteTransaction(accountTitle, envelopeID, transactionID);
      showMoveTransactionModal = false;
    } else {
      moveTransactionError = "Failed to move transaction. Please try again.";
    }
  }

</script>

<div id={transaction.transactionID} class="transaction {transaction.repeating ? 'repeating' : ''}" transition:slide={{duration: 50}}>
  <!-- Description -->
  {#if canModify}
    <input class="description" type="text" value={description} onblur={updateDescription}>
  {:else}
    <p class="description">{description}</p>
  {/if}

  <!-- Icons -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  {#if accountTitle != 'budget' && canModify}
    <i class="fa-solid fa-repeat toggle-repeating" title="Turn repeat on or off for this transaction" onclick={toggleRepeat}></i>
  {/if}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  {#if canModify}
    <i class="fa-solid fa-clone" title="Copy transaction" onclick={() => copyTransaction(description, amount, todayStr, transaction.repeating)}></i>
  {/if}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  {#if canModify && envelopeTitle != 'Income'}
    <i class="fa-solid fa-arrows-up-down" title="Move transaction" onclick={() => (showMoveTransactionModal = true)}></i>
  {/if}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  {#if canModify}
    <i class="fa-solid fa-trash delete-transaction" title="Delete transaction" onclick={() => (showDeleteTransactionModal = true)}></i>
  {/if}

  <!-- Date -->
  {#if accountTitle == 'budget'}
    <p class="date day-of-month">{dayOfMonth}</p>
  {:else if accountTitle === "savings" && description === "Balance"}
    <div></div>
  {:else if !canModify}
    <p class="date plain-text-date">{dateISOToDisplay(date)}</p>
  {:else}
    <input class="date" type="date" value={date} onblur={updateDate}>
  {/if}

  <!-- Amount -->
  <input class="amount" type="text" size="9" value={amountStr} onblur={updateAmount}>
</div>

{#if showMoveTransactionModal}
  <Modal bind:showModal={showMoveTransactionModal}>
    {#snippet modalBody()}
      <p class="text-center">Move <strong>{description}</strong> to new account or envelope</p>
      <div class="move-transaction-form">
        <label for="account-select">Choose Account:</label>
        <select id="account-select" bind:value={newAccount} style="text-transform: capitalize;">
          {#each accountNames as account}
            <option value={account}>{account}</option>
          {/each}
        </select>
        <label for="envelope-select">Choose Envelope:</label>
        <select id="envelope-select" bind:value={newEnvelopeID} style="text-transform: capitalize;">
          {#each Object.entries(accountsAndEnvelopes[newAccount]) as [id, title]}
            {#if title != 'Income'}
              <option value={id}>{title}</option>
            {/if}
          {/each}
        </select>
      </div>
      {#if moveTransactionError}
        <p class="error">{moveTransactionError}</p>
      {/if}
    {/snippet}
    {#snippet modalButtons()}
      <button onclick={moveTransaction}>Move</button>
      <button onclick={() => showMoveTransactionModal = false}>Cancel</button>
    {/snippet}
  </Modal>
{/if}
{#if showDeleteTransactionModal}
  <Modal bind:showModal={showDeleteTransactionModal}>
    {#snippet modalBody()}
      <p>Are you sure you want to delete this transaction?</p>
      <div class="row">
        <span>{description}</span>
        <span>{date}</span>
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
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 4px 0;
    border-bottom: 2px solid var(--text-primary);
    position: relative;
    p {
      margin: 0.3em 4px;
    }
    .description {
      flex-grow: 1;
      &:focus-within {
        position: absolute;
        width: 100%;
      }
    }
    .date {
      width: 165px;
      &.day-of-month {
        width: 42px;
      }
    }
    .plain-text-date {
      letter-spacing: 0.5px;
      padding-left: 10px;
    }
    i {
      text-align: center;
      cursor: pointer;
      color: var(--text-secondary);
      opacity: 0;
      transition: 200ms;
      &:hover {
        transform: scale(1.2);
        color: var(--accent);
      }
      &:active {
        transition: 100ms;
        transform: scale(0.8);
        color: var(--text-primary);
      }
    }
    &:has(.description:focus-within) i {
      display: none;
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
      color: var(--text-primary);
      opacity: 1;
    }
  }
  .move-transaction-form {
    display: grid;
    grid-template-columns: 170px 1fr;
    align-items: center;
    gap: 10px 15px;
    p {
      margin: 0;
    }
  }
</style>