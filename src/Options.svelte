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
        grid-template-columns: repeat(3, 1fr);
        
        grid-gap: 2em 0em;

        padding: 1em 10%;
    }

    .option {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .option button {
        height: 8vh;
        width: 8vh;
    }

    .option span {
        text-align: center;
        font-size: 1em;

        height: 20%;
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
            <button></button>
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
