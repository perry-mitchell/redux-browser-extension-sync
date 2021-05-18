const ACTION_BLACKLIST = /^@@/;
const ACTION_SYNC_PROP = "@@actionSync";
const ACTION_TYPE_SET_STATE = "@@reduxBrowserSync/setState";
const REQUEST_TYPE_SYNC_EMITFULL = "@@reduxBrowserSync/syncReqEmitFull";
const REQUEST_TYPE_SYNC_FULL = "@@reduxBrowserSync/syncFullToTab";
const REQUEST_TYPE_SYNC_TO_BG = "@@reduxBrowserSync/syncToBg";
const REQUEST_TYPE_SYNC_TO_TAB = "@@reduxBrowserSync/syncToTab";

let __actionCounter = 0,
    __lastActionedError = null;

function canSendAction(action) {
    if (action && ACTION_BLACKLIST.test(action.type)) {
        // Don't sync blacklisted actions
        return false;
    }
    return typeof action[ACTION_SYNC_PROP] !== "number";
}

function handleSendMessageResponse(response) {
    if (typeof response === "undefined" && chrome.runtime.lastError) {
        const lastError = chrome.runtime.lastError;
        if (lastError.message !== __lastActionedError) {
            __lastActionedError = lastError.message;
            throw new Error(`Redux state sync failed: ${__lastActionedError}`);
        }
    }
}

function markActionAsSynchronised(action) {
    // Store count on action prop
    action[ACTION_SYNC_PROP] = __actionCounter;
    __actionCounter += 1;
}

module.exports = {
    ACTION_TYPE_SET_STATE,
    REQUEST_TYPE_SYNC_EMITFULL,
    REQUEST_TYPE_SYNC_FULL,
    REQUEST_TYPE_SYNC_TO_BG,
    REQUEST_TYPE_SYNC_TO_TAB,
    canSendAction,
    handleSendMessageResponse,
    markActionAsSynchronised
};
