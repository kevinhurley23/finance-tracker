<script>
  import Card from "./Card.svelte";
  import Modal from "./Modal.svelte";
  import Transaction from "./Transaction.svelte";
  import { scale, slide } from "svelte/transition";
  let { envelope, budgetEnvelopeTotals, accountTitle, todayStr, dateRange, toggleExpanded, currencyFormat, numberFormat, addTransaction, updateTransaction, deleteTransaction } = $props();

  let envelopeID = envelope.envelopeID;

  let transactionsInRange = $derived.by(() => {
    if (accountTitle === "checking") {
      return envelope.transactions.filter(item => item.date >= dateRange[0] && item.date <= dateRange[1]);
    } else {
      return envelope.transactions;
    }
  });

  let transactions = $derived(transactionsInRange.toSorted((a, b) =>  new Date(a.date).getTime() - new Date(b.date).getTime()));

  let totalAmount = $derived.by(() => transactions.reduce((accumulator, item) => {
    return accumulator + item.amount;
  }, 0))

  let thisEnvelopeBudget = $derived(budgetEnvelopeTotals[envelope.envelopeTitle]);

  let showModal = $state(false);

  // svelte-ignore non_reactive_update
  let [newTransactionDescription, newTransactionAmount] = '';
  // svelte-ignore non_reactive_update
  let newTransactionDate = todayStr;
  // svelte-ignore non_reactive_update
  let newTransactionRepeating = false;

  function newTransaction() {
    if (newTransactionDescription == undefined) {
      alert("Description cannot be empty")
    } else if (newTransactionDate == '') {
      alert("Date cannot be empty")
    } else if (newTransactionAmount == undefined) {
      alert("Amount cannot be empty")
    } else {
      addTransaction(accountTitle, envelopeID, newTransactionDescription, newTransactionDate, newTransactionAmount, newTransactionRepeating)
      newTransactionDescription = '';
      newTransactionAmount = '';
      newTransactionRepeating = false;
      showModal = false;
    }
  }
</script>

<Card>
  <div class="envelope {envelope.expanded ? 'expanded' : ''}">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="heading" onclick={() => toggleExpanded(envelopeID)}>
      <h3>
        {envelope.envelopeTitle}
        <i class="fa-solid fa-chevron-right"></i>
      </h3>
      <span class="amount">
        {#if accountTitle==='checking'}
          Budget: {currencyFormat(thisEnvelopeBudget)}
        {/if}
      </span>
      <span
        class="amount amount-total"
        style={accountTitle === "checking" ? `color: var(--${totalAmount > thisEnvelopeBudget ? 'red' : 'green'});` : ""}
      >
        {currencyFormat(totalAmount)}
      </span>
    </div>
    {#if envelope.expanded}
      <div class="envelope-body" transition:slide>
        {#if envelope.envelopeDescription}
          <p>{envelope.envelopeDescription}</p>
        {/if}
        {#if transactions.length}
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
      <button class="add-transaction" transition:scale onclick={() => (showModal = true)}>+ Add Transaction</button>
    {/if}
  </div>
</Card>

{#if showModal}
  <Modal bind:showModal>
    {#snippet modalBody()}
      <p style="text-align: center;">New Transaction</p>
      <div class="new-transaction-form">
        <p>Description:</p>
        <input type="text" bind:value={newTransactionDescription}>
        <p>Date:</p>
        <input type="date" bind:value={newTransactionDate}>
        <p>Amount:</p>
        <input type="number" bind:value={newTransactionAmount}>
        {#if accountTitle != 'budget'}
          <p>Repeating:</p>
          <input type="checkbox" bind:checked={newTransactionRepeating}>
        {/if}
      </div>
    {/snippet}
    {#snippet modalButtons()}
      <button onclick={newTransaction}>Create Transaction</button>
      <button onclick={() => showModal = false}>Cancel</button>
    {/snippet}
  </Modal>
{/if}


<style>
  .envelope {
    position: relative;
    .heading {
      display: grid;
      grid-template-columns: 1fr 190px 125px;
      gap: 10px;
      padding: 20px;
      border-radius: 10px;
      cursor: pointer;
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
      cursor: pointer;
    }
    &.expanded {
      .heading {
        border-radius: 10px 10px 0 0;
        i {
          transform: rotate(90deg);
        }
      }
    }
  }
  .new-transaction-form {
    display: grid;
    grid-template-columns: 150px 250px;
    align-items: center;
    gap: 10px 15px;
    p {
      margin: 0;
    }
    input[type=checkbox] {
      width: 20px;
      height: 20px;
      box-shadow: none;
    }
  }
</style>