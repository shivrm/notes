<script>
    import Note from "./Note.svelte";
    import NoteEditor from "./NoteEditor.svelte";
    import Menu from "./Menu.svelte";
    
    import { notes, appState } from "./stores";
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100&display=swap');
    header h1 {
        /* Sets a thin, sans-serif font to the heading to make
         * it appear modern
         */
        font-family: 'Poppins', sans-serif;
        font-size: 4em;
        
        /* Aligns heading text to the center */
        text-align: center;
    }

    .notes {
        /* Makes the element a grid with four columns */
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        
        /* Adds a gap between child elements */
        grid-gap: 1em;

        /* Place children in the middle of the grid */
        place-items: center;
    }

    @media (max-aspect-ratio: 13/16) {
        .notes {
            /* Set number of columns to one on vertical displays */
            grid-template-columns: 1fr;
        }
    }
</style>

<header>
    <h1>
        Notes
    </h1>
</header>

<main>
    <section class="notes">
        {#each $notes as note, index}
            <Note {...note} {index}/>
        {/each}
    </section>
</main>

{#if $appState.editorOpen}
    <NoteEditor />
{/if}
<Menu />