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
    }
</style>

<div class="options-menu">
    <ul class="options-list">
        <li on:click={closeMenu}>
            Close List
        </li>
        <li>
            Change Default Note Color
        </li>
        <li>
            Change Theme
        </li>
        <li>
            Export as JSON
        </li>
        <li>
            Import as JSON
        </li>
    </ul>
</div>
