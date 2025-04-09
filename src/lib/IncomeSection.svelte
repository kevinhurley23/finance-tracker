<script>
  import Card from "./Card.svelte";
  import Envelope from "./Envelope.svelte";
  import { currencyFormat, numberFormat, updateTransaction } from "./functions.js";
  let { accountTitle, assets, dateRange, latestTransaction, totalExpenses, toggleExpanded } = $props();
  let envelopeID = assets.envelopeID;

  let transactions = $derived.by(() => {
    if (dateRange) {
      return assets.transactions.filter(item => item.date >= dateRange[0] && item.date <= dateRange[1]);
    } else {
      return assets.transactions;
    }
  });

  let balance = $derived(transactions.find(item => item.transactionDescription == "Starting Balance" || item.transactionDescription == "Balance"));
  let income = $derived(transactions.filter(item => item != balance));
  let totalIncome = $derived(income.reduce((sum, item) => sum + item.amount, 0));
  let totalAssets = $derived((balance && income.length) ? balance.amount + totalIncome : false);
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

<div class="income-section">
  {#if accountTitle != "savings"}
    <Envelope
      envelope={assets}
      {accountTitle}
      {dateRange}
      {toggleExpanded}
    />
  {/if}
  <Card cardClass={"summary-card"}>
    {#snippet cardBody()}
      <h3 class="text-center">Summary</h3>
      <div class="summary-body">
        {#if accountTitle === "savings"}
          {@render line({
            label: "Balance",
            ID: balance.transactionID,
            value: balance.amount,
            editable: true
          })}
        {/if}
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
        <p>Most Recent Transaction: </p>
        <p class="amount">{latestTransaction}</p>
      </div>
    {/snippet}
  </Card>
</div>

<style>
  .income-section {
    display: grid;
    gap: 30px;
    max-width: var(--envelope-width);
    margin-inline: auto;
  }
  h3 {
    margin-bottom: 0.5em;
  }
  .summary-body {
    display: grid;
    grid-template-columns: 1fr 120px;
    gap: 0 10px;
    align-items: center;
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