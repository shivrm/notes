<script>
    import { addNote, appState, getEditNote, editNote } from "./stores";

    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    var edit = false;
    onMount(async () => {
        if ($appState.editNoteIndex !== undefined) {
            var textbox = document.getElementById("note-text");
            var note = getEditNote();

            textbox.value = note.content
            edit = true;
        }
    })

    function finishEdit() {
        var textbox = document.getElementById("note-text")
        
        if (!textbox.value) return;

        editNote({
            content: textbox.value
        })

        $appState.editNoteIndex = undefined;
        closeEditor()
    }

    var backgroundClick = (e) => (e.target == e.currentTarget)? closeEditor(): undefined;
    var closeEditor = () => $appState.editorOpen = false;

    function submit() {
        var textbox = document.getElementById("note-text");
        
        if (!textbox.value) return;
        addNote({
            content: textbox.value
        });
        
        closeEditor();
    }
</script>

<style>
    .note-editor-container {
        /* Make the element fixed at top right corner, and occupy the
         * whole screen, to serve as the background for the modal
         */
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        
        /* Make the element flex vertically, and display all of its
         * children in the middle
         */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        /* Gives the element a transparent, dark background. */
        background: rgba(0, 0, 0, 0.8);
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

    .toolbar {
        /* Gives the element rounded corners */
        border-radius: 1.5em 1.5em 0 0;
        
        /* Makes the elemnt a flexbox, centers the children vertically
         * and places them at the right end of the parent
         */
        display: flex;
        align-items: center;
        justify-content: end;

        /* Makes the element occupy 20% of its parent vertically */
        height: 20%;

        /* Gives the element 0 margin to make it fit in parent without
         * any gaps, and 0 vertical padding. 1em horizontal padding is
         * given to pad toolbar items
         */
        margin: 0;
        padding: 0 1em;
        
        /* Sets the element's background color */
        background-color: #f8fa6f;
    }

    .body {
        /* Gives the element rounded corners */ 
        border-radius: 0 0 1.5em 1.5em;
        
        /* Makes the element occupy all available space in the parent */
        flex: 1;
        
        /* Sets the element's height */
        height: 60%;
        
        /* Give the element some padding, but no margin to make it fit
         * inside the parent element without any gaps
         */
        padding: 1.2em;
        margin: 0;
        
        /* Gives the element a background color */
        background-color: #f8fa8b;
    }

    #note-text {
        /* Make the element transparent by removing the default border
         * and outline, and setting a transparent background
         */
        background: transparent;
        outline: none;
        border: none;
    }

    .action {
        /* Gives the element rounded corners */
        border-radius: 100px;

        /* Removes the default button outline */
        outline: none;

        /* Gives some margin and padding to the element */
        margin: 2em;
        padding: 1em 3em;

        transition: 0.2s;
    }

    .action:hover {
        color: #a9a9a9;
        transform: scale(1.1);
    }
</style>

<section class="note-editor-container"
    on:click={backgroundClick}
    transition:fade="{{duration: 100}}"
    >
    <article class="note">
        <ul class="toolbar">
        </ul>
        <div class="body">
            <textarea id="note-text" cols="30" rows="10" placeholder="Put some text (or markdown) here"></textarea>
        </div>
    </article>

    {#if !edit}
        <button class="action" on:click={submit}>Add Note</button>
    {:else}
        <button class="action" on:click={finishEdit}>Edit Note</button>    
    {/if}
</section>