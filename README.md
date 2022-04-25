# Notes with Svelte

A web app made with Svelte that allows you to create notes

Want to suggest a feature or report a bug? Click [here](https://github.com/shivrm/notes/issues/new).

## Features
 - [x] Allows the user to create an almost unlimited amount of notes (limited only by the size of `localStorage`)
 - [x] Provides an in-built editor which supports both plaintext and markdown
 - [x] Allows the user to set a custom background color and font from a list of predefined values
 - [x] Allows the user to switch between light mode and dark mode

### Upcoming
 - [ ] Keyboard shortcuts such as <kbd>Ctrl</kbd> + <kbd>N</kbd> to create notes
 - [ ] Introductory notes to show new users how to use the app.
 - [ ] More themes, such as **Solarized** and **Midnight**
 - [ ] Rearrangable notes

## How to use
 
 You can use the app either by visiting the [GitHub Pages deployment](https://shivram.ml/notes) or by building it yourself.

### Building the app
1. Clone the repo by running: `git clone https://github.com/shivrm/notes.git notes`

2. Navigate to the project directory using `cd notes`

3. Switch to a branch of your liking: 
	- `git checkout main` for the latest stable release.
	- `git checkout dev` for the development version.

4. Build the app using `npm run build`. The build files will be available in the `/public` folder.

5. Alternatively, use `npm run dev` to run the development server, useful for testing your own code.

## Usage

### Menu Buttons

The menu on the bottom-left corner (bottom-middle on vertical displays) contains two buttons:

 - The Theme button, indicated by either a `☀`Sun or a `🌕` Moon icon is used for changing the theme. Click on it to toggle the theme from dark mode to light, or vice versa.

 - The Add button, indicated by the `➕`Plus icon is used for adding notes. Clicking on it will open the Note Editor

### Note Editor

The Note Editor has three points of interest: the main editor, as well as a font and color picker.

 - **The main editor** is in the shape of a note. It is focused by default when the editor is opened. The text you type in it will be displayed on the note

 - **The font picker** is located to the left of the main editor (top of the main editor on vertical displays). It contains five fonts to choose from. Clicking on a font will change the current font to it.

 - **The color picker** is located to the right of the main editor (bottom of the main editor on vertical displays). It contains seven colors to choose from. Clicking on a color will change the background color of the note.

 - **The Add/Edit Note** button is located at the bottom of the editor. When adding a note, clicking it will create a new note. When editing a note, clicking on it will cause the edits to be applied. This will always close the editor window.

 - **Closing the editor**: The editor can be closed either by clicking on the blank space around it, or by pressing the <kbd>Esc</kbd> Escape key.

### Notes

Each note has two buttons on top of it:

 - The **Edit** button, indicated by the `📝`memo icon, is used to edit a note. When clicked, it opens the Note Editor.

 - The **Delete** button, indicated by the `🗑`wastebasket icon, is used to delete a note. Clicking it will immediately delete the note.

## License

Licensed under the [MIT](https://github.com/shivrm/notes/blob/main/LICENSE) License.

 - You can modify the code as you please, without any limitations.
 - You can use it for private and commercial purposes, without restrictions
 - You are requested to include a copy of the license and copyright whenever you distribute this code
 - You are liable for any damages caused due to usage of this code (Use it at your own risk!)
 - There is no warranty that the code will work.
