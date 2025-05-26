<script>
  import { UIstate, data, months } from "../data.svelte.js";
  import Chart from "chart.js/auto";
  import { currencyFormat, formatMonthYear } from "../functions.js";
  let { selectedAccount, chartColors, tooltipStyles } = $props();

  let incomeExpensesChart;

  /* {
    "2025-02": { "income": 21228.34, "expenses": 4322.5 },
    "2025-03": { "income": 24816.45, "expenses": 4370.46 }
  } */
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

  function updateChart() {
    if (!data.ready) return;

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

  $effect(() => {
    if (data.ready && (UIstate.subsectionDisplayed || selectedAccount)) {
      updateChart();
    }
  });
</script>

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