const {
    ACTION_TYPE_SET_STATE,
    REQUEST_TYPE_SYNC_EMITFULL,
    REQUEST_TYPE_SYNC_FULL,
    REQUEST_TYPE_SYNC_TO_BG,
    REQUEST_TYPE_SYNC_TO_TAB,
    canSendAction,
    handleSendMessageResponse,
    markActionAsSynchronised
} = require("./shared.js");

function createSyncReducer(rootReducer) {
    return (state, action) => {
        if (action.type === ACTION_TYPE_SET_STATE) {
            // reset global state
            state = action.payload;
        }
        return rootReducer(state, action);
    };
}

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
    chrome.runtime.sendMessage(
        {
            type: REQUEST_TYPE_SYNC_TO_BG,
            action
        },
        undefined,
        handleSendMessageResponse
    );
}

function syncStore(store) {
    const { dispatch } = store;
    const handler = request => {
        if (!request) {
            return;
        }
        if (request.type === REQUEST_TYPE_SYNC_TO_TAB) {
            dispatch(request.action);
        }
    };
    chrome.runtime.onMessage.addListener(handler);
    chrome.runtime.sendMessage({ type: REQUEST_TYPE_SYNC_EMITFULL }, resp => {
        handleSendMessageResponse(resp);
        if (resp.type !== REQUEST_TYPE_SYNC_FULL) {
            throw new Error(`Invalid response type: Expected full-sync: ${resp.type}`);
        }
        dispatch({
            type: ACTION_TYPE_SET_STATE,
            payload: resp.state
        });
    });
    return store;
}

module.exports = {
    createSyncReducer,
    createSyncMiddleware,
    syncStore
};
