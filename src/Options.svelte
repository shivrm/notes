<script>
    import { appState } from "./stores";

    import { fly } from "svelte/transition";

    var closeMenu = () => $appState.optionsOpen = false;
</script>

<style>
    .options-menu {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50%;

        background-color: #397eff;
    }

    .options-list {
        display: grid;
        place-items: center;
        grid-template-columns: repeat(3, 1fr);
        
        grid-gap: 0em 0em;

        padding: 1em 10vw;
    }

    .option {
        border-radius: 1em;

        height: min(20vh, 30vw);
        width: min(20vh, 30vw);

        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        transition: 0.2s;
    }

    .option button {
        height: min(8vh, 8vw);
        width: min(8vh, 8vw);
    
        background-color: transparent;
        border: none;
        outline: none;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    .option button svg {
        color: white;
    }

    .option:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
    }

    .option span {
        text-align: center;
        font-size: 1em;

        height: 20%;
        color: white;
    }
</style>

<div class="options-menu" transition:fly="{{y: 1000}}">
    <ul class="options-list">
        <li class="option">
            <button>
            </button>
            <span>Change Theme</span>
        </li>
        <li class="option">
            <button>
            </button>
            <span>Default Note Color</span>
        </li>
        <li class="option" on:click={closeMenu}>
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11" role="img" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>
            </button>
            <span>Close Menu</span>
        </li>
        <li class="option">
            <button>
            </button>
            <span>Export As JSON</span>
        </li>
        <li class="option">
            <button>
            </button>
            <span>Import JSON</span>
        </li>
    </ul>
</div>
