<script>
  import Card from "./Card.svelte";
  import Transaction from "./Transaction.svelte";
  let { envelope, allExpanded, currencyFormat, highestTransactionID, setHighestTransactionID } = $props();

  // $: expanded = allExpanded;
  let expanded = $state(allExpanded);

  let transactions = $state(envelope.transactions);

  let totalAmount = transactions.reduce((accumulator, item) => {
    return accumulator + item.amount;
  }, 0)

  function addTransaction() {
    const newHighestTransactionID = highestTransactionID + 1;
    const newTransaction = {
      transactionID: newHighestTransactionID,
      description: '',
      date: '',
      amount: 0,
    }
    transactions.push(newTransaction);
    setHighestTransactionID(newHighestTransactionID);
  }

  function deleteTransaction(ID) {
    transactions = transactions.filter((item) => item.transactionID != ID);
  }
</script>

<Card>
  <div class="envelope {expanded ? 'expanded' : ''}">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
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
          <Transaction {transaction} {currencyFormat} {deleteTransaction}/>
        {/each}
      {:else}
        <p style="text-align: center; font-style: italic;">There are no transactions in this envelope</p>
      {/if}
    </div>
    <button class="add-transaction" onclick={addTransaction}>+ Add Transaction</button>
  </div>
</Card>

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
</style>