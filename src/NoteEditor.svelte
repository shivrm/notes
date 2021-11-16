<style>
    .note-editor-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
    }

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

    .body {
        background-color: #f8fa8b;
        border-radius: 0 0 1.5em 1.5em;
        flex: 1;
        height: 60%;
        padding: 1.2em;
        margin: 0;
    }

    #note-text {
        background: transparent;
        outline: none;
        border: none;
    }

    .action {
        border-radius: 100px;
        outline: none;
        margin: 2em;
        padding: 1em 3em;
    }
</style>

<section class="note-editor-container">
    <article class="note">
        <ul class="toolbar">
        </ul>
        <div class="body">
            <textarea id="note-text" cols="30" rows="10"></textarea>
        </div>
    </article>
    <button class="action">
        Add Note
    </button>
</section>