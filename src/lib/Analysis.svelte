<script>
  import { UIstate, data, months } from "./data.svelte.js";
  import Chart from "chart.js/auto";
  import { currencyFormat, dateFormat, formatMonthYear, updateTransaction } from "./functions.js";

  let selectedEnvelope = $state("");
  let selectedAccount = $state("checking");
  let searchQuery = $state("");
  let selectedMonths = $state([]);
  let findText = $state("");
  let replaceText = $state("");
  let exactMatch = $state(false);
  let groupByEnvelope = $state(true);
  let descriptionsToUpdate = $derived(searchTransactions(findText, exactMatch));

  // Initialize selected months when data is ready
  $effect(() => {
    if (data.ready && months.length > 0) {
      selectedMonths = [months[0], months[months.length - 1]];
    }
  });

  // Canvas references for charts
  let singleEnvelopeChart;
  let pieChart;
  let stackedPercentChart;
  let stackedAmountChart;
  let incomeExpensesChart;

  // Chart colors array
  const chartColors = [
    "#FF6384", // Red
    "#36A2EB", // Blue
    "#FFCE56", // Yellow
    "#4BC0C0", // Teal
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#32CD32", // Lime
    "#BA55D3", // Medium Orchid
    "#20B2AA", // Light Sea Green
    "#FF4500", // Orange Red
    "#1E90FF", // Dodger Blue
    "#FFD700", // Gold
    "#8B4513", // Saddle Brown
    "#48D1CC", // Medium Turquoise
    "#C71585", // Medium Violet Red
    "#00FA9A"  // Medium Spring Green
  ];

  // Chart configurations
  const tooltipStyles = {
    bodyFont: {
      size: 14
    },
    titleFont: {
      size: 14
    },
    padding: 12,
    boxPadding: 6
  };

  function getMonthlyEnvelopeData(envelopeID) {
    const monthData = {};
    months.forEach(month => monthData[month] = 0);
    
    const envelope = data[selectedAccount].find(env => env.envelopeID === parseInt(envelopeID));
    if (envelope) {
      envelope.transactions.forEach(transaction => {
        const month = transaction.date.slice(0, 7);
        if (month in monthData) {
          monthData[month] += transaction.amount;
        }
      });
    }
    return monthData;
  }

  function getEnvelopeTotals(startMonth, endMonth) {
    const envelopeTotals = {};
    data[selectedAccount].forEach(envelope => {
      if (envelope.envelopeTitle !== "Income") {
        let total = 0;
        envelope.transactions.forEach(transaction => {
          const month = transaction.date.slice(0, 7);
          if (month >= startMonth && month <= endMonth) {
            total += transaction.amount;
          }
        });
        envelopeTotals[envelope.envelopeTitle] = total;
      }
    });
    return envelopeTotals;
  }

  function getMonthlyEnvelopeTotals() {
    const monthlyData = {};
    months.forEach(month => {
      monthlyData[month] = {};
      data[selectedAccount].forEach(envelope => {
        if (envelope.envelopeTitle !== "Income") {
          monthlyData[month][envelope.envelopeTitle] = 0;
        }
      });
    });

    data[selectedAccount].forEach(envelope => {
      if (envelope.envelopeTitle !== "Income") {
        envelope.transactions.forEach(transaction => {
          const month = transaction.date.slice(0, 7);
          if (month in monthlyData) {
            monthlyData[month][envelope.envelopeTitle] += transaction.amount;
          }
        });
      }
    });

    return monthlyData;
  }

  function getIncomeAndExpenses() {
    const monthlyData = {};
    months.forEach(month => {
      monthlyData[month] = {
        income: 0,
        expenses: 0
      };
    });

    data[selectedAccount].forEach(envelope => {
      envelope.transactions.forEach(transaction => {
        const month = transaction.date.slice(0, 7);
        if (month in monthlyData) {
          if (envelope.envelopeTitle === "Income") {
            monthlyData[month].income += transaction.amount;
          } else {
            monthlyData[month].expenses += transaction.amount;
          }
        }
      });
    });

    return monthlyData;
  }

  function searchTransactions(query, exact = false) {
    if (!query) return [];
    
    const allResults = [];
    data[selectedAccount].forEach(envelope => {
      const matchingTransactions = envelope.transactions.filter(t => {
        const description = t.transactionDescription.toLowerCase();
        const searchQuery = query.toLowerCase();
        return exact ? description === searchQuery : description.includes(searchQuery);
      });
      if (matchingTransactions.length > 0) {
        if (groupByEnvelope) {
          allResults.push({
            envelopeTitle: envelope.envelopeTitle,
            transactions: matchingTransactions
          });
        } else {
          matchingTransactions.forEach(t => allResults.push({
            ...t,
            envelopeTitle: envelope.envelopeTitle
          }));
        }
      }
    });

    if (!groupByEnvelope) {
      return [{
        envelopeTitle: 'All Transactions',
        transactions: allResults.sort((a, b) => b.date.localeCompare(a.date))
      }];
    }

    return allResults;
  }

  async function applyReplacements() {
    if (!findText || !replaceText) return;

    await descriptionsToUpdate.forEach(envelope => {
      envelope.transactions.forEach(transaction => updateTransaction(selectedAccount, transaction.envelopeID, transaction.transactionID, 'transactionDescription', replaceText));
    })
  }

  function updateCharts() {
    if (!data.ready) return;

    // Single Envelope Over Time Chart
    if (UIstate.subsectionDisplayed.includes("One Envelope Over Time") && selectedEnvelope) {
      const monthlyData = getMonthlyEnvelopeData(selectedEnvelope);
      const ctx = document.getElementById("singleEnvelopeChart");
      if (ctx && ctx instanceof HTMLCanvasElement) {
        if (singleEnvelopeChart) singleEnvelopeChart.destroy();
        singleEnvelopeChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: Object.keys(monthlyData).map(month => formatMonthYear(month)),
            datasets: [{
              label: "Amount",
              data: Object.values(monthlyData),
              borderColor: chartColors[1],
              tension: 0.1,
              pointRadius: 6,
              pointHoverRadius: 12
            }]
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: tooltipStyles
            },
            scales: {
              y: {
                ticks: {
                  callback: value => currencyFormat(value)
                }
              }
            }
          }
        });
      }
    }

    // Compare Envelopes Charts
    if (UIstate.subsectionDisplayed.includes("Compare Envelopes")) {
      const envelopeTotals = getEnvelopeTotals(selectedMonths[0], selectedMonths[1]);
      const monthlyTotals = getMonthlyEnvelopeTotals();
      console.log(monthlyTotals)

      // Pie Chart
      const pieCtx = document.getElementById("pieChart");
      if (pieCtx && pieCtx instanceof HTMLCanvasElement) {
        if (pieChart) pieChart.destroy();
        pieChart = new Chart(pieCtx, {
          type: "pie",
          data: {
            labels: Object.keys(envelopeTotals),
            datasets: [{
              data: Object.values(envelopeTotals),
              backgroundColor: chartColors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                ...tooltipStyles,
                callbacks: {
                  label: context => {
                    const total = context.dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                    const percentage = ((context.raw / total) * 100).toFixed(1);
                    return `${currencyFormat(context.raw)} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }

      // Stacked Percentage Chart
      const stackedPercentCtx = document.getElementById("stackedPercentChart");
      if (stackedPercentCtx && stackedPercentCtx instanceof HTMLCanvasElement) {
        if (stackedPercentChart) stackedPercentChart.destroy();
        
        // Calculate monthly totals and percentages
        const monthlyPercentages = months.map(month => {
          const monthTotal = Object.values(monthlyTotals[month]).reduce((sum, val) => sum + val, 0);
          const percentages = {};
          Object.entries(monthlyTotals[month]).forEach(([envelope, amount]) => {
            percentages[envelope] = monthTotal ? (amount / monthTotal * 100) : 0;
          });
          return percentages;
        });

        const datasets = Object.keys(monthlyTotals[months[0]]).map((envelope, index) => ({
          label: envelope,
          data: months.map((month, i) => monthlyPercentages[i][envelope]),
          backgroundColor: chartColors[index % chartColors.length],
          originalData: months.map(month => monthlyTotals[month][envelope]) // Store original amounts
        }));

        stackedPercentChart = new Chart(stackedPercentCtx, {
          type: "bar",
          data: { 
            labels: months.map(month => formatMonthYear(month)), 
            datasets 
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                ...tooltipStyles,
                callbacks: {
                  label: context => {
                    const percent = context.raw.toFixed(1);
                    const amount = currencyFormat(context.dataset.originalData[context.dataIndex]);
                    return `${context.dataset.label}: ${percent}% (${amount})`;
                  }
                }
              }
            },
            scales: {
              x: { stacked: true },
              y: {
                stacked: true,
                max: 100,
                ticks: { callback: value => value + "%" }
              }
            }
          }
        });
      }

      // Stacked Amount Chart
      const stackedAmountCtx = document.getElementById("stackedAmountChart");
      if (stackedAmountCtx && stackedAmountCtx instanceof HTMLCanvasElement) {
        if (stackedAmountChart) stackedAmountChart.destroy();
        const datasets = Object.keys(monthlyTotals[months[0]]).map((envelope, index) => ({
          label: envelope,
          data: months.map(month => monthlyTotals[month][envelope]),
          backgroundColor: chartColors[index % chartColors.length]
        }));

        stackedAmountChart = new Chart(stackedAmountCtx, {
          type: "bar",
          data: { 
            labels: months.map(month => formatMonthYear(month)), 
            datasets 
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: tooltipStyles
            },
            scales: {
              x: { stacked: true },
              y: {
                stacked: true,
                ticks: { callback: value => currencyFormat(value) }
              }
            }
          }
        });
      }
    }

    // Income vs Expenses Chart
    if (UIstate.subsectionDisplayed.includes("Income vs Expenses")) {
      const monthlyData = getIncomeAndExpenses();
      const incomeExpensesCtx = document.getElementById("incomeExpensesChart");
      
      if (incomeExpensesCtx && incomeExpensesCtx instanceof HTMLCanvasElement) {
        if (incomeExpensesChart) incomeExpensesChart.destroy();
        incomeExpensesChart = new Chart(incomeExpensesCtx, {
          type: "line",
          data: {
            labels: Object.keys(monthlyData).map(month => formatMonthYear(month)),
            datasets: [
              {
                label: "Assets",
                data: Object.values(monthlyData).map(d => d.income),
                borderColor: chartColors[3],
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 12
                },
                {
                label: "Income",
                data: Object.values(monthlyData).map(d => {
                  const incomeTransactions = data[selectedAccount]
                  .find(env => env.envelopeTitle === "Income")
                  ?.transactions.filter(t => 
                    !["Starting Balance", "Balance"].includes(t.transactionDescription) &&
                    t.date.startsWith(Object.keys(monthlyData)[Object.values(monthlyData).indexOf(d)])
                  ) || [];
                  return incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                }),
                borderColor: chartColors[2],
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 12
                },
              {
                label: "Expenses",
                data: Object.values(monthlyData).map(d => d.expenses),
                borderColor: chartColors[0],
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 12
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: tooltipStyles
            },
            scales: {
              y: {
                ticks: {
                  callback: value => currencyFormat(value)
                }
              }
            }
          }
        });
      }
    }
  }

  $effect(() => {
    if (data.ready) {
      updateCharts();
    }
  });

  $effect(() => {
    if (UIstate.subsectionDisplayed || selectedEnvelope || selectedAccount || selectedMonths) {
      updateCharts();
    }
  });

</script>

<div class="analysis-container">
  {#if UIstate.subsectionDisplayed.includes("One Envelope Over Time")}
    <div class="analysis-section">
      <h2>One Envelope Over Time</h2>
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
          Select Envelope:
          <select bind:value={selectedEnvelope}>
            <option value="">Select an envelope...</option>
            {#each data[selectedAccount] ?? [] as envelope}
              {#if envelope.envelopeTitle !== "Income"}
                <option value={envelope.envelopeID}>{envelope.envelopeTitle}</option>
              {/if}
            {/each}
          </select>
        </label>
      </div>
      <div class="chart-container">
        <canvas id="singleEnvelopeChart"></canvas>
      </div>
    </div>
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Compare Envelopes")}
    <div class="analysis-section">
      <h2>Compare Envelopes</h2>
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
          From:
          <select bind:value={selectedMonths[0]}>
            {#each months as month}
              <option value={month}>{formatMonthYear(month)}</option>
            {/each}
          </select>
        </label>
        <label>
          To:
          <select bind:value={selectedMonths[1]}>
            {#each months as month}
              <option value={month}>{formatMonthYear(month)}</option>
            {/each}
          </select>
        </label>
      </div>
      <div class="chart-container">
        <h3>Distribution of Expenses</h3>
        <canvas id="pieChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Monthly Expense Distribution (%)</h3>
        <canvas id="stackedPercentChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Monthly Expense Distribution ($)</h3>
        <canvas id="stackedAmountChart"></canvas>
      </div>
      <div class="stats-container">
        <h3>Envelope Statistics</h3>
        {#if selectedMonths[0] && selectedMonths[1]}
          {#each data[selectedAccount] ?? [] as envelope}
            {#if envelope.envelopeTitle !== "Income"}
              <div class="stat-item">
                <h4>{envelope.envelopeTitle}</h4>
                {#if envelope.transactions.length > 0}
                  {@const monthlyTotals = getMonthlyEnvelopeTotals()}
                  {@const amounts = months.map(month => monthlyTotals[month][envelope.envelopeTitle])}
                  <p>Min: {currencyFormat(Math.min(...amounts))}</p>
                  <p>Avg: {currencyFormat(amounts.reduce((a, b) => a + b, 0) / amounts.length)}</p>
                  <p>Max: {currencyFormat(Math.max(...amounts))}</p>
                {/if}
              </div>
            {/if}
          {/each}
        {/if}
      </div>
    </div>
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Income vs Expenses")}
    <div class="analysis-section">
      <h2>Income vs Expenses</h2>
      <div class="controls">
        <label>
          Select Account:
          <select bind:value={selectedAccount} class="capitalize">
            {#each ["checking", "savings"] as account}
              <option value={account}>{account}</option>
            {/each}
          </select>
        </label>
      </div>
      <div class="chart-container">
        <canvas id="incomeExpensesChart"></canvas>
      </div>
    </div>
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Search Transactions")}
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
          {#each searchTransactions(searchQuery, exactMatch) as result}
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
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Find and Replace")}
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
  {/if}
</div>

<style>
  .analysis-container {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .analysis-section {
    margin-bottom: 40px;
  }

  .controls {
    margin: 20px 0;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .chart-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .stats-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .stat-item {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .stat-item h4 {
    margin: 0 0 10px 0;
    color: var(--accent);
  }

  .stat-item p {
    margin: 5px 0;
  }

  .search-results {
    margin-top: 20px;
  }

  .search-group {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }

  th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: var(--grey-600);
  }

  .average {
    margin-top: 10px;
    font-weight: bold;
    text-align: right;
  }

  select, input {
    padding: 8px;
    border: 1px solid var(--grey-500);
    border-radius: 4px;
    font-size: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  h2 {
    color: var(--accent);
    margin-bottom: 20px;
  }

  h3 {
    margin: 0 0 15px 0;
    color: var(--grey-100);
  }

  .replace-button {
    padding: 8px 16px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    align-self: flex-end;
  }

  .replace-button:disabled {
    background: var(--grey-500);
    cursor: not-allowed;
  }

  .new-description {
    color: var(--accent);
    font-style: italic;
  }

  .checkbox-label {
    gap: 12px;
    input {
      width: 25px;
      height: 25px;
      margin: 0;
    }
  }
</style>