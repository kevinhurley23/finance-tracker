<script>
  import Account from './Account.svelte';
  import Modal from '../ui-components/Modal.svelte';
  import { UIstate, data, accountNames } from '../data.svelte.js';

  let budgetEnvelopeTotals = $state({});
  $effect(() => {
		if (data.ready) {
      data.budget.forEach((envelope) => {
        let envelopeAccumulator = 0;
        envelope.transactions.forEach(transaction => {
          envelopeAccumulator += transaction.amount;
        })
        budgetEnvelopeTotals[envelope.envelopeTitle] = envelopeAccumulator;
      })
    };
	});
</script>

<main class:multiple-accounts={UIstate.subsectionDisplayed.length > 1} style={`--grid-rows: ${data.maxEnvelopes + 2}`}>
  {#each accountNames as account}
    <section id={account} class="account-section" style={`--accent: var(--${account}-accent); ${UIstate.subsectionDisplayed.includes(account) ? "" : "display: none;"}`}>
      <h1>{account}</h1>
      <Account
        accountTitle={account}
        envelopes={data[account]}
        {budgetEnvelopeTotals}
        firstTransactionDate={data.firstTransactionDate}
      />
    </section>
  {/each}
  {#if UIstate.showConnectErrorModal}
    <Modal bind:showModal={UIstate.showConnectErrorModal}>
      {#snippet modalBody()}
        <p>Could not connect to database. Placeholder Data loaded instead.</p>
      {/snippet}
      {#snippet modalButtons()}
        <button onclick={() => UIstate.showConnectErrorModal = false}>OK</button>
      {/snippet}
    </Modal>
  {/if}
</main>

<style>
  main {
    margin-inline: auto;
    padding: 10px 25px 40px;
    display: grid;
    grid-auto-flow: column;
    gap: 30px 50px;
  }
  .account-section {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span var(--grid-rows);
  }
  h1 {
    text-transform: capitalize;
  }
</style>