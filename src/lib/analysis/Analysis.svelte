<script>
  import { UIstate, data } from "../data.svelte.js";
  import AnalysisOneEnvelope from "./OneEnvelope.svelte";
  import AnalysisCompareEnvelopes from "./CompareEnvelopes.svelte";
  import AnalysisIncomeVsExpenses from "./IncomeVsExpenses.svelte";
  import AnalysisSearchTransactions from "./SearchTransactions.svelte";
  import FindAndReplace from "./FindAndReplace.svelte";

  let selectedAccount = $state("checking");
  let selectedEnvelope = $state("");

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

  function searchTransactions(query) {
    if (!query) return [];

    const allResults = [];
    data[selectedAccount].forEach(envelope => {
      const matchingTransactions = envelope.transactions.filter(t => {
        const description = t.transactionDescription.toLowerCase();
        const searchQuery = query.toLowerCase();
        return UIstate.exactMatch ? description === searchQuery : description.includes(searchQuery);
      });
      if (matchingTransactions.length > 0) {
        if (UIstate.groupByEnvelope) {
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

    if (!UIstate.groupByEnvelope) {
      return [{
        envelopeTitle: 'All Transactions',
        transactions: allResults.sort((a, b) => b.date.localeCompare(a.date))
      }];
    }

    return allResults;
  }

</script>

<div class="analysis-container">
  {#if UIstate.subsectionDisplayed.includes("One Envelope Over Time")}
    <AnalysisOneEnvelope
      {selectedAccount}
      {selectedEnvelope}
      {chartColors}
      {tooltipStyles}
    />
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Compare Envelopes")}
    <AnalysisCompareEnvelopes
      {selectedAccount}
      {selectedEnvelope}
      {chartColors}
      {tooltipStyles}
    />
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Income vs Expenses")}
    <AnalysisIncomeVsExpenses
      {selectedAccount}
      {chartColors}
      {tooltipStyles}
    />
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Search Transactions")}
    <AnalysisSearchTransactions
      bind:selectedAccount={selectedAccount}
      {searchTransactions}
      bind:exactMatch={UIstate.exactMatch}
      bind:groupByEnvelope={UIstate.groupByEnvelope}
    />
  {/if}

  {#if UIstate.subsectionDisplayed.includes("Find and Replace")}
    <FindAndReplace
      bind:selectedAccount={selectedAccount}
      {searchTransactions}
      bind:exactMatch={UIstate.exactMatch}
    />
  {/if}
</div>