<script>
  import Card from "./Card.svelte";
  import Transaction from "./Transaction.svelte";
  export let envelope;
  export let allExpanded;
  export let currencyFormat;

  $: expanded = allExpanded;
</script>

<Card>
  <div class="envelope {expanded ? 'expanded' : ''}">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="heading" on:click={() => expanded = !expanded}>
      <h3>
        {envelope.envelope}
        <i class="fa-solid fa-chevron-right"></i>
      </h3>
      <span class="amount-total"></span>
    </div>
    <div class="envelope-body">
      {#if envelope.description}
        <p>{envelope.description}</p>
      {/if}
      {#each envelope.transactions as transaction}
        <Transaction {transaction} {currencyFormat}/>
      {/each}
    </div>
  </div>
</Card>

<style>
  .envelope {
    .heading {
      display: grid;
      grid-template-columns: 1fr 125px;
      padding: 20px;
      h3 {
        margin: 0;
        i {
          margin-left: 5px;
          transition: 200ms;
        }
      }
      &:hover {
        background-color: var(--grey-500);
      }
    }
    .envelope-body {
      display: none;
      padding: 0 20px 20px;
      p {
        margin-top: 0;
      }
    }
    &.expanded {
      .heading i {
        transform: rotate(90deg);
      }
      .envelope-body {
        display: block;
      }
    }
  }
</style>