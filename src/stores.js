import { writable, get } from "svelte/store";

// Creates a unique id for each note
const uid = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/* Load notes from localStorage if exists, else initialize it
 * as an empty array
 */
var storedNotes = JSON.parse(
    localStorage.getItem('notes')
) || []

// Shared variable that stores all notes
export const notes = writable(storedNotes)

var notesArr; // Variable used for modifying the notes store
notes.subscribe((value) => {
    // Save notes to localStorage whenever a change occurs
    localStorage.setItem(
        'notes',
        JSON.stringify(value)
    )

    // Update the notesArr value every time the notes store is changes
    notesArr = value;
});

export var getEditNote = () => notesArr[get(appState).editNoteIndex]

// Function to add a new note
export function addNote(noteData) {
    noteData.id = uid() // Generate an ID for the note
    
    var notesCopy = notesArr;
    notesCopy.push(noteData); // Add the new note to the array
    notes.set(notesCopy); // Sets the store to the new value
}

// Function to delete a note, given its index
export function deleteNote(index) {
    var notesCopy = notesArr;
    notesCopy.splice(index, 1) // Remove the note from the copy
    notes.set(notesCopy) // Sets the store to the new value
}

export function editNote(newProps) {
    var index = get(appState).editNoteIndex
    
    var notesCopy = notesArr;
    var note = notesArr[index];

    notesCopy[index] = {...note, ...newProps}
    notes.set(notesCopy)
}

// Variable that stores the current state of the app
export const appState = writable({
    editorOpen: false,
    editNoteIndex: undefined
})