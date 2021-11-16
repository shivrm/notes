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
        border-radius: 1.5em 1.5em 0 0;
        height: 20%;
        background-color: #f8fa6f;
        margin: 0;
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
    </ul>
    <div class="body">
        <div class="content">
            {content}
        </div>
    </div>
</article>