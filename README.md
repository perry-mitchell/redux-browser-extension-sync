# Redux Browser-Extension Sync
> Sync Redux state between browser extension components

## Installation
Install by simply executing the following:

```shell
npm install redux-browser-extension-sync --save-dev
```

## About
This library provides a simple toolkit to perform state-sync between different parts of the browser:

 * Background
 * Extension pages
 * Popup

It is not designed to work with content scripts or other areas that do not have access to `chrome.runtime.sendMessage`. This library is supported in the following browsers:

 * Chrome
 * Firefox
 * Opera

## Usage
_TBC_

### Extension requirements
The extension must have a background script for this library to work. The background script, with its Redux store, is the central message bank for all state synchronisations.

It is advisable that you keep the same reducers in _each store_ (tabs, background etc.), otherwise Redux will show warnings about it not finding expected reducer keys. While this is not a show-stopper, it _is_ ugly.

### Manifest requirements
Certain manifest permissions may need to be set before this library can be used. The **tabs** permission, for one, needs to be obtained before communication within this library can take place.

### State requirements
You should be using a clean, **primitive** state structure that supports JSON-style serialisation. The state will regularly be sent between browser tabs and the background script in serialised form.
