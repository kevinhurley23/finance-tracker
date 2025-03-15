<script>
  import Account from './lib/Account.svelte';
  import Switch from './lib/Switch.svelte';
  import Modal from './lib/Modal.svelte';
  import { UIstate, data, fetchData, accountNames } from './lib/data.svelte.js';

  fetchData();

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

  function toggleSection(section) {
    if (UIstate.oneSectionAtATime) {
      UIstate.sectionDisplayed = [section];
    } else {
      if (UIstate.sectionDisplayed.includes(section)) {
        UIstate.sectionDisplayed = UIstate.sectionDisplayed.filter(s => s !== section);
      } else {
        UIstate.sectionDisplayed = [...UIstate.sectionDisplayed, section];
      }
    }
  }
</script>

<div id="app-body" class={UIstate.testingMode ? "testing-mode" : ""}>
  <header>
    <div id="testing-mode-toggle" class="toggle" title="When testing mode is on, no changes will be written to the database">
      <p>Testing Mode</p>
      <Switch bind:state={UIstate.testingMode} color={'testing-accent'} />
      {#if !UIstate.canToggleTestingMode}
        <div class="overlay" title="When using placeholder data, testing mode cannot be disabled"></div>
      {/if}
    </div>
    <div class="section-buttons">
      {#each accountNames as account}
        <button class={`account-selector ${UIstate.sectionDisplayed.includes(account) ? "" : "inactive"}`} style={`--accent: var(--${account}-accent)`} onclick={() => toggleSection(account)}>{account}</button>
      {/each}
    </div>
    <div id="one-section" class="toggle" title="When enabled, only one section will be displayed at a time">
      <p>One At A Time</p>
      <Switch bind:state={UIstate.oneSectionAtATime} color={`${UIstate.sectionDisplayed[0]}-accent`} />
    </div>
  </header>
  <main class={UIstate.sectionDisplayed.length > 1 ? 'multiple-accounts' : ''} style={`--grid-rows: ${data.maxEnvelopes + 2}`}>
    {#if !data.ready}
      <p>Data is loading</p>
    {:else}
      {#each accountNames as account}
        <section id={account} class="account-section" style={`--accent: var(--${account}-accent); ${UIstate.sectionDisplayed.includes(account) ? "" : "display: none;"}`}>
          <h1>{account}</h1>
          <Account
            accountTitle={account}
            envelopes={data[account]}
            {budgetEnvelopeTotals}
            firstTransactionDate={data.firstTransactionDate}
          />
        </section>
      {/each}
    {/if}
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
</div>

<style>
  #app-body {
    color: var(--grey-100);
    margin: 0;
    font-family: "open sans";
    font-size: 1.2rem;
    position: relative;
    border: 5px solid var(--grey-600);
    border-right-width: 0;
    height: 100vh;
    overflow-y: auto;
    &.testing-mode {
      border-color: var(--testing-accent);
      border-right-width: 5px;
    }
  }
  header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    gap: 15px 30px;
    background-color: var(--grey-600);
    padding: 10px;
    box-shadow: 0 0 15px 0 var(--grey-500);
    .toggle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      position: relative;
      p {
        margin: 0;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background-color: var(--grey-600);
        opacity: 0.7;
      }
    }
    .section-buttons {
      display: flex;
      align-items: center;
      gap: 15px 30px;
      flex-wrap: wrap;
      .account-selector {
        text-transform: capitalize;
        &.inactive {
          opacity: 0.5;
        }
      }
    }
  }
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
