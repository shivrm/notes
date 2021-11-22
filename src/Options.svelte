<script>
    import { appState } from "./stores";

    var closeMenu = () => $appState.optionsOpen = false;
</script>

<style>
    .options-menu {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50%;

        background-color: turquoise;
    }
</style>

<div class="options-menu">
    <ul class="options-list">
        <li on:click={closeMenu}>
            <button>
                Close List
            </button>
        </li>
        <li>
            <button>
                Change Note Color
            </button>
        </li>
        <li>
            <button>
                Change Theme
            </button>
        </li>
        <li>
            <button>
                Export As JSON
            </button>
        </li>
        <li>
            <button>
                Import JSON
            </button>
        </li>
    </ul>
</div>
