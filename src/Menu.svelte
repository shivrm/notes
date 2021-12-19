<script>
    import { appState } from "./stores";

    import { fly } from "svelte/transition";

    var openEditor = () => $appState.editorOpen = true;
    var toggleTheme = () => $appState.theme = $appState.theme == 'light'? 'dark': 'light'
</script>

<style>
    nav {
        /* Makes the element fixed at the bottom right of the screen
         * with a gap between the element and the right edge
         */
        position: fixed;
        bottom: 0;
        right: 0.5em;
    }

    .nav-list {
        /* Makes the element a vertical flexbox */
        display: flex;
        flex-direction: column;
    }

    @media (max-aspect-ratio: 13/16) {
        nav {
            right: unset;
            width: 100%;
        }

        .nav-list {
            padding: 0;
            flex-direction: row-reverse;
            align-items: center;
            justify-content: center;
        }
    }
    .nav-element {
        /* Makes the element square in shape */
        height: max(4vw, 8vh);
        width: max(4vw, 8vh);

        /* Remove list bullets from the element */
        list-style-type: none;
        
        /* Adds a small margin under the element */
        margin-bottom: 0.5em;
    }

    @media (max-aspect-ratio: 13/16) {
        .nav-element {
            margin: 0.25em;

            height: max(12vw, 8vh);
            width: max(12vw, 8vh);
        }
    }

    .nav-element button {
        /* Gives the element fully rounded corners, making it a circle */
        border-radius: 50%;
        
        /* Center the element's children vertically and horizontally */
        display: flex;
        align-items: center;
        justify-content: center;
        
        /* Make the element occupy all of its parent */
        height: 100%;
        width: 100%;
        
        /* Removes the default button outline */
        outline: 0;
        border: none;

        /* Gives the element a bckground color */
        background-color: #397eff;
        
        /* Makes the element take some time to transition */
        transition: 0.2s;
    }

    .nav-element button svg {
        /* Makes the element occupy 90% of its parent */
        height: 90%;
        
        /* Gives the icon a white color */
        color: white;

        /* Makes the element take some time to transition */
        transition: 0.2s;
    }
    .nav-element button:hover {
        /* Slightly enlarges the button when hovered over */
        transform: scale(1.1);
    }
</style>

<nav>
    <ul class="nav-list" transition:fly="{{x:200}}">
        <li class="nav-element">
            <button title="Options" on:click={toggleTheme}>
                {#if $appState.theme == 'light'}
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sun" class="svg-inline--fa fa-sun fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"/></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="moon" class="svg-inline--fa fa-moon fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/></svg>
                {/if}
            </button>
        </li>
        <li class="nav-element" on:click={openEditor}>
            <button title="Add Note">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" class="svg-inline--fa fa-plus fa-w-14" role="img" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg>
            </button>
        </li>
    </ul>
</nav>