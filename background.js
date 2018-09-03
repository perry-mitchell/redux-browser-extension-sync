const {
    REQUEST_TYPE_SYNC_EMITFULL,
    REQUEST_TYPE_SYNC_FULL,
    REQUEST_TYPE_SYNC_TO_BG,
    REQUEST_TYPE_SYNC_TO_TAB,
    canSendAction,
    markActionAsSynchronised
} = require("./shared.js");

function createSyncMiddleware() {
    return () => next => action => {
        if (canSendAction(action)) {
            // mark as having been sync'd
            markActionAsSynchronised(action);
            // send the state update
            sendStateUpdate(action);
        }
        // continue with the next middleware
        next(action);
    };
}

function sendStateUpdate(action) {
    return Promise
        .all([
            new Promise(resolve => chrome.tabs.query({ windowType: "normal" }, tabs => resolve(tabs))),
            new Promise(resolve => chrome.tabs.query({ windowType: "popup" }, tabs => resolve(tabs)))
        ])
        .then(([normalTabs, popupTabs]) => {
            [...normalTabs, ...popupTabs].forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: REQUEST_TYPE_SYNC_TO_TAB,
                    action
                });
            });
        });
}

function syncToStore(store) {
    const { dispatch, getState } = store;
    const handler = (request, sender, sendResponse) => {
        if (!request) {
            return;
        }
        if (request.type === REQUEST_TYPE_SYNC_TO_BG) {
            dispatch(request.action);
        } else if (request.type === REQUEST_TYPE_SYNC_EMITFULL) {
            sendResponse({
                type: REQUEST_TYPE_SYNC_FULL,
                state: getState()
            });
        }
    };
    chrome.runtime.onMessage.addListener(handler);
    return {
        remove: () => chrome.runtime.onMessage.removeListener(handler);
    };
}

module.exports = {
    createSyncMiddleware,
    syncStore
};
