"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageHistory = exports.NavEditCommands = void 0;
const dispose_1 = require("../utils/dispose");
const pathUtil_1 = require("../utils/pathUtil");
var NavEditCommands;
(function (NavEditCommands) {
    NavEditCommands[NavEditCommands["DISABLE_BACK"] = 0] = "DISABLE_BACK";
    NavEditCommands[NavEditCommands["ENABLE_BACK"] = 1] = "ENABLE_BACK";
    NavEditCommands[NavEditCommands["DISABLE_FORWARD"] = 2] = "DISABLE_FORWARD";
    NavEditCommands[NavEditCommands["ENABLE_FORWARD"] = 3] = "ENABLE_FORWARD";
})(NavEditCommands = exports.NavEditCommands || (exports.NavEditCommands = {}));
class PageHistory extends dispose_1.Disposable {
    constructor() {
        super(...arguments);
        this._history = new Array();
        this._backstep = 0;
        this._current_back_enabled = false;
        this._current_forward_enabled = false;
    }
    /**
     * @returns the current state of the back/forward buttons
     */
    get currentCommands() {
        const action = new Array();
        if (this._current_back_enabled) {
            action.push(NavEditCommands.ENABLE_BACK);
        }
        else {
            action.push(NavEditCommands.DISABLE_BACK);
        }
        if (this._current_forward_enabled) {
            action.push(NavEditCommands.ENABLE_FORWARD);
        }
        else {
            action.push(NavEditCommands.DISABLE_FORWARD);
        }
        return action;
    }
    /**
     * @description manipulates the history to adjust for going forwards.
     * @returns {INavResponse} the state of the back/foward buttons as a result of going forwards.
     */
    goForward() {
        const action = new Array();
        if (this._backstep > 0) {
            const path = this._history[this._backstep - 1];
            this._backstep -= 1;
            // if we reached 0, this means we can't go forwards anymore
            if (this._backstep == 0) {
                action.push(NavEditCommands.DISABLE_FORWARD);
                this._current_forward_enabled = false;
            }
            // if reached the second-last entry, we can now go backwards
            if (this._backstep == this._history.length - 2) {
                action.push(NavEditCommands.ENABLE_BACK);
                this._current_back_enabled = true;
            }
            return { actions: action, address: path };
        }
        else {
            return { actions: action };
        }
    }
    /**
     * @description manipulates the history to adjust for going backwards.
     * @returns {INavResponse} the state of the back/foward buttons as a result of going backwards.
     */
    goBackward() {
        const action = new Array();
        if (this._backstep < this._history.length - 1) {
            const path = this._history[this._backstep + 1];
            this._backstep += 1;
            // if we reached the last entry, we can't go back any more
            if (this._backstep == this._history.length - 1) {
                action.push(NavEditCommands.DISABLE_BACK);
                this._current_back_enabled = false;
            }
            // if we reached 1, we can now go forwards
            if (this._backstep == 1) {
                action.push(NavEditCommands.ENABLE_FORWARD);
                this._current_forward_enabled = true;
            }
            return { actions: action, address: path };
        }
        else {
            return { actions: action };
        }
    }
    /**
     * @description Add an address to the history. Will not add it if it identical to the previous entry.
     * Stores all directory pathnames without `/` at the end, as allowing for a mix of both
     * causes redirection that makes history tracking tricky.
     * @param {string} address the address to add.
     * @param {Connection} connection the connection to connect using
     * @returns {INavResponse | undefined} the state of the back/fowards buttons after adding the item.
     */
    addHistory(address, connection) {
        address = pathUtil_1.PathUtil.ConvertToPosixPath(address);
        address = pathUtil_1.PathUtil.EscapePathParts(address);
        const action = new Array();
        const lastItem = this._history[this._backstep];
        if (this._backstep < this._history.length &&
            address === lastItem.path &&
            connection === lastItem.connection) {
            // if this is the same as the last entry or is a
            // redirect of the previous, don't add to history
            return undefined;
        }
        if (this._backstep > 0) {
            this._history = this._history.slice(this._backstep);
        }
        if (this._history.length == 1) {
            action.push(NavEditCommands.ENABLE_BACK);
            this._current_back_enabled = true;
        }
        this._history.unshift({ path: address, connection });
        this._backstep = 0;
        action.push(NavEditCommands.DISABLE_FORWARD);
        this._current_forward_enabled = false;
        return { actions: action };
    }
}
exports.PageHistory = PageHistory;
//# sourceMappingURL=pageHistoryTracker.js.map