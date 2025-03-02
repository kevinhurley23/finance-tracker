<script>
  import Card from "./Card.svelte";
  import { currencyFormat, numberFormat, updateTransaction } from "./functions.js";
  let { accountTitle, assets, dateRange, totalExpenses } = $props();
  let envelopeID = assets.envelopeID;

  let transactions = $derived.by(() => {
    if (dateRange) {
      return assets.transactions.filter(item => item.date >= dateRange[0] && item.date <= dateRange[1]);
    } else {
      return assets.transactions;
    }
  });

  let balance = $derived(transactions.find(item => item.transactionDescription == "Starting Balance" || item.transactionDescription == "Balance"));
  let bryant = $derived(transactions.find(item => item.transactionDescription == "Bryant"));
  let takeda = $derived(transactions.find(item => item.transactionDescription == "Takeda"));
  let totalIncome = $derived(bryant ? bryant.amount + takeda.amount : false);
  let totalAssets = $derived((balance && bryant) ? balance.amount + totalIncome : false);
  let totalExpensesLabel = accountTitle === "savings" ? "Envelopes Total" : "Total Expenses";

  function updateAmount() {
    const num = numberFormat(this.value)
    if (num === "NaN") {
      alert(`${this.value} is not a valid number`)
    } else {
      updateTransaction(accountTitle, envelopeID, this.id, 'amount', num)
    }
  }
</script>

{#snippet line({label = '', ID = '', value = 0, editable = false, color = false} = {})}
	<p>{label}:</p>
  {#if editable}
    <input id={ID} class="amount" type="text" size="9" value={currencyFormat(value)} onblur={updateAmount}>
  {:else}
    {#if color}
      <p class="amount" style={`color: var(--${value > 0 ? 'green' : 'red'});`}>{currencyFormat(value)}</p>
    {:else}
      <p class="amount">{currencyFormat(value)}</p>
    {/if}
  {/if}
{/snippet}

<Card cardClass={'income-card'}>
  {#snippet cardBody()}
    <h2>Summary</h2>
    <div class="body">
      {#each transactions as transaction}
        {@render line({
          label: transaction.transactionDescription,
          ID: transaction.transactionID,
          value: transaction.amount,
          editable: true
        })}
      {/each}
      {#if totalIncome}
        {@render line({
          label: "Total Income",
          value: totalIncome
        })}
      {/if}
      {#if totalAssets}
        {@render line({
          label: "Total Assets",
          value: totalAssets
        })}
      {/if}
      {@render line({
        label: totalExpensesLabel,
        value: totalExpenses
      })}
      {#if totalIncome}
        {@render line({
          label: "Income minus Expenses",
          value: totalIncome - totalExpenses,
          color: true
        })}
      {/if}
      {#if accountTitle === "checking"}
        {@render line({
          label: "Assets minus Expenses",
          value: totalAssets - totalExpenses,
          color: true
        })}
      {:else if accountTitle === "savings"}
        {@render line({
          label: "Extra in savings",
          value: balance.amount - totalExpenses,
          color: true
        })}
      {/if}
    </div>
  {/snippet}
</Card>

<style>
  h2 {
    text-align: center;
    margin-bottom: 0;
  }
  .body {
    display: grid;
    grid-template-columns: 1fr 120px;
    gap: 0 10px;
    align-items: center;
    padding: 20px 30px;
  }
  p {
    margin: 0;
    &.amount {
      margin-block: 6px;
      padding-inline: 4px;
    }
  }
  input {
    margin-block: 2px;
  }
</style>