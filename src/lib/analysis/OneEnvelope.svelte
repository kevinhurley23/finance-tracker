<script>
  import { UIstate, data, months } from "../data.svelte.js";
  import Chart from "chart.js/auto";
  import { currencyFormat, dateISOToMonthAndYear } from "../functions.js";
  let { selectedAccount, selectedEnvelope, chartColors, tooltipStyles } = $props();

  let singleEnvelopeChart;

  // {2025-02: 373.82, 2025-03: 470.82, 2025-04: 0}
  function getOneEnvelopeTotalsByMonth(envelopeID) {
    const monthData = {};
    months.forEach(month => monthData[month] = 0);
    
    const envelope = data[selectedAccount].find(env => env.envelopeID === envelopeID);
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

  function updateChart() {
    if (!data.ready) return;

    // Single Envelope Over Time Chart
    if (selectedEnvelope) {
      const monthlyData = getOneEnvelopeTotalsByMonth(selectedEnvelope);
      const ctx = document.getElementById("singleEnvelopeChart");
      if (ctx && ctx instanceof HTMLCanvasElement) {
        if (singleEnvelopeChart) singleEnvelopeChart.destroy();
        singleEnvelopeChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: Object.keys(monthlyData).map(month => dateISOToMonthAndYear(month)),
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
  }

  $effect(() => {
    if (data.ready && (UIstate.subsectionDisplayed || selectedEnvelope || selectedAccount)) {
      updateChart();
    }
  });
</script>

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