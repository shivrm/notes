import { writable } from "svelte/store";

export const notes = writable([
    {'content': "Note 1"},
    {'content': "Note 2"},
    {'content': "Note 3"},
    {'content': "Note 4"},
    {'content': "Note 5"},
    {'content': "Note 6"}
])

var notesArr;
notes.subscribe((value) => {
    notesArr = value;
});

export function addNote(noteData) {
    var notesCopy = notesArr;
    notesCopy.push(noteData);
    notes.set(notesCopy);
}

export function deleteNote(index) {
    var notesCopy = notesArr;
    notesCopy.splice(index, 1)
    notes.set(notesCopy)
}

export const appState = writable({
    editorOpen: false
})