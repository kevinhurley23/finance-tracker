<script>
  import Card from "../ui-components/Card.svelte";
  import Modal from "../ui-components/Modal.svelte";
  import Transaction from "./Transaction.svelte";
  import { todayStr } from '../dates.js'
  import { currencyFormat, addTransaction } from "../functions.js";
  import { scale, slide } from "svelte/transition";
  let { envelope, budgetEnvelopeTotals = "", accountTitle, dateRange, toggleExpanded } = $props();

  let envelopeID = envelope.envelopeID;
  let envelopeTitle = envelope.envelopeTitle;
  let totalAmount = $derived(envelope.totalAmount);
  let showAddTransactionButton = accountTitle === "savings" && envelopeTitle === "Income" ? false : true;
  let addTransactionError = $state("");

  let transactionsInRange = $derived.by(() => {
    if (accountTitle === "checking") {
      return envelope.transactions.filter(item => item.date >= dateRange[0] && item.date <= dateRange[1]);
    } else {
      return envelope.transactions;
    }
  });

  let transactions = $derived(transactionsInRange.toSorted((a, b) =>  new Date(a.date).getTime() - new Date(b.date).getTime()));

  let thisEnvelopeBudget = $derived(budgetEnvelopeTotals[envelopeTitle]);

  let showNewTransactionModal = $state(false);

  // svelte-ignore non_reactive_update
  let [newTransactionDescription, newTransactionAmount] = '';
  // svelte-ignore non_reactive_update
  let newTransactionDate = todayStr;
  // let newTransactionDate = $derived(todayStr >= dateRange[0] && todayStr <= dateRange[1] ? todayStr : dateRange[0]);
  // svelte-ignore non_reactive_update
  let newTransactionRepeating = false;

  function newTransaction() {
    addTransactionError = "";
    if (newTransactionDescription == '' || newTransactionDescription == undefined) {
      addTransactionError = "Description cannot be empty";
    } else if (newTransactionDate == '') {
      addTransactionError = "Date cannot be empty";
    } else if (newTransactionAmount == undefined) {
      addTransactionError = "Amount cannot be empty";
    } else {
      addTransaction(accountTitle, envelopeID, newTransactionDescription, newTransactionDate, newTransactionAmount, newTransactionRepeating)
      newTransactionDescription = '';
      newTransactionAmount = '';
      newTransactionRepeating = false;
      showNewTransactionModal = false;
    }
  }

  function copyTransaction(description, amount, date, repeating) {
    newTransactionDescription = description;
    newTransactionAmount = amount;
    newTransactionDate = date;
    newTransactionRepeating = repeating;
    showNewTransactionModal = true;
  }

  function resetNewTransactionModal() {
    showNewTransactionModal = false;
    addTransactionError = '';
  }
</script>

<Card cardClass={'envelope'}>
  {#snippet cardBody()}
    <div class="envelope {envelope.expanded ? 'expanded' : ''}">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      {#if envelopeTitle == "Income"}
        <h3 class="income-heading text-center">{envelopeTitle}</h3>
      {:else}
        <div class="heading" onclick={() => toggleExpanded(envelopeID)}>
          <h3>
            {envelopeTitle}
            <i class="fa-solid fa-chevron-right"></i>
          </h3>
          {#if accountTitle==='budget'}
            <span>Day of month:</span>
          {:else if accountTitle==='checking' && envelopeTitle != 'Income'}
            <span class="amount">Budget: {currencyFormat(thisEnvelopeBudget)}</span>
          {:else}
            <span></span>
          {/if}
          <span
            class="amount amount-total"
            style={accountTitle === "checking" ? `color: var(--${totalAmount > thisEnvelopeBudget ? 'red' : 'green'});` : ""}
          >
            {currencyFormat(totalAmount)}
          </span>
        </div>
      {/if}
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
                {envelopeTitle}
                {transaction}
                {dateRange}
                {copyTransaction}
              />
            {/each}
          {:else}
            <p style="text-align: center; font-style: italic;">There are no transactions in this envelope</p>
          {/if}
        </div>
        {#if showAddTransactionButton}
          <button class="add-transaction" transition:scale onclick={() => (showNewTransactionModal = true)}>+ Add Transaction</button>
        {/if}
      {/if}
    </div>
  {/snippet}
</Card>

{#if showNewTransactionModal}
  <Modal bind:showModal={showNewTransactionModal}>
    {#snippet modalBody()}
      <p class="text-center"><strong>{envelopeTitle}</strong></p>
      <p class="text-center">New Transaction</p>
      <div class="new-transaction-form">
        <p>Description:</p>
        <input type="text" bind:value={newTransactionDescription}>
        <p>Date:</p>
        <input type="date" bind:value={newTransactionDate}>
        <!-- <input type="date" min={dateRange[0]} max={dateRange[1]} value={newTransactionDate}> -->
        <p>Amount:</p>
        <input type="number" bind:value={newTransactionAmount}>
        {#if accountTitle != 'budget'}
          <p>Repeating:</p>
          <input type="checkbox" bind:checked={newTransactionRepeating}>
        {/if}
      </div>
      {#if addTransactionError}
        <p class="error">{addTransactionError}</p>
      {/if}
    {/snippet}
    {#snippet modalButtons()}
      <button onclick={newTransaction}>Create Transaction</button>
      <button onclick={resetNewTransactionModal}>Cancel</button>
    {/snippet}
  </Modal>
{/if}


<style>
  .envelope {
    position: relative;
    .income-heading {
      margin: 10px 0;
    }
    .heading {
      display: grid;
      grid-template-columns: 1fr 170px 125px;
      gap: 10px;
      padding: 20px;
      border-radius: 10px;
      cursor: pointer;
      i {
        margin-left: 5px;
        transition: 200ms;
      }
      .amount-total {
        padding-right: 4px;
      }
      &:hover {
        background-color: var(--background-secondary);
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