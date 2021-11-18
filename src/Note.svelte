<script>
    import { deleteNote } from "./stores"
    
    import { fade } from "svelte/transition";
    
    export let content;
    export let index;
    
    var deleteSelf = () => deleteNote(index)
</script>

<style>
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
    .toolbar-item {
        /* Removes list bullets from the element */
        list-style-type: none;
        
        /* Sets the element's height */
        height: 50%;
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
        
        /* Gives the element a background color */
        background-color: #f8fa8b;
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

<ul class="toolbar">
    <li class="toolbar-item" title="Delete this Note" on:click={deleteSelf}>
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash" class="svg-inline--fa fa-trash fa-w-14" role="img" viewBox="0 0 448 512"><path fill="currentColor" d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"/></svg>
    </li>
</ul>
<div class="body">
    <div class="content">
        {content}
    </div>
</div>