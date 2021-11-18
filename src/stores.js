import { writable } from "svelte/store";

const uid = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

var storedNotes = JSON.parse(
    localStorage.getItem('notes')
) || []

export const notes = writable(storedNotes)

var notesArr;
notes.subscribe((value) => {
    localStorage.setItem(
        'notes',
        JSON.stringify(value)
    )

    notesArr = value;
});

export function addNote(noteData) {
    noteData.id = uid()
    
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