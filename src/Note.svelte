<script>
    import { deleteNote } from "./stores"

    export let content;
    export let index;

    var deleteSelf = () => deleteNote(index)
</script>

<style>
    .note {
        border-radius: 1.5em;
        display: flex;
        flex-direction: column;
        height: 23em;
        width: 18em;
        padding: 0;
    }

    .toolbar {
        background-color: #f8fa6f;
        border-radius: 1.5em 1.5em 0 0;
        display: flex;
        align-items: center;
        justify-content: end;
        height: 20%;
        margin: 0;
        padding: 0 1em;
    }
    .toolbar-item {
        list-style-type: none;
        height: 50%;
        
    }    

    .toolbar-item svg {
        min-height: 100%;
        transition: 0.1s;
    }

    .toolbar-item:hover svg {
        transform: scale(1.1);
    }

    .body {
        background-color: #f8fa8b;
        border-radius: 0 0 1.5em 1.5em;
        flex: 1;
        height: 60%;
        padding: 1.2em;
        margin: 0;
    }

    .content {
        height: 100%;
        overflow-y: scroll;
    }
</style>

<article class="note">
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
</article>