<script>
    import Note from "./Note.svelte";
    
    import { notes } from "./stores";
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100&display=swap');
    header h1 {
        font-family: 'Poppins', sans-serif;
        font-size: 4em;
        text-align: center;
    }

    .notes {
        display: grid;
        grid-gap: 1em;
        grid-template-columns: repeat(4, 1fr);
    }
</style>

<header>
    <h1>
        Notes
    </h1>
</header>

<main>
    <section class="notes">
        {#each $notes as note}
            <Note />
        {/each}
    </section>
</main>