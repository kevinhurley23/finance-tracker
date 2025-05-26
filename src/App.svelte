<script>
  import Activity from './lib/activity/Activity.svelte';
  import Analysis from './lib/analysis/Analysis.svelte';
  import Switch from './lib/ui-components/Switch.svelte';
  import { UIstate, data, fetchData, accountNames, analyzers } from './lib/data.svelte.js';
  import { fly } from 'svelte/transition';

  fetchData();

  console.log(data.savings)

  function changeSection(subsection, exclusive = true) {
    if (accountNames.includes(subsection)) {
      UIstate.sectionDisplayed = "activity";
    } else {
      UIstate.sectionDisplayed = "analysis";
    }

    if (exclusive) {
      UIstate.subsectionDisplayed = [subsection];
      showNav = false;
    } else {
      if (UIstate.subsectionDisplayed.includes(subsection)) {
        UIstate.subsectionDisplayed = UIstate.subsectionDisplayed.filter(s => s !== subsection);
      } else {
        UIstate.subsectionDisplayed = [...UIstate.subsectionDisplayed, subsection];
      }
    }
  }

  let showNav = $state(false);
</script>

<div id="app-body" class:testing-mode={UIstate.testingMode}>
  <!-- Hamburger Menu Button -->
  <button 
    class="hamburger" 
    onclick={() => showNav = !showNav}
    aria-label="Toggle navigation menu"
  >
    <i class="fa-solid fa-bars"></i>
  </button>

  <!-- Navigation Menu -->
  {#if showNav}
    <nav transition:fly={{duration: 300, x: -250, y: -150, opacity: 0}} >
      <div class="row testing-mode-toggle">
        <Switch bind:state={UIstate.testingMode} color={'testing-accent'} />
        <p>Testing Mode</p>
      </div>
      <section>
        <h2>Activity</h2>
        {#each accountNames as account}
          <div class="nav-item-container">
            <input 
              type="checkbox" 
              checked={UIstate.subsectionDisplayed.includes(account)}
              onclick={() => changeSection(account, false)}
            />
            <button 
              class={`nav-item ${UIstate.subsectionDisplayed.includes(account) ? "active" : ""}`} 
              onclick={() => changeSection(account)}
            >
              {account}
            </button>
          </div>
        {/each}
      </section>
      
      <section>
        <h2>Analysis & Tools</h2>
        {#each analyzers as analyzer}
          <div class="nav-item-container">
            <button
              class={`nav-item ${UIstate.subsectionDisplayed.includes(analyzer) ? "active" : ""}`}
              onclick={() => changeSection(analyzer)}
            >
              {analyzer}
            </button>
          </div>
        {/each}
      </section>
    </nav>
  {/if}

  {#if !data.ready}
    <p>Data is loading</p>
  {:else}
    {#if UIstate.sectionDisplayed === "activity"}
      <Activity />
    {:else}
      <Analysis />
    {/if}
  {/if}
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

  .hamburger {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1000;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--grey-100);
    &:hover {
      color: var(--accent);
    }
  }

  nav {
    position: fixed;
    top: 5px;
    left: 5px;
    width: fit-content;
    background-color: white;
    padding: 4rem 1rem 1rem;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 999;
    border-radius: 10px;

    .testing-mode-toggle {
      align-items: center;
      justify-content: start;
      gap: 10px;
    }

    section {
      margin-bottom: 2rem;

      h2 {
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--accent);
        font-size: 1.6rem;
      }
    }

    .nav-item-container {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 0.5rem;

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin: 0;
        cursor: pointer;
      }
    }

    .nav-item {
      flex: 1;
      text-align: left;
      padding: 0.5rem;
      background: none;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-transform: capitalize;

      &:hover {
        background-color: var(--grey-600);
      }

      &.active {
        background-color: var(--accent);
        color: white;
      }
    }
  }
</style>
