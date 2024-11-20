<script>
  // import viteLogo from '/vite.svg' // assets in 'public' folder can be imported like this
  import Envelope from './lib/Envelope.svelte';
  import { checkingAccount } from './lib/placeholderData';

  let expenses = checkingAccount["2024-11"].expenses;
</script>

<main>
  {#each expenses as expense}
    <Envelope {expense} />
  {/each}
</main>

<style>

</style>
