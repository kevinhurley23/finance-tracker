<script>
  import { currencyFormat, dateFormat } from "../functions.js";
  let { selectedAccount = $bindable(), searchTransactions, exactMatch = $bindable(), groupByEnvelope = $bindable() } = $props();

  let searchQuery = $state("");
</script>

<div class="analysis-section">
  <h2>Search Transactions</h2>
  <div class="controls">
    <label>
      Select Account:
      <select bind:value={selectedAccount} class="capitalize">
        {#each ["checking", "savings"] as account}
          <option value={account}>{account}</option>
        {/each}
      </select>
    </label>
    <label>
      Search Description:
      <input type="text" bind:value={searchQuery} size=30 placeholder="Enter transaction description...">
    </label>
    <label class="checkbox-label">
      Exact Match:
      <input type="checkbox" bind:checked={exactMatch}>
    </label>
    <label class="checkbox-label">
      Group by Envelope:
      <input type="checkbox" bind:checked={groupByEnvelope}>
    </label>
  </div>
  <div class="search-results">
    {#if searchQuery}
      {#each searchTransactions(searchQuery) as result}
        <div class="search-group">
          <h3>{result.envelopeTitle}</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {#each result.transactions as transaction}
                <tr>
                  <td>{transaction.transactionDescription}</td>
                  <td>{dateFormat(transaction.date)}</td>
                  <td>{currencyFormat(transaction.amount)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          <p class="average">
            Average Amount: {currencyFormat(result.transactions.reduce((sum, t) => sum + t.amount, 0) / result.transactions.length)}
          </p>
        </div>
      {/each}
    {/if}
  </div>
</div>