"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerTaskTerminal = void 0;
const vscode = __importStar(require("vscode"));
const dispose_1 = require("../utils/dispose");
const terminalStyleUtil_1 = require("../utils/terminalStyleUtil");
const utils_1 = require("../utils/utils");
const serverTaskProvider_1 = require("./serverTaskProvider");
const CHAR_CODE_CTRL_C = 3;
/**
 * @description the pseudoterminal associated with the Live Preview task.
 */
class ServerTaskTerminal extends dispose_1.Disposable {
    constructor(_reporter, _workspace, _executeServer = true) {
        super();
        this._reporter = _reporter;
        this._workspace = _workspace;
        this._executeServer = _executeServer;
        this.running = false;
        // This object will request to open and close the server, so its parent
        // must listen for these requests and act accordingly.
        this._onRequestToOpenServerEmitter = this._register(new vscode.EventEmitter());
        this.onRequestToOpenServer = this._onRequestToOpenServerEmitter.event;
        this._onRequestToCloseServerEmitter = this._register(new vscode.EventEmitter());
        this.onRequestToCloseServer = this._onRequestToCloseServerEmitter.event;
        // `writeEmitter` and `closeEmitter` are inherited from the pseudoterminal.
        this._onDidWrite = new vscode.EventEmitter();
        this.onDidWrite = this._onDidWrite.event;
        this._onDidClose = new vscode.EventEmitter();
        this.onDidClose = this._onDidClose.event;
        if (this._executeServer) {
            /* __GDPR__
                "tasks.terminal.start" : {}
            */
            this._reporter.sendTelemetryEvent('tasks.terminal.start');
        }
    }
    open() {
        // At this point we can start using the terminal.
        if (this._executeServer) {
            this.running = true;
            this._onDidWrite.fire(vscode.l10n.t('Opening Server...') + '\r\n');
            this._onRequestToOpenServerEmitter.fire(this._workspace);
        }
        else {
            this._onDidWrite.fire(vscode.l10n.t('serverAlreadyRunning', 'Server already running in another task. Closing now.') + '\r\n');
            this.close();
        }
    }
    close() {
        this.running = false;
        if (this._executeServer) {
            this._onRequestToCloseServerEmitter.fire(this._workspace);
            this._onDidClose.fire(0);
        }
        else {
            this._onDidClose.fire(1);
        }
    }
    handleInput(data) {
        if (data.length > 0 && data.charCodeAt(0) == CHAR_CODE_CTRL_C) {
            this._onDidWrite.fire(vscode.l10n.t('Closing the server...') + '\r\n');
            this._onRequestToCloseServerEmitter.fire(this._workspace);
        }
    }
    /**
     * @description called by the parent to notify that the server has started (or was already started) successfully and the task can now start.
     * @param {vscode.Uri} externalUri the address of the server index.
     * @param {ServerStartedStatus} status tells the terminal whether the server started because of the task or not.
     */
    serverStarted(externalUri, status) {
        const formattedAddress = this._formatAddr(externalUri.toString());
        switch (status) {
            case serverTaskProvider_1.ServerStartedStatus.JUST_STARTED: {
                this._onDidWrite.fire(vscode.l10n.t('Started Server on {0}', formattedAddress + '\r\n'));
                break;
            }
            case serverTaskProvider_1.ServerStartedStatus.STARTED_BY_EMBEDDED_PREV: {
                this._onDidWrite.fire(vscode.l10n.t('Server already on at {0}', formattedAddress + '\r\n> '));
                break;
            }
        }
        this._onDidWrite.fire(vscode.l10n.t('Type {0} to close the server.', terminalStyleUtil_1.TerminalStyleUtil.ColorTerminalString(`CTRL+C`, terminalStyleUtil_1.TerminalColor.red, terminalStyleUtil_1.TerminalDeco.bold)) + '\r\n\r\n> ');
    }
    /**
     * @description Called by the parent to tell the terminal that the server has stopped. May have been a result of the task ending or the result of a manual server shutdown.
     */
    serverStopped() {
        this._onDidWrite.fire(vscode.l10n.t('Server stopped. Bye!') + '\n');
        this.close();
    }
    /**
     * Called the parent to tell the terminal that is it safe to end the task, but the server will continue to be on to support the embedded preview. This will end the task.
     */
    serverWillBeStopped() {
        this._onDidWrite.fire(vscode.l10n.t(`This task will finish now, but the server will stay on since you've used the embedded preview recently.`) + '\r\n');
        this._onDidWrite.fire(terminalStyleUtil_1.TerminalStyleUtil.ColorTerminalString(vscode.l10n.t("Run 'Live Preview: Stop Server' in the command palette to close the server and close any previews.") + '\r\n\r\n', terminalStyleUtil_1.TerminalColor.yellow));
        this.close();
    }
    /**
     * @param {IServerMsg} msg the log message data from the HTTP server to show in the terminal
     */
    showServerMsg(msg) {
        const date = new Date();
        this._onDidWrite.fire(`[${(0, utils_1.FormatDateTime)(date, ' ')}] ${msg.method}: ${terminalStyleUtil_1.TerminalStyleUtil.ColorTerminalString(decodeURI(msg.url), terminalStyleUtil_1.TerminalColor.blue)} | ${this._colorHttpStatus(msg.status)}\r\n> `);
    }
    /**
     * @param {number} status the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) sent by the server
     * @returns {string} the styled terminal string (red, yellow, or green).
     */
    _colorHttpStatus(status) {
        let color = terminalStyleUtil_1.TerminalColor.green;
        if (status >= 400) {
            color = terminalStyleUtil_1.TerminalColor.red;
        }
        else if (status >= 300) {
            color = terminalStyleUtil_1.TerminalColor.yellow;
        }
        return terminalStyleUtil_1.TerminalStyleUtil.ColorTerminalString(status.toString(), color);
    }
    /**
     * @param {string} str string to test
     * @returns {number} location of the second colon, used to find the colon before the port number.
     */
    _getSecondColonPos(str) {
        const indexColon = str.indexOf(':');
        if (indexColon == -1) {
            return str.length;
        }
        const indexSecondColon = str.indexOf(':', indexColon + 1);
        return indexSecondColon == -1 ? str.length : indexSecondColon;
    }
    /**
     * @param {string} addr web address to format
     * @returns {string} `addr` with base address colored blue and port number colored purple.
     */
    _formatAddr(addr) {
        const indexSecondColon = this._getSecondColonPos(addr);
        const firstHalfOfString = addr.substring(0, indexSecondColon);
        const lastHalfOfString = addr.substring(indexSecondColon);
        return (terminalStyleUtil_1.TerminalStyleUtil.ColorTerminalString(firstHalfOfString, terminalStyleUtil_1.TerminalColor.blue, terminalStyleUtil_1.TerminalDeco.bold) +
            terminalStyleUtil_1.TerminalStyleUtil.ColorTerminalString(lastHalfOfString, terminalStyleUtil_1.TerminalColor.purple, terminalStyleUtil_1.TerminalDeco.bold));
    }
}
exports.ServerTaskTerminal = ServerTaskTerminal;
//# sourceMappingURL=serverTaskTerminal.js.map