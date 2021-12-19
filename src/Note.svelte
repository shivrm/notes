<script>
    import { deleteNote, appState, noteColors, fontStyles } from "./stores"
    import { markdown } from "./markdown";

    import { fade } from "svelte/transition";
    
    export let content;
    export let index;
    export let color;
    export let font;

    var deleteSelf = () => deleteNote(index);

    function openInEditor() {
        $appState.editNoteIndex = index;
        $appState.editorOpen = true;
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Corinthia&family=Fuzzy+Bubbles&family=Roboto&family=Roboto+Mono&display=swap');

    .container {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        background-color: var(--note-color);
        border-radius: 1.5em;
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
    .toolbar-item {
        /* Removes list bullets from the element */
        list-style-type: none;
        
        /* Sets the element's height */
        height: 50%;

        /* Adds space between icons */
        margin-left: 1em;
    }    
    
    .toolbar-item svg {
        /* Makes the element occupy all space available inside parnet */
        min-height: 100%;
        
        /* Makes the element take some time to transition */
        transition: 0.1s;
    }
    
    .toolbar-item:hover svg {
        /* Scale the element slightly when hovered over */
        transform: scale(1.1);
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
        
        font-family: var(--font-style);
    }
    
    .content {
        /* Makes the element take up all horizontal space inside
        * its parent
        */
        height: 100%;
        
        word-wrap: break-word;
        
        /* Adds a scrollbar to the element when the content doesn't
        * fit inside it
        */
        overflow-y: scroll;
    }
</style>


<div class="container"
style="--note-color: {noteColors[color]};
       --font-style: {fontStyles[font]}"
>
    <ul class="toolbar">
        <li class="toolbar-item" title="Edit Note" on:click={openInEditor}>
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="edit" class="svg-inline--fa fa-edit fa-w-18" role="img" viewBox="0 0 576 512"><path fill="currentColor" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"/></svg>
        </li>
        <li class="toolbar-item" title="Delete this Note" on:click={deleteSelf}>
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash" class="svg-inline--fa fa-trash fa-w-14" role="img" viewBox="0 0 448 512"><path fill="currentColor" d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/></svg>
        </li>
    </ul>
    <div class="body">
        <div class="content">
            {@html markdown(content)}
        </div>
    </div>
</div>