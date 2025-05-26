<script>
  import { currencyFormat, dateFormat, updateTransaction } from "../functions.js";
  let { selectedAccount = $bindable(), searchTransactions, exactMatch = $bindable() } = $props();

  let findText = $state("");
  let replaceText = $state("");
  let descriptionsToUpdate = $derived(searchTransactions(findText));

  async function applyReplacements() {
    if (!findText || !replaceText) return;

    await descriptionsToUpdate.forEach(envelope => {
      envelope.transactions.forEach(transaction => updateTransaction(selectedAccount, transaction.envelopeID, transaction.transactionID, 'transactionDescription', replaceText));
    })
  }
</script>

<div class="analysis-section">
  <h2>Find and Replace</h2>
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
      Find:
      <input type="text" bind:value={findText} size=30 placeholder="Search transaction descriptions...">
    </label>
    <label>
      Replace with:
      <input type="text" bind:value={replaceText} size=30 placeholder="New description...">
    </label>
    <label class="checkbox-label">
      Exact Match:
      <input type="checkbox" bind:checked={exactMatch}>
    </label>
    <button 
      disabled={!findText || !replaceText} 
      onclick={applyReplacements}
      class="replace-button">
      Apply Changes
    </button>
  </div>
  <div class="search-results">
    {#if findText}
      {#each descriptionsToUpdate as result}
        <div class="search-group">
          <h3>{result.envelopeTitle}</h3>
          <table>
            <thead>
              <tr>
                <th>Current Description</th>
                <th>New Description</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {#each result.transactions as transaction}
                <tr>
                  <td>{transaction.transactionDescription}</td>
                  <td class="new-description">{replaceText || '(no replacement text)'}</td>
                  <td>{dateFormat(transaction.date)}</td>
                  <td>{currencyFormat(transaction.amount)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/each}
    {/if}
  </div>
</div>