<script>
    import { appState } from "./stores";

    import { fly } from "svelte/transition";

    var openEditor = () => $appState.editorOpen = true;
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

    .nav-element {
        /* Makes the element square in shape */
        height: 5vw;
        width: 5vw;

        /* Remove list bullets from the element */
        list-style-type: none;
        
        /* Adds a small margin under the element */
        margin-bottom: 0.5em;
    }

    @media (max-aspect-ratio: 13/16) {
        .nav-element {
            height: 15vw;
            width: 15vw;
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

    .nav-element button:hover svg {
        /* Makes the icon rotate when its parent is hovered */
        transform: rotate(90deg);
    }
</style>

<nav>
    <ul class="nav-list" transition:fly="{{x:200}}">
        <li class="nav-element">
            <button title="Options">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cog" class="svg-inline--fa fa-cog fa-w-16" role="img" viewBox="0 0 512 512"><path fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/></svg>
            </button>
        </li>
        <li class="nav-element" on:click={openEditor}>
            <button title="Add Note">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" class="svg-inline--fa fa-plus fa-w-14" role="img" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg>
            </button>
        </li>
    </ul>
</nav>