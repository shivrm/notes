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

// Function which returns the note that is currently being edited 
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

/* Overrides the properties of the note currently being edited,
 * given a object containing properties to override
 */
export function editNote(newProps) {
    // Variable that stores the index of the note being edited
    var index = get(appState).editNoteIndex
    
    var notesCopy = notesArr;   // Create a copy of the notes
    var note = notesArr[index]; // The note being edited

    // Override the old props of the note with the new props
    notesCopy[index] = {...note, ...newProps}
    notes.set(notesCopy) // Set the store to the new value
}

export const noteColors = [
    '#FBFF90',
    '#FFC57E',
    '#A6FF95',
    '#74F3FF',
    '#9D8BFF',
    '#FF9EFF',
    '#FF8787'
]

export const fontStyles = [
    'Roboto',
    'Fuzzy Bubbles',
    'Roboto Mono',
    'Bad Script',
    'Anton'
]

// Variable that stores the current state of the app
export const appState = writable({
    editorOpen: false,          // If the note editor is open
    editNoteIndex: undefined,   // The index of the note being edited

    optionsOpen: false
})