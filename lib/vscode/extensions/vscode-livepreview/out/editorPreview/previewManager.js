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
exports.PreviewManager = void 0;
const dispose_1 = require("../utils/dispose");
const vscode = __importStar(require("vscode"));
const settingsUtil_1 = require("../utils/settingsUtil");
const constants_1 = require("../utils/constants");
const pathUtil_1 = require("../utils/pathUtil");
const browserPreview_1 = require("./browserPreview");
const externalBrowserUtils_1 = require("../utils/externalBrowserUtils");
/**
 * PreviewManager` is a singleton that handles the logic of opening the embedded preview.
 */
class PreviewManager extends dispose_1.Disposable {
    constructor(_extensionUri, _reporter, _connectionManager, _endpointManager, _serverExpired) {
        super();
        this._extensionUri = _extensionUri;
        this._reporter = _reporter;
        this._connectionManager = _connectionManager;
        this._endpointManager = _endpointManager;
        this._serverExpired = _serverExpired;
        this.previewActive = false;
        this._notifiedAboutLooseFiles = false;
        this._onShouldLaunchPreview = this._register(new vscode.EventEmitter());
        this.onShouldLaunchPreview = this._onShouldLaunchPreview.event;
        this._outputChannel =
            vscode.window.createOutputChannel(constants_1.OUTPUT_CHANNEL_NAME);
    }
    /**
     * Actually launch the embedded browser preview (caller guarantees that the server has started.)
     * @param {vscode.Uri} file the filesystem path to preview.
     * @param {vscode.WebviewPanel | undefined} panel the webview panel to reuse if defined.
     * @param {Connection} connection the connection to connect using
     */
    async launchFileInEmbeddedPreview(panel, connection, file) {
        const path = file ? await this._fileUriToPath(file, connection) : '/';
        // If we already have a panel, show it.
        if (this.currentPanel) {
            await this.currentPanel.reveal(vscode.ViewColumn.Beside, path, connection);
            return;
        }
        if (!panel) {
            // Otherwise, create a new panel.
            panel = vscode.window.createWebviewPanel(browserPreview_1.BrowserPreview.viewType, constants_1.INIT_PANEL_TITLE, vscode.ViewColumn.Beside, {
                ...this.getWebviewOptions(),
                ...this._getWebviewPanelOptions(),
            });
        }
        this._startEmbeddedPreview(panel, path, connection);
    }
    /**
     * Actually launch the external browser preview (caller guarantees that the server has started.)
     * @param {vscode.Uri} file the filesystem path to preview.
     * @param {boolean} debug whether we are opening in a debug session.
     * @param {Connection} connection the connection to connect using
     */
    async launchFileInExternalBrowser(debug, connection, file) {
        const path = file
            ? pathUtil_1.PathUtil.ConvertToPosixPath(await this._fileUriToPath(file, connection))
            : '/';
        const url = `http://${connection.host}:${connection.httpPort}${path}`;
        if (debug) {
            vscode.commands.executeCommand('extension.js-debug.debugLink', url);
        }
        else {
            // will already resolve to local address
            await externalBrowserUtils_1.ExternalBrowserUtils.openInBrowser(url, settingsUtil_1.SettingUtil.GetConfig().customExternalBrowser);
        }
    }
    /**
     * @returns {WebviewOptions} the webview options to allow us to load the files we need in the webivew.
     */
    getWebviewOptions() {
        const options = {
            // Enable javascript in the webview
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'media'),
                vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode', 'codicons', 'dist'),
            ],
        };
        return options;
    }
    /**
     * @description notify the user that they are opening a file outside the current workspace(s).
     */
    _notifyLooseFileOpen() {
        /* __GDPR__
            "preview.fileOutOfWorkspace" : {}
        */
        this._reporter.sendTelemetryEvent('preview.fileOutOfWorkspace');
        if (!this._notifiedAboutLooseFiles &&
            settingsUtil_1.SettingUtil.GetConfig().notifyOnOpenLooseFile) {
            vscode.window
                .showWarningMessage(vscode.l10n.t('Previewing a file that is not a child of the server root. To see fully correct relative file links, please open a workspace at the project root or consider changing your server root settings for Live Preview.'), constants_1.DONT_SHOW_AGAIN)
                .then(async (selection) => {
                if (selection == constants_1.DONT_SHOW_AGAIN) {
                    await settingsUtil_1.SettingUtil.UpdateSettings(settingsUtil_1.Settings.notifyOnOpenLooseFile, false, vscode.ConfigurationTarget.Global);
                }
            });
        }
        this._notifiedAboutLooseFiles = true;
    }
    /**
     * Transforms Uris into a path that can be used by the server.
     * @param {vscode.Uri} file the path to potentially transform.
     * @param {Connection} connection the connection to connect using
     * @returns {string} the transformed path if the original `file` was realtive.
     */
    async _fileUriToPath(file, connection) {
        var _a;
        let path = '/';
        if (!(connection === null || connection === void 0 ? void 0 : connection.workspace)) {
            this._notifyLooseFileOpen();
            path = await this._endpointManager.encodeLooseFileEndpoint(file.fsPath);
            if (!path.startsWith('/')) {
                path = `/${path}`;
            }
        }
        else if (connection) {
            path = (_a = connection.getFileRelativeToWorkspace(file.fsPath)) !== null && _a !== void 0 ? _a : '';
        }
        return path;
    }
    /**
     * Handles opening the embedded preview and setting up its listeners.
     * After a browser preview is closed, the server will close if another browser preview has not opened after a period of time (configurable in settings)
     * or if a task is not runnning. Because of this, a timer is triggerred upon webview (embedded preview) disposal/closing.
     * @param {vscode.WebviewPanel} panel the panel to use to open the preview.
     * @param {vscode.Uri} file the path to preview (should already be encoded).
     * @param {Connection} connection the connection to connect using
     */
    _startEmbeddedPreview(panel, file, connection) {
        if (this._currentTimeout) {
            clearTimeout(this._currentTimeout);
        }
        this.currentPanel = this._register(new browserPreview_1.BrowserPreview(file, connection, panel, this._extensionUri, this._reporter, this._connectionManager, this._outputChannel));
        const listener = this.currentPanel.onShouldLaunchPreview((e) => this._onShouldLaunchPreview.fire(e));
        this.previewActive = true;
        this._register(this.currentPanel.onDispose(() => {
            this.currentPanel = undefined;
            const closeServerDelay = settingsUtil_1.SettingUtil.GetConfig().serverKeepAliveAfterEmbeddedPreviewClose;
            if (closeServerDelay !== 0) {
                this._currentTimeout = setTimeout(() => {
                    this._serverExpired();
                    this.previewActive = false;
                }, Math.floor(closeServerDelay * 1000 * 60));
            }
            listener.dispose();
        }));
    }
    /**
     * @returns {vscode.WebviewPanelOptions} the webview panel options to allow it to always retain context.
     */
    _getWebviewPanelOptions() {
        return {
            retainContextWhenHidden: true,
        };
    }
}
exports.PreviewManager = PreviewManager;
//# sourceMappingURL=previewManager.js.map