<script>
  import Card from "./Card.svelte";
  import Modal from "./Modal.svelte";
  import Transaction from "./Transaction.svelte";
  let { envelope, accountTitle, allExpanded, currencyFormat, numberFormat, addTransaction, updateTransaction, deleteTransaction } = $props();
  let envelopeID = envelope.envelopeID;

  let expanded = $state(allExpanded);

  let transactions = $derived(envelope.transactions);

  let totalAmount = $derived.by(() => transactions.reduce((accumulator, item) => {
    return accumulator + item.amount;
  }, 0))

  let showModal = $state(false);

  // svelte-ignore non_reactive_update
  let [newTransactionDescription, newTransactionAmount] = '';
  // svelte-ignore non_reactive_update
  let newTransactionDate = new Date().toISOString().split('T')[0];
  // svelte-ignore non_reactive_update
  let newTransactionRepeating = false;

  function newTransaction(event) {
    event.preventDefault();
    addTransaction(accountTitle, envelopeID, newTransactionDescription, newTransactionDate, newTransactionAmount, newTransactionRepeating)
    newTransactionDescription = '';
    newTransactionAmount = '';
    newTransactionRepeating = false;
    showModal = false;
  }
</script>

<Card>
  <div class="envelope {expanded ? 'expanded' : ''}">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="heading" onclick={() => expanded = !expanded}>
      <h3>
        {envelope.envelopeTitle}
        <i class="fa-solid fa-chevron-right"></i>
      </h3>
      <span class="amount amount-total">{currencyFormat(totalAmount)}</span>
    </div>
    <div class="envelope-body">
      {#if envelope.envelopeDescription}
        <p>{envelope.envelopeDescription}</p>
      {/if}
      {#if envelope.transactions.length}
        {#each transactions as transaction (transaction.transactionID)}
          <Transaction
            {accountTitle} 
            {envelopeID}
            {transaction}
            {currencyFormat}
            {numberFormat}
            {updateTransaction}
            {deleteTransaction}
          />
        {/each}
      {:else}
        <p style="text-align: center; font-style: italic;">There are no transactions in this envelope</p>
      {/if}
    </div>
    <button class="add-transaction" onclick={() => (showModal = true)}>+ Add Transaction</button>
  </div>
</Card>

{#if showModal}
  <Modal bind:showModal>
    {#snippet body()}
      <p style="text-align: center;">New Transaction</p>
      <form class="new-transaction-form" onsubmit={newTransaction}>
        <label>
          Description:
          <input required type="text" bind:value={newTransactionDescription}>
        </label>
        <label>
          Date:
          <input required type="date" bind:value={newTransactionDate}>
        </label>
        <label>
          Amount:
          <input required type="number" bind:value={newTransactionAmount}>
        </label>
        <label>
          Repeating:
          <input type="checkbox" bind:checked={newTransactionRepeating}>
        </label>
        <button type="submit">Submit</button>
      </form>
    {/snippet}
    <!-- {#snippet confirmBtn()}
      <button>Create Transaction</button>
    {/snippet} -->
  </Modal>
{/if}


<style>
  .envelope {
    position: relative;
    .heading {
      display: grid;
      grid-template-columns: 1fr 125px;
      padding: 20px;
      border-radius: 10px;
      h3 {
        margin: 0;
        i {
          margin-left: 5px;
          transition: 200ms;
        }
      }
      .amount-total {
        padding-right: 4px;
      }
      &:hover {
        background-color: var(--grey-600);
      }
    }
    .envelope-body {
      display: none;
      padding: 0 20px 30px;
      p {
        margin-top: 10px;
      }
    }
    .add-transaction {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.1rem;
      padding: 6px;
      display: none;
    }
    &.expanded {
      .heading {
        border-radius: 10px 10px 0 0;
        i {
          transform: rotate(90deg);
        }
      }
      .envelope-body {
        display: block;
      }
      .add-transaction {
        display: block;
      }
    }
  }
  .new-transaction-form {
    input {
      border: 2px solid var(--grey-100);
    }
  }
  label {
    display: block;
    margin-block: 10px;
  }
</style>