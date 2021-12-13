<script>
    import Note from "./Note.svelte";
    import NoteEditor from "./NoteEditor.svelte";
    import Menu from "./Menu.svelte";
    
    import { notes, appState } from "./stores";

    import { flip } from "svelte/animate";

    $: (() => {
        if ($appState.theme == 'light') {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
        }

        else if ($appState.theme == 'dark') {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
        }
    })();

</script>

<link href="https://fonts.googleapis.com/css2?family=Anton&family=Bad+Script&family=Fuzzy+Bubbles&family=Roboto&family=Roboto+Mono&display=swap" rel="stylesheet">

<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100&display=swap');

    :global(body.light) {
        --bg-color: #F7F7F8;
        --fg-color: #32322C;
    }

    :global(body.dark) {
        --bg-color: #32322C;
        --fg-color: #F7F7F8;
    }

    :global(body) {
        background-color: var(--bg-color);
    }
    header h1 {
        /* Sets a thin, sans-serif font to the heading to make
         * it appear modern
         */
        font-family: 'Poppins', sans-serif;
        font-size: 4em;
        
        /* Aligns heading text to the center */
        text-align: center;

        color: var(--fg-color);
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

    .no-notes {
        grid-column: 1 / -1;
        text-align: center;
        
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 3em;

        color: #b9b9b9;
    }

    .note {
        /* Gives the element rounded corners */
        border-radius: 1.5em;
        
        /* Makes the element a vertical flexbox to help position
        * its chidren properly
        */
        display: flex;
        flex-direction: column;
        
        /* Sets the dimensions of the element */
        height: 23em;
        width: 18em;
        
        /* Sets the padding of the element to 0 in order to allow
        * child elements to fit inside it without any gaps
        * surrounding it.
        */
        padding: 0;
    }

    .overlay {
        position: fixed;
        bottom: 0;
        left: 0;

        height: 7vh;
        width: 100%;

        background: linear-gradient(transparent, var(--bg-color));
    }
</style>

<header>
    <h1>
        Notes
    </h1>
</header>

<main>
    <section class="notes">
        {#each $notes as note, index (note.id)}
            <article class="note" animate:flip="{{duration: 250}}">
                <Note {...note} {index}/>
            </article>
        {/each}
        {#if !$notes.length}
            <h1 class="no-notes">Click on the + to create a note</h1>
        {/if}
    </section>
</main>

<div class="overlay {$appState.theme}">
</div>

{#if $appState.editorOpen}
    <NoteEditor />
{:else}
    <Menu />
{/if}
