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
exports.Connection = void 0;
const vscode = __importStar(require("vscode"));
const dispose_1 = require("../utils/dispose");
const constants_1 = require("../utils/constants");
const pathUtil_1 = require("../utils/pathUtil");
const settingsUtil_1 = require("../utils/settingsUtil");
/**
 * @description the instance that keeps track of the host and port information for the http and websocket servers.
 * Upon requesting the host, it will resolve its external URI before returning it.
 * There is one `Connection` per `ServerGrouping`, but connections are kept within the ConnectionManager because this info
 * is also needed from the `PreviewManager`.
 */
class Connection extends dispose_1.Disposable {
    constructor(_workspace, _rootPrefix, httpPort, wsPort, host) {
        super();
        this._workspace = _workspace;
        this._rootPrefix = _rootPrefix;
        this.httpPort = httpPort;
        this.wsPort = wsPort;
        this.host = host;
        this.wsPath = '';
        this._onConnected = this._register(new vscode.EventEmitter());
        this.onConnected = this._onConnected.event;
        this._onShouldResetInitHost = this._register(new vscode.EventEmitter());
        this.onShouldResetInitHost = this._onShouldResetInitHost.event;
        this._register(vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration(settingsUtil_1.SETTINGS_SECTION_ID)) {
                this._rootPrefix = _workspace ? await pathUtil_1.PathUtil.GetValidServerRootForWorkspace(_workspace) : '';
            }
        }));
    }
    /**
     * Called by the server manager to inform this object that a connection has been successful.
     * @param httpPort HTTP server port number
     * @param wsPort WS server port number
     * @param wsPath WS server path
     */
    async connected() {
        const externalHTTPUri = await this.resolveExternalHTTPUri(this.httpPort);
        const externalWSUri = await this.resolveExternalWSUri(this.wsPort, this.wsPath);
        this._onConnected.fire({
            httpURI: externalHTTPUri,
            wsURI: externalWSUri,
            workspace: this._workspace,
            httpPort: this.httpPort,
            rootPrefix: this._rootPrefix
        });
    }
    /**
     * Use `vscode.env.asExternalUri` to determine the HTTP host and port on the user's machine.
     * @returns {Promise<vscode.Uri>} a promise for the HTTP URI
     */
    async resolveExternalHTTPUri(httpPort) {
        if (!httpPort) {
            httpPort = this.httpPort;
        }
        const httpPortUri = this.constructLocalUri(httpPort);
        return vscode.env.asExternalUri(httpPortUri);
    }
    /**
     * Use `vscode.env.asExternalUri` to determine the WS host and port on the user's machine.
     * @returns {Promise<vscode.Uri>} a promise for the WS URI
     */
    async resolveExternalWSUri(wsPort, wsPath) {
        if (!wsPort) {
            wsPort = this.wsPort;
        }
        if (!wsPath) {
            wsPath = this.wsPath;
        }
        const wsPortUri = this.constructLocalUri(wsPort);
        return vscode.Uri.joinPath(await vscode.env.asExternalUri(wsPortUri), wsPath); // ensure that this pathname is retained, as the websocket server must see this in order to authorize
    }
    /**
     * @param port the local port
     * @param path the path to use
     * @returns the vscode Uri of this address
     */
    constructLocalUri(port, path) {
        return vscode.Uri.parse(`http://${this.host}:${port}${path !== null && path !== void 0 ? path : ''}`);
    }
    get workspace() {
        return this._workspace;
    }
    get rootURI() {
        if (this.workspace) {
            return vscode.Uri.joinPath(this.workspace.uri, this._rootPrefix);
        }
        return undefined;
    }
    get rootPath() {
        var _a;
        return (_a = this.rootURI) === null || _a === void 0 ? void 0 : _a.fsPath;
    }
    /**
     * Reset to the default host in the settings. Used if the address that the user chose is busy.
     */
    resetHostToDefault() {
        if (this.host != constants_1.DEFAULT_HOST) {
            vscode.window.showErrorMessage(vscode.l10n.t('The IP address "{0}" cannot be used to host the server. Using default IP {1}.', this.host, constants_1.DEFAULT_HOST));
            this.host = constants_1.DEFAULT_HOST;
            this._onShouldResetInitHost.fire(this.host);
        }
    }
    /**
     * @description Given an absolute file, get the file relative to the workspace.
     *  Will return empty string if `!_absPathInWorkspace(path)`.
     * @param {string} path the absolute path to convert.
     * @returns {string} the equivalent relative path.
     */
    getFileRelativeToWorkspace(path) {
        const workspaceRoot = this.rootPath;
        if (workspaceRoot && this._absPathInWorkspace(path)) {
            return pathUtil_1.PathUtil.ConvertToPosixPath(path.substring(workspaceRoot.length));
        }
        else {
            return undefined;
        }
    }
    /**
     * Get the URI given the relative path
     */
    getAppendedURI(path) {
        return this.rootURI ? vscode.Uri.joinPath(this.rootURI, path) : vscode.Uri.file(path);
    }
    /**
     * @description Checks if a file is a child of the workspace given its **absolute** file
     *  (always returns false if undefined workspace).
     *  e.g. with workspace `c:/a/file/path/`, and path `c:/a/file/path/continued/index.html`, this returns true.
     * @param {string} path path to test.
     * @returns whether the path is in the workspace
     */
    _absPathInWorkspace(path) {
        return this.rootPath
            ? pathUtil_1.PathUtil.PathBeginsWith(path, this.rootPath)
            : false;
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map