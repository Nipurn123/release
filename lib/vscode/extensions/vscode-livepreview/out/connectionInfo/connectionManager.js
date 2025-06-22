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
exports.ConnectionManager = void 0;
const net_1 = require("net");
const vscode = __importStar(require("vscode"));
const constants_1 = require("../utils/constants");
const dispose_1 = require("../utils/dispose");
const pathUtil_1 = require("../utils/pathUtil");
const settingsUtil_1 = require("../utils/settingsUtil");
const connection_1 = require("./connection");
/**
 * @description keeps track of all of the Connection objects and the info needed to create them (ie: initial ports).
 */
class ConnectionManager extends dispose_1.Disposable {
    constructor() {
        super();
        this._onConnected = this._register(new vscode.EventEmitter());
        /**
         * Fires when a new connection connects
         */
        this.onConnected = this._onConnected.event;
        this._initHttpPort = settingsUtil_1.SettingUtil.GetConfig().portNumber;
        this._initWSPort = this._initHttpPort + 1;
        this._initHost = settingsUtil_1.SettingUtil.GetConfig().hostIP;
        if (!this._validHost(this._initHost)) {
            this._showIncorrectHostFormatError(this._initHost);
            this._initHost = constants_1.DEFAULT_HOST;
        }
        else if (vscode.env.remoteName && this._initHost != constants_1.DEFAULT_HOST) {
            vscode.window.showErrorMessage(vscode.l10n.t('Cannot use the host "{0}" when using a remote connection. Using default {1}.', this._initHost, constants_1.DEFAULT_HOST));
            this._initHost = constants_1.DEFAULT_HOST;
        }
        this._connections = new Map();
        this._register(vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(settingsUtil_1.SETTINGS_SECTION_ID)) {
                this._pendingPort = settingsUtil_1.SettingUtil.GetConfig().portNumber;
                this._pendingHost = settingsUtil_1.SettingUtil.GetConfig().hostIP;
            }
        }));
    }
    /**
     * get connection by workspaceFolder
     * @param workspaceFolder
     * @returns connection
     */
    getConnection(workspaceFolder) {
        return this._connections.get(workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.toString());
    }
    /**
     * get a connection using its current port number
     * @param port
     * @returns connection
     */
    getConnectionFromPort(port) {
        return this.connections.find((e) => e && e.httpPort === port);
    }
    /**
     * create a connection via workspaceFolder
     * @param workspaceFolder
     * @returns connection
     */
    async createAndAddNewConnection(workspaceFolder) {
        const serverRootPrefix = workspaceFolder ? await pathUtil_1.PathUtil.GetValidServerRootForWorkspace(workspaceFolder) : '';
        const connection = this._register(new connection_1.Connection(workspaceFolder, serverRootPrefix, this._initHttpPort, this._initWSPort, this._initHost));
        this._register(connection.onConnected((e) => this._onConnected.fire(e)));
        this._register(connection.onShouldResetInitHost((host) => (this._initHost = host)));
        this._connections.set(workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.toString(), connection);
        return connection;
    }
    /**
     * remove a connection by workspaceFolder
     * @param workspaceFolder
     */
    removeConnection(workspaceFolder) {
        var _a;
        (_a = this._connections.get(workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.toString())) === null || _a === void 0 ? void 0 : _a.dispose;
        this._connections.delete(workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.uri.toString());
    }
    /**
     * get list of connections as array.
     */
    get connections() {
        return Array.from(this._connections.values());
    }
    /**
     * @description If setting for the initial port is changed, change the port that servers try first
     */
    set _pendingPort(port) {
        this._initHttpPort = port;
        this._initWSPort = port + 1;
    }
    set _pendingHost(host) {
        if (this._validHost(host)) {
            this._initHost = host;
        }
        else {
            this._showIncorrectHostFormatError(host);
            this._initHost = constants_1.DEFAULT_HOST;
        }
    }
    _validHost(host) {
        return (0, net_1.isIPv4)(host);
    }
    _showIncorrectHostFormatError(host) {
        vscode.window.showErrorMessage(vscode.l10n.t('The local IP address "{0}" is not formatted correctly. Using default {1}.', host, constants_1.DEFAULT_HOST));
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connectionManager.js.map