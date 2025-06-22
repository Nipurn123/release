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
exports.ServerGrouping = void 0;
const vscode = __importStar(require("vscode"));
const net = __importStar(require("net"));
const dispose_1 = require("../utils/dispose");
const wsServer_1 = require("./wsServer");
const httpServer_1 = require("./httpServer");
const settingsUtil_1 = require("../utils/settingsUtil");
const constants_1 = require("../utils/constants");
const serverTaskProvider_1 = require("../task/serverTaskProvider");
class ServerGrouping extends dispose_1.Disposable {
    constructor(_extensionUri, _reporter, _endpointManager, _connection, _serverTaskProvider, _pendingServerWorkspaces) {
        super();
        this._connection = _connection;
        this._serverTaskProvider = _serverTaskProvider;
        this._pendingServerWorkspaces = _pendingServerWorkspaces;
        this._isServerOn = false;
        // on each new request processed by the HTTP server, we should
        // relay the information to the task terminal for logging.
        this._onNewReqProcessed = this._register(new vscode.EventEmitter());
        this.onNewReqProcessed = this._onNewReqProcessed.event;
        this._onClose = this._register(new vscode.EventEmitter());
        this.onClose = this._onClose.event;
        this._onShouldLaunchExternalPreview = this._register(new vscode.EventEmitter());
        this.onShouldLaunchExternalPreview = this._onShouldLaunchExternalPreview.event;
        this._onShouldLaunchEmbeddedPreview = this._register(new vscode.EventEmitter());
        this.onShouldLaunchEmbeddedPreview = this._onShouldLaunchEmbeddedPreview.event;
        this._httpServer = this._register(new httpServer_1.HttpServer(_extensionUri, _reporter, _endpointManager, _connection));
        this._wsServer = this._register(new wsServer_1.WSServer(_reporter, _endpointManager, _connection));
        this._register(this._httpServer.onNewReqProcessed((e) => {
            this._serverTaskProvider.sendServerInfoToTerminal(e, this._connection.workspace);
            this._onNewReqProcessed.fire(e);
        }));
        this._connection.onConnected((e) => {
            this._serverTaskProvider.serverStarted(e.httpURI, serverTaskProvider_1.ServerStartedStatus.JUST_STARTED, this._connection.workspace);
            if (this._pendingLaunchInfo) {
                if (this._pendingLaunchInfo.external) {
                    this._onShouldLaunchExternalPreview.fire({
                        uri: this._pendingLaunchInfo.uri,
                        debug: this._pendingLaunchInfo.debug,
                        connection: this._connection,
                    });
                }
                else {
                    this._onShouldLaunchEmbeddedPreview.fire({
                        uri: this._pendingLaunchInfo.uri,
                        panel: this._pendingLaunchInfo.panel,
                        connection: this._connection,
                    });
                }
                this._pendingLaunchInfo = undefined;
            }
        });
    }
    get connection() {
        return this._connection;
    }
    get port() {
        return this._connection.httpPort;
    }
    get workspace() {
        return this._connection.workspace;
    }
    /**
     * @returns {boolean} whether the servers are on.
     */
    get isRunning() {
        return this._isServerOn;
    }
    refresh() {
        this._wsServer.refreshBrowsers();
    }
    /**
     * @description close the server instances.
     */
    closeServer() {
        if (this.isRunning) {
            this._httpServer.close();
            this._wsServer.close();
            this._isServerOn = false;
            this._serverTaskProvider.serverStop(true, this._connection.workspace);
            this._showServerStatusMessage('Server Stopped');
            this._onClose.fire();
            if (this._serverTaskProvider.isTaskRunning(this._connection.workspace)) {
                // stop the associated task
                this._serverTaskProvider.serverStop(true, this._connection.workspace);
            }
            this._connection.dispose();
            return true;
        }
        return false;
    }
    /**
     * @description open the server instances.
     * @param {number} port the port to try to start the HTTP server on.
     * @returns {boolean} whether the server has been started correctly.
     */
    async openServer() {
        var _a, _b, _c;
        if (this._pendingServerWorkspaces.has((_a = this.workspace) === null || _a === void 0 ? void 0 : _a.uri.toString())) {
            // server is already being opened for this, don't try to open another one
            return;
        }
        const port = this._connection.httpPort;
        this._pendingServerWorkspaces.add((_b = this.workspace) === null || _b === void 0 ? void 0 : _b.uri.toString());
        if (!this.isRunning) {
            const freePort = await this._findFreePort(port);
            await Promise.all([this._httpServer.start(freePort), this._wsServer.start(freePort + 1)]).then(() => {
                this._connected();
            });
        }
        this._pendingServerWorkspaces.delete((_c = this.workspace) === null || _c === void 0 ? void 0 : _c.uri.toString());
    }
    /**
     * Opens the preview in an external browser.
     * @param {boolean} debug whether or not to run in debug mode.
     * @param {string} file the filesystem uri to open in the preview.
     */
    async showPreviewInExternalBrowser(debug, file) {
        if (!this._serverTaskProvider.isTaskRunning(this._connection.workspace)) {
            if (!this.isRunning) {
                // set the pending launch info, which will trigger once the server starts in `launchFileInExternalPreview`
                this._pendingLaunchInfo = {
                    external: true,
                    uri: file,
                    debug: debug,
                    connection: this._connection,
                };
            }
            else {
                this._onShouldLaunchExternalPreview.fire({
                    uri: file,
                    debug,
                    connection: this._connection,
                });
            }
            if (this._serverTaskProvider.runTaskWithExternalPreview &&
                vscode.workspace.workspaceFolders &&
                vscode.workspace.workspaceFolders.length > 0) {
                await this._serverTaskProvider.extRunTask(this._connection.workspace);
            }
            else {
                await this.openServer();
            }
        }
        else {
            this._onShouldLaunchExternalPreview.fire({
                uri: file,
                debug,
                connection: this._connection,
            });
        }
    }
    /**
     * Creates an (or shows the existing) embedded preview.
     * @param {vscode.WebviewPanel} panel the panel, which may have been serialized from a previous session.
     * @param {string} file the filesystem path to open in the preview.
     * @param {boolean} relative whether the path was absolute or relative to the current workspace.
     * @param {boolean} debug whether to run in debug mode (not implemented).
     */
    async createOrShowEmbeddedPreview(panel = undefined, file, debug = false) {
        if (!this.isRunning) {
            // set the pending launch info, which will trigger once the server starts in `launchFileInEmbeddedPreview`
            this._pendingLaunchInfo = {
                external: false,
                panel: panel,
                uri: file,
                debug: debug,
                connection: this._connection,
            };
            await this.openServer();
        }
        else {
            this._onShouldLaunchEmbeddedPreview.fire({
                uri: file,
                panel,
                connection: this._connection,
            });
        }
    }
    /**
     * Find the first free port following (or on) the initial port configured in settings
     * @param startPort the port to start the check on
     * @param callback the callback triggerred when a free port has been found.
     */
    async _findFreePort(startPort) {
        return new Promise((resolve) => {
            let port = startPort;
            const sock = new net.Socket();
            const host = this._connection.host;
            sock.setTimeout(500);
            sock.on('connect', function () {
                sock.destroy();
                port++;
                sock.connect(port, host);
            });
            sock.on('error', function (e) {
                resolve(port);
            });
            sock.on('timeout', function () {
                resolve(port);
            });
            sock.connect(port, host);
        });
    }
    /**
     * @description called when both servers are connected. Performs operations to update server status.
     */
    async _connected() {
        this._isServerOn = true;
        this._showServerStatusMessage(vscode.l10n.t('Server Started on Port {0}', this._connection.httpPort));
        await this._connection.connected();
    }
    /**
     * @description show messages related to server status updates if configured to do so in settings.
     * @param messsage message to show.
     */
    _showServerStatusMessage(messsage) {
        if (settingsUtil_1.SettingUtil.GetConfig().showServerStatusNotifications) {
            vscode.window
                .showInformationMessage(messsage, constants_1.DONT_SHOW_AGAIN)
                .then(async (selection) => {
                if (selection == constants_1.DONT_SHOW_AGAIN) {
                    await settingsUtil_1.SettingUtil.UpdateSettings(settingsUtil_1.Settings.showServerStatusNotifications, false, vscode.ConfigurationTarget.Global);
                }
            });
        }
    }
    dispose() {
        this.closeServer();
    }
}
exports.ServerGrouping = ServerGrouping;
//# sourceMappingURL=serverGrouping.js.map