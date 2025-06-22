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
exports.BrowserPreview = void 0;
const constants_1 = require("../utils/constants");
const vscode = __importStar(require("vscode"));
const dispose_1 = require("../utils/dispose");
const pathUtil_1 = require("../utils/pathUtil");
const webviewComm_1 = require("./webviewComm");
const utils_1 = require("../utils/utils");
const settingsUtil_1 = require("../utils/settingsUtil");
const path = __importStar(require("path"));
const url_1 = require("url");
const externalBrowserUtils_1 = require("../utils/externalBrowserUtils");
/**
 * @description the embedded preview object, containing the webview panel showing the preview.
 */
class BrowserPreview extends dispose_1.Disposable {
    constructor(initialFile, initialConnection, _panel, _extensionUri, _reporter, _connectionManager, _outputChannel) {
        super();
        this._panel = _panel;
        this._extensionUri = _extensionUri;
        this._reporter = _reporter;
        this._connectionManager = _connectionManager;
        this._outputChannel = _outputChannel;
        this._onDisposeEmitter = this._register(new vscode.EventEmitter());
        this.onDispose = this._onDisposeEmitter.event;
        this.windowId = undefined;
        this._onShouldLaunchPreview = this._register(new vscode.EventEmitter());
        this.onShouldLaunchPreview = this._onShouldLaunchPreview.event;
        this._panel.iconPath = {
            light: vscode.Uri.joinPath(this._extensionUri, 'media', 'preview-light.svg'),
            dark: vscode.Uri.joinPath(this._extensionUri, 'media', 'preview-dark.svg'),
        };
        this._webviewComm = this._register(new webviewComm_1.WebviewComm(initialFile, initialConnection, _panel, _extensionUri, _connectionManager));
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._register(this._panel.onDidDispose(() => {
            this.dispose();
        }));
        this._register(this._webviewComm.onPanelTitleChange((e) => {
            this._setPanelTitle(e.title, e.pathname, e.connection);
        }));
        // Handle messages from the webview
        this._register(this._panel.webview.onDidReceiveMessage((message) => this._handleWebviewMessage(message)));
    }
    /**
     * get the connection that the webview is currently using
     */
    get currentConnection() {
        return this._webviewComm.currentConnection;
    }
    get currentAddress() {
        return this._webviewComm.currentAddress;
    }
    /**
     * get the webview panel
     */
    get panel() {
        return this._panel;
    }
    /**
     * @description close the embedded browser.
     */
    close() {
        this._panel.dispose();
    }
    /**
     * Show the existing embedded preview.
     * @param column which column to show it in.
     * @param file the file (pathname) to go to.
     * @param connection the connection to connect using
     */
    async reveal(column, file = '/', connection) {
        await this._webviewComm.goToFile(file, true, connection);
        this._panel.reveal(column);
    }
    /**
     * @description handle messages from the webview (see messages sent from `media/main.js`).
     * @param {any} message the message from webview
     */
    async _handleWebviewMessage(message) {
        switch (message.command) {
            case 'alert':
                vscode.window.showErrorMessage(message.text);
                return;
            case 'update-path': {
                const msgJSON = JSON.parse(message.text);
                this._webviewComm.handleNewPageLoad(msgJSON.path.pathname, this.currentConnection, msgJSON.title);
                return;
            }
            case 'go-back':
                await this._webviewComm.goBack();
                return;
            case 'go-forward':
                await this._webviewComm.goForwards();
                return;
            case 'open-browser':
                await this._openCurrentAddressInExternalBrowser();
                return;
            case 'add-history': {
                const msgJSON = JSON.parse(message.text);
                const connection = this._connectionManager.getConnectionFromPort(msgJSON.port);
                await this._webviewComm.setUrlBar(msgJSON.path, connection);
                return;
            }
            case 'refresh-back-forward-buttons':
                this._webviewComm.updateForwardBackArrows();
                return;
            case 'go-to-file':
                await this._goToFullAddress(message.text);
                return;
            case 'console': {
                const msgJSON = JSON.parse(message.text);
                this._handleConsole(msgJSON.type, msgJSON.data);
                return;
            }
            case 'devtools-open':
                vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools');
                return;
            case 'get-window-id':
                this.windowId = message.id;
                if (this.windowId) {
                    const currentFullAddress = await this.currentConnection.resolveExternalHTTPUri();
                    const url = new url_1.URL(this.currentAddress, currentFullAddress.toString(true));
                    if (!url.searchParams.has('serverWindowId')) {
                        url.searchParams.set('serverWindowId', this.windowId.toString());
                        this._webviewComm.currentAddress = url.pathname + url.search;
                        this._webviewComm.reloadWebview();
                    }
                }
                return;
        }
    }
    /**
     * @description handle console message that should appear in output channel.
     * @param {string} type the type of log
     * @param {string} log the log contents
     */
    _handleConsole(type, log) {
        if (type == 'CLEAR') {
            this._outputChannel.clear();
        }
        else {
            const date = new Date();
            this._outputChannel.appendLine(`[${type} - ${(0, utils_1.FormatDateTime)(date, ' ')}] ${log}`);
        }
    }
    dispose() {
        this._onDisposeEmitter.fire();
        this._panel.dispose();
        super.dispose();
    }
    /**
     * Open in embedded preview's address in external browser
     */
    async _openCurrentAddressInExternalBrowser() {
        const givenURL = await this._webviewComm.constructAddress(this._webviewComm.currentAddress, undefined, undefined);
        const uri = vscode.Uri.parse(givenURL.toString());
        const previewType = settingsUtil_1.SettingUtil.GetExternalPreviewType();
        this._onShouldLaunchPreview.fire({
            uri: uri,
            options: {
                workspace: this._webviewComm.currentConnection.workspace,
                port: this._webviewComm.currentConnection.httpPort,
            },
            previewType,
        });
    }
    /**
     * Open in external browser. This also warns the user in the case where the URL is external to the hosted content.
     * @param {string} givenURL the (full) URL to open up in the external browser.
     */
    async _handleOpenBrowser(givenURL) {
        vscode.window
            .showInformationMessage(vscode.l10n.t('Externally hosted links are not supported in the embedded preview. Do you want to open {0} in an external browser?', givenURL), { modal: true }, constants_1.OPEN_EXTERNALLY)
            .then((selection) => {
            if (selection) {
                if (selection === constants_1.OPEN_EXTERNALLY) {
                    externalBrowserUtils_1.ExternalBrowserUtils.openInBrowser(givenURL, settingsUtil_1.SettingUtil.GetConfig().customExternalBrowser);
                }
            }
        });
        // navigate back to the previous page, since the page it went to is invalid
        await this._webviewComm.reloadWebview();
        /* __GDPR__
            "preview.openExternalBrowser" : {}
        */
        this._reporter.sendTelemetryEvent('preview.openExternalBrowser');
    }
    /**
     * @param {string} address the (full) address to navigate to; will open in external browser if it is an external address.
     */
    async _goToFullAddress(address) {
        try {
            const port = new url_1.URL(address).port;
            if (port === undefined) {
                throw Error;
            }
            const connection = this._connectionManager.getConnectionFromPort(parseInt(port));
            if (!connection) {
                throw Error;
            }
            const host = await this._webviewComm.resolveHost(connection);
            let hostString = host.toString();
            if (hostString.endsWith('/')) {
                hostString = hostString.substring(0, hostString.length - 1);
            }
            const file = address.substring(hostString.length);
            await this._webviewComm.goToFile(file, true, connection);
        }
        catch (e) {
            await this._handleOpenBrowser(address);
        }
    }
    /**
     * Set the panel title accordingly, given the title and pathname given
     * @param {string} title the page title of the page being hosted.
     * @param {string} pathname the pathname of the path being hosted.
     */
    async _setPanelTitle(title, pathname, connection) {
        if (title == '') {
            pathname = decodeURI(pathname);
            if (pathname.length > 0 && pathname[0] == '/') {
                if (connection.workspace) {
                    this._panel.title = await pathUtil_1.PathUtil.GetFileName(pathname);
                }
                else {
                    this._panel.title = path.basename(pathname.substring(1));
                }
            }
            else {
                this._panel.title = pathname;
            }
        }
        else {
            this._panel.title = title;
        }
    }
}
exports.BrowserPreview = BrowserPreview;
BrowserPreview.viewType = 'browserPreview';
//# sourceMappingURL=browserPreview.js.map