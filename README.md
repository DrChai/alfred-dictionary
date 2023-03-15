# alfred-dictionary

Alfred workflow for online dictionary and translation. 
This lightweight module, based on [Alfy](https://github.com/sindresorhus/alfy), 
supports multiple online dictionaries(Google translation, Urban Dictionary...). 
Provides text-to-speech (TTS) functionality if available. 
Also supports translating current words in cursor selection and viewing related definitions and example sentences.

## Features

- Lookup words and phrases in multiple online dictionaries and translate engines, including 
  - Google Translation
  - Urban Dictionary
  - Google Cloud Translation API(`google api key` required)
  - Linguee(limited)
- double <kbd>⌘ cmd</kbd> to translate current words in cursor selection.
- View related definitions and example sentences when translating a word or phrase.
- Use TTS to have the word or phrase spoken aloud, with support for the following engines(currently):
    - Google Translation
- update this workflow with [alfred-updater](https://github.com/SamVerschueren/alfred-updater).

## Installation
Requires [Node.js](https://nodejs.org).
Make sure you have [Alfred Powerpack](https://www.alfredapp.com/) 4+ installed. 
Then, install the package using npm:

`npm install -g alfred-dictionary`

## Commends
- <kbd>⏎</kbd> Copy translated text to clipboard.
- <kbd>⌘</kbd> + <kbd>⏎</kbd> View in related website in your default browser.
- <kbd>⇧</kbd> + <kbd>⏎</kbd> Speak input text when TTS available.
- <kbd>⌥</kbd> + <kbd>⏎</kbd> Speak translated text when TTS available.

## Usage
After installing, type `-set` to prompt configuration. Available options will be displayed in the view. 
You can update the configuration at any time.

## License

MIT © [Ed Chai](https://github.com/DrChai)