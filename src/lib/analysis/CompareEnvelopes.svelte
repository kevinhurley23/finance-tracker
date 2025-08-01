<script>
  import { UIstate, data, months } from "../data.svelte.js";
  import Chart from "chart.js/auto";
  import { currencyFormat, dateISOToMonthAndYear } from "../functions.js";
  let { selectedAccount, selectedEnvelope, chartColors, tooltipStyles } = $props();

  let selectedMonths = $state([]);
  let monthsInRange = $derived(months.filter(month => month >= selectedMonths[0] && month <= selectedMonths[1]));
  let pieChart;
  let stackedPercentChart;
  let stackedAmountChart;

  // Initialize selected months when data is ready
  $effect(() => {
    if (data.ready && months.length > 0) {
      selectedMonths = [months[0], months[months.length - 1]];
    }
  });

  // {"Savings": 3242, "Housing": 2136, "Transportation": 1724.2}
  function getAllEnvelopeTotals(startMonth, endMonth) {
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

  /* {
    "2025-02": {"Savings": 1621, "Housing": 1068, "Transportation": 852.17},
    "2025-03": {"Savings": 1621, "Housing": 1068, "Transportation": 872.03}
  } */
  function getAllEnvelopeTotalsByMonth() {
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

  function updateChart() {
    if (!data.ready) return;

    const envelopeTotals = getAllEnvelopeTotals(selectedMonths[0], selectedMonths[1]);
    const monthlyTotals = getAllEnvelopeTotalsByMonth();

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
      const monthlyPercentages = monthsInRange.map(month => {
        const monthTotal = Object.values(monthlyTotals[month]).reduce((sum, val) => sum + val, 0);
        const percentages = {};
        Object.entries(monthlyTotals[month]).forEach(([envelope, amount]) => {
          percentages[envelope] = monthTotal ? (amount / monthTotal * 100) : 0;
        });
        return percentages;
      });

      const datasets = Object.keys(monthlyTotals[months[0]]).map((envelope, index) => ({
        label: envelope,
        data: monthsInRange.map((month, i) => monthlyPercentages[i][envelope]),
        backgroundColor: chartColors[index % chartColors.length],
        originalData: monthsInRange.map(month => monthlyTotals[month][envelope]) // Store original amounts
      }));

      stackedPercentChart = new Chart(stackedPercentCtx, {
        type: "bar",
        data: { 
          labels: monthsInRange.map(month => dateISOToMonthAndYear(month)), 
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
        data: monthsInRange.map(month => monthlyTotals[month][envelope]),
        backgroundColor: chartColors[index % chartColors.length]
      }));

      stackedAmountChart = new Chart(stackedAmountCtx, {
        type: "bar",
        data: { 
          labels: monthsInRange.map(month => dateISOToMonthAndYear(month)), 
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

  $effect(() => {
    if (data.ready && (UIstate.subsectionDisplayed || selectedEnvelope || selectedAccount || selectedMonths)) {
      updateChart();
    }
  });
</script>

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
          <option value={month}>{dateISOToMonthAndYear(month)}</option>
        {/each}
      </select>
    </label>
    <label>
      To:
      <select bind:value={selectedMonths[1]}>
        {#each months as month}
          <option value={month}>{dateISOToMonthAndYear(month)}</option>
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
              {@const monthlyTotals = getAllEnvelopeTotalsByMonth()}
              {@const amounts = monthsInRange.map(month => monthlyTotals[month][envelope.envelopeTitle])}
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