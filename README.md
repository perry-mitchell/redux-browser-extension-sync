# Redux Browser-Extension Sync
> Sync Redux state between browser extension components

[![Build Status](https://travis-ci.org/perry-mitchell/redux-browser-extension-sync.svg?branch=master)](https://travis-ci.org/perry-mitchell/redux-browser-extension-sync)

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
To sync state between your stores in different parts of your application/extension, you should first initialise the **background** store with the required middleware:

```javascript
import { applyMiddleware, createStore } from "redux";
import { createSyncMiddleware, syncStore } from "redux-browser-extension-sync/background";
import rootReducer from "../reducers/index.js";

const syncMiddleware = createSyncMiddleware();

const store = syncStore(createStore(
    rootReducer,
    applyMiddleware(syncMiddleware)
));
```

The synchronisation is performed by connecting to the store in 2 phases:

 * `createSyncMiddleware` - Middleware that watches for dispatched actions on the store, and transmits these to other tabs
 * `syncStore` - Store enhancement to dispatch received actions on the store

When the background script initialises, the store and its sync enhancements will be ready and waiting for tabs or popups to connect.

To initialise the stores of popups or tabs, the same process followed, with 1 addition: a sync reducer. This reducer wraps the extension's root reducer, allowing it to set state:

```javascript
import { combineReducers } from "redux";
import { createSyncReducer } from "redux-browser-extension-sync";
import notes from "./notes.js";
import searchResults from "./searchResults.js";

const appReducer = combineReducers({
    notes,
    searchResults
});

export default createSyncReducer(appReducer);
```

Once this reducer is set-up, similar store connections as with the background store can be made:

```javascript
import { applyMiddleware, createStore } from "redux";
import { createSyncMiddleware, syncStore } from "redux-browser-extension-sync";
import rootReducer from "../reducers/index.js";

const syncMiddleware = createSyncMiddleware();

const store = syncStore(createStore(
    rootReducer,
    applyMiddleware(syncMiddleware)
));
```

That's all that's required to connect the Redux stores and their state. This library uses Chrome messaging APIs to send the state between extension components (API methods are compatible across supported browsers).

**Disclaimer**: It is not recommended to store sensitive information in any store synchronised using this library.

### Extension requirements
The extension must have a background script for this library to work. The background script, with its Redux store, is the central message bank for all state synchronisations.

It is advisable that you keep the same reducers in _each store_ (tabs, background etc.), otherwise Redux will show warnings about it not finding expected reducer keys. While this is not a show-stopper, it _is_ ugly.

### Manifest requirements
Certain manifest permissions may need to be set before this library can be used. The **tabs** permission, for one, needs to be obtained before communication within this library can take place.

### State requirements
You should be using a clean, **primitive** state structure that supports JSON-style serialisation. The state will regularly be sent between browser tabs and the background script in serialised form.
