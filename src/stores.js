import { writable } from "svelte/store";

export const notes = writable([
    {'content': "Note 1"},
    {'content': "Note 2"},
    {'content': "Note 3"},
    {'content': "Note 4"},
    {'content': "Note 5"},
    {'content': "Note 6"}
])