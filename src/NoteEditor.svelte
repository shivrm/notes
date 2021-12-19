<script>
    import { addNote, appState, getEditNote,
             editNote, noteColors, fontStyles } from "./stores";

    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    var edit = false;
    onMount(async () => {
        var textbox = document.getElementById("note-text");
        textbox.focus();

        if ($appState.editNoteIndex !== undefined) {
            var note = getEditNote();

            textbox.value = note.content
            selectedColor = note.color
            selectedFont = note.font
            
            edit = true;
        }
    })

    function finishEdit() {
        var textbox = document.getElementById("note-text")
        
        if (!textbox.value) return;

        editNote({
            content: textbox.value,
            color: selectedColor,
            font: selectedFont
        })

        closeEditor()
    }

    var backgroundClick = (e) => (e.target == e.currentTarget)? closeEditor(): undefined;
    var closeEditor = () => {
        $appState.editNoteIndex = undefined;
        $appState.editorOpen = false;
    }

    function submit() {
        var textbox = document.getElementById("note-text");
        
        if (!textbox.value) return;
        addNote({
            content: textbox.value,
            color: selectedColor,
            font: selectedFont
        });
        
        closeEditor();
    }

    function checkEscape(event) {
        if (event.key == "Escape") {
            closeEditor()
        }
    }

    var selectedColor = 0
    var selectedFont = 0

    function setNoteColor(index) {
        selectedColor = index
    }

    function setFontStyle(index) {
        selectedFont = index
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

    .editor-main {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        
        grid-gap: 0.5em;
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
        background-color: var(--note-color);

        transition: 0.2s ease;
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
        backdrop-filter: brightness(0.85) contrast(1.3);
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
        background-color: var(--note-color);

        transition: 0.2s ease;
    }

    .picker {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        margin: 0;
    }

    .colors {
        padding: 1em;
        margin: 0;

        display: grid;
        grid-template-columns: repeat(2, 1fr);

        grid-gap: 3em;
    }

    .color {
        list-style-type: none;

        margin: 0;

        width: 3em;
        height: 3em;

        border-radius: 4em;

        transition: 0.1s;
    }

    .fonts {
        padding: 1em;
        margin: 0;

        display: grid;
        grid-template-columns: repeat(2, 1fr);

        grid-gap: 3em;
    }

    .font {
        list-style-type: none;

        margin: 0;

        width: 3em;
        height: 3em;

        border-radius: 4em;

        transition: 0.1s;

        background-color: var(--note-color);

        display: flex;
        align-items: center;
        justify-content: center;
    }
    .font span {
        font-family: var(--font-style);
        font-size: 1.5em;
    }

    .selected {
        border-radius: 1em;
    }

    @media (max-aspect-ratio: 13/16) {
        .editor-main {
            grid-template-columns: 1fr;
            place-items: center;
        }

        .colors {
            grid-template-columns: repeat(7, 1fr);
            grid-gap: 0.8em;
        }

        .color {
            height: 1.5em;
            width: 1.5em;
        }

        .fonts {
            grid-template-columns: repeat(5, 1fr);
            grid-gap: 1em;
        }

        .font {
            height: 2em;
            width: 2em;
        }

        .font span {
            font-size: 0.8em;
        }
    }


    #note-text {
        /* Make the element transparent by removing the default border
         * and outline, and setting a transparent background
         */
        background: transparent;
        outline: none;
        border: none;
        
        resize: none;
        font-family: var(--font-style);

        width: 90%;
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

<svelte:window on:keydown={checkEscape} />

<section class="note-editor-container"
    on:click={backgroundClick}
    transition:fade="{{duration: 100}}"
    >
    
    <section class="editor-main"
    style="--note-color: {noteColors[selectedColor]};
           --font-style: {fontStyles[selectedFont]}"
    >
        <article class="picker"
        on:click={backgroundClick}
        >
            <ul class="fonts">
                {#each fontStyles as font, index}
                    <li class="font"
                    class:selected={index == selectedFont}
                    on:click={() => setFontStyle(index)}>
                        <span style="--font-style: {font}">Aa</span>
                    </li>
                {/each}
            </ul>
        </article>

        <article class="note">
            <ul class="toolbar">
            </ul>
            <div class="body">
                <textarea id="note-text" cols="30" rows="10" placeholder="Text / Markdown"></textarea>
            </div>
        </article>

        <article class="picker"
        on:click={backgroundClick}
        >
            <ul class="colors">
                {#each noteColors as color, index}
                    <li 
                    on:click={() => setNoteColor(index)}
                    style="background-color: {color}"
                    class="color"
                    class:selected={index==selectedColor}>
                    </li>
                {/each}
            </ul>
        </article>
    </section>

    {#if !edit}
        <button class="action" on:click={submit}>Add Note</button>
    {:else}
        <button class="action" on:click={finishEdit}>Edit Note</button>    
    {/if}
</section>