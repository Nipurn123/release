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
exports.WebviewComm = void 0;
const dispose_1 = require("../utils/dispose");
const vscode = __importStar(require("vscode"));
const constants_1 = require("../utils/constants");
const pageHistoryTracker_1 = require("./pageHistoryTracker");
const utils_1 = require("../utils/utils");
const crypto_1 = require("crypto");
/**
 * @description the object responsible for communicating messages to the webview.
 */
class WebviewComm extends dispose_1.Disposable {
    constructor(initialFile, currentConnection, _panel, _extensionUri, _connectionManager) {
        var _a;
        super();
        this.currentConnection = currentConnection;
        this._panel = _panel;
        this._extensionUri = _extensionUri;
        this._connectionManager = _connectionManager;
        this._onPanelTitleChange = this._register(new vscode.EventEmitter());
        this.onPanelTitleChange = this._onPanelTitleChange.event;
        this._register(this._connectionManager.onConnected((e) => {
            var _a;
            if (e.workspace === ((_a = this.currentConnection) === null || _a === void 0 ? void 0 : _a.workspace)) {
                this.reloadWebview();
            }
        }));
        this._pageHistory = this._register(new pageHistoryTracker_1.PageHistory());
        this.updateForwardBackArrows();
        // Set the webview's html content
        this.goToFile(initialFile, false);
        (_a = this._pageHistory) === null || _a === void 0 ? void 0 : _a.addHistory(initialFile, currentConnection);
        this.currentAddress = initialFile;
    }
    /**
     * @description extension-side reload of webivew.
     */
    async reloadWebview() {
        await this.goToFile(this.currentAddress, false);
    }
    /**
     * @returns {Promise<vscode.Uri>} the promise containing the HTTP URI.
     */
    async resolveHost(connection) {
        return connection.resolveExternalHTTPUri();
    }
    /**
     * @returns {Promise<vscode.Uri>} the promise containing the WebSocket URI.
     */
    async _resolveWsHost(connection) {
        return connection.resolveExternalWSUri();
    }
    /**
     * @param {string} URLExt the pathname to construct the address from.
     * @param {string} hostURI the (optional) URI of the host; alternatively, the function will manually generate the connection manager's HTTP URI if not provided with it initially.
     * @returns {Promise<string>} a promise for the address for the content.
     */
    async constructAddress(URLExt, connection = this.currentConnection, hostURI, windowId) {
        if (URLExt.length > 0 && URLExt[0] == '/') {
            URLExt = URLExt.substring(1);
        }
        if (!hostURI) {
            hostURI = await this.resolveHost(connection);
        }
        return `${hostURI.toString()}${URLExt}`;
    }
    /**
     * @description go to a file in the embeded preview
     * @param {string} URLExt the pathname to navigate to
     *  can be:
     * 1. /relative-pathname OR (blank string) for root
     * 2. /c:/absolute-pathname
     * 3. /unc/absolute-unc-pathname
     * @param {boolean} updateHistory whether or not to update the history from this call.
     */
    async goToFile(URLExt, updateHistory = true, connection = this.currentConnection) {
        await this._setHtml(this._panel.webview, URLExt, updateHistory, connection);
        this.currentAddress = URLExt;
    }
    /**
     * @description set the webivew's HTML to show embedded preview content.
     * @param {vscode.Webview} webview the webview to set the HTML.
     * @param {string} URLExt the pathname appended to the host to navigate the preview to.
     * @param {boolean} updateHistory whether or not to update the history from this call.
     */
    async _setHtml(webview, URLExt, updateHistory, connection) {
        this.currentConnection = connection;
        const httpHost = await this.resolveHost(connection);
        const url = await this.constructAddress(URLExt, connection, httpHost);
        const wsURI = await this._resolveWsHost(connection);
        this._panel.webview.html = this._getHtmlForWebview(webview, url, `ws://${wsURI.authority}${wsURI.path}`, `${httpHost.scheme}://${httpHost.authority}`);
        // If we can't rely on inline script to update panel title,
        // then set panel title manually
        if (!(0, utils_1.isFileInjectable)(URLExt)) {
            this._onPanelTitleChange.fire({
                title: '',
                pathname: URLExt,
                connection: connection,
            });
            this._panel.webview.postMessage({
                command: 'set-url',
                text: JSON.stringify({ fullPath: url, pathname: URLExt }),
            });
        }
        if (updateHistory) {
            this.handleNewPageLoad(URLExt, connection);
        }
    }
    /**
     * @description generate the HTML to load in the webview; this will contain the full-page iframe with the hosted content,
     *  in addition to the top navigation bar.
     * @param {vscode.Webview} webview the webview instance (to create sufficient webview URIs)/
     * @param {string} httpURL the address to navigate to in the iframe.
     * @param {string} wsServerAddr the address of the WebSocket server.
     * @param {string} httpServerAddr the address of the HTTP server.
     * @returns {string} the html to load in the webview.
     */
    _getHtmlForWebview(webview, httpURL, wsServerAddr, httpServerAddr) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');
        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        // Local path to css styles
        const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
        const codiconsPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'codicon.css');
        // Uri to load styles into webview
        const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
        const codiconsUri = webview.asWebviewUri(codiconsPathMainPath);
        // Use a nonce to only allow specific scripts to be run
        const nonce = (0, crypto_1.randomBytes)(16).toString('base64');
        const back = vscode.l10n.t('Back');
        const forward = vscode.l10n.t('Forward');
        const reload = vscode.l10n.t('Reload');
        const more = vscode.l10n.t('More Browser Actions');
        const find_prev = vscode.l10n.t('Previous');
        const find_next = vscode.l10n.t('Next');
        const find_x = vscode.l10n.t('Close');
        const browser_open = vscode.l10n.t('Open in Browser');
        const find = vscode.l10n.t('Find in Page');
        const devtools_open = vscode.l10n.t('Open Devtools Pane');
        return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					connect-src ${wsServerAddr};
					font-src ${this._panel.webview.cspSource};
					style-src ${this._panel.webview.cspSource};
					script-src 'nonce-${nonce}';
					frame-src ${httpServerAddr};
				">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesMainUri}" rel="stylesheet">
				<link rel="stylesheet" type="text/css" href="${codiconsUri}">

				<title>${constants_1.INIT_PANEL_TITLE}</title>
			</head>
			<body>
			<div class="displayContents">
				<div class="header">
					<div class="headercontent">
						<nav class="controls">
							<button
								id="back"
								title="${back}"
								class="back-button icon leftmost-nav"><i class="codicon codicon-arrow-left"></i></button>
							<button
								id="forward"
								title="${forward}"
								class="forward-button icon leftmost-nav"><i class="codicon codicon-arrow-right"></i></button>
							<button
								id="reload"
								title="${reload}"
								class="reload-button icon leftmost-nav"><i class="codicon codicon-refresh"></i></button>
							<input
								id="url-input"
								class="url-input"
								type="text">
							<button
								id="more"
								title="${more}"
								class="more-button icon"><i class="codicon codicon-list-flat"></i></button>
						</nav>
						<div class="find-container" id="find-box" hidden=true>
							<nav class="find">
								<input
									id="find-input"
									class="find-input"
									type="text">
								<div
									id="find-result"
									class="find-result icon" hidden=true><i id="find-result-icon" class="codicon" ></i></div>
								<button
									id="find-prev"
									title="${find_prev}"
									class="find-prev-button icon find-nav"><i class="codicon codicon-chevron-up"></i></button>
								<button
									id="find-next"
									tabIndex=-1
									title="${find_next}"
									class="find-next-button icon find-nav"><i class="codicon codicon-chevron-down"></i></button>
								<button
									id="find-x"
									tabIndex=-1
									title="${find_x}"
									class="find-x-button icon find-nav"><i class="codicon codicon-chrome-close"></i></button>
							</nav>
						</div>
					</div>
					<div class="extras-menu" id="extras-menu-pane" hidden=true;>
						<table cellspacing="0" cellpadding="0">
							<tr>
								<td>
									<button tabIndex=-1
										id="browser-open" class="extra-menu-nav">${browser_open}</button>
								</td>
							</tr>
							<tr>
								<td>
									<button tabIndex=-1
										id="find" class="extra-menu-nav">${find}</button>
								</td>
							</tr>
							<tr>
								<td>
									<button tabIndex=-1
										id="devtools-open" class="extra-menu-nav">${devtools_open}</button>
								</td>
							</tr>
						</table>
					</div>
				</div>
				<div class="content">
					<iframe id="hostedContent" src="${httpURL}"></iframe>
				</div>
			</div>
			<div id="link-preview"></div>
				<script nonce="${nonce}">
					const WS_URL= "${wsServerAddr}";
				</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		</html>`;
    }
    /**
     * @description set the webview's URL bar.
     * @param {string} pathname the pathname of the address to set the URL bar with.
     */
    async setUrlBar(pathname, connection = this.currentConnection) {
        this._panel.webview.postMessage({
            command: 'set-url',
            text: JSON.stringify({
                fullPath: await this.constructAddress(pathname, connection),
                pathname: pathname,
            }),
        });
        // called from main.js in the case where the target is non-injectable
        this.handleNewPageLoad(pathname, connection);
    }
    /**
     * @param {NavEditCommands} command the enable/disable command for the webview's back/forward buttons
     */
    handleNavAction(command) {
        let text = {};
        switch (command) {
            case pageHistoryTracker_1.NavEditCommands.DISABLE_BACK:
                text = { element: 'back', disabled: true };
                break;
            case pageHistoryTracker_1.NavEditCommands.ENABLE_BACK:
                text = { element: 'back', disabled: false };
                break;
            case pageHistoryTracker_1.NavEditCommands.DISABLE_FORWARD:
                text = { element: 'forward', disabled: true };
                break;
            case pageHistoryTracker_1.NavEditCommands.ENABLE_FORWARD:
                text = { element: 'forward', disabled: false };
                break;
        }
        this._panel.webview.postMessage({
            command: 'changed-history',
            text: JSON.stringify(text),
        });
    }
    /**
     * @description perform the appropriate updates when a new page loads.
     * @param {string} pathname path to file that loaded.
     * @param {string} panelTitle the panel title of file (if applicable).
     */
    handleNewPageLoad(pathname, connection, panelTitle = '') {
        var _a;
        // only load relative addresses
        if (pathname.length > 0 && pathname[0] != '/') {
            pathname = '/' + pathname;
        }
        this._onPanelTitleChange.fire({ title: panelTitle, pathname, connection });
        this.currentAddress = pathname;
        const response = (_a = this._pageHistory) === null || _a === void 0 ? void 0 : _a.addHistory(pathname, connection);
        if (response) {
            for (const action of response.actions) {
                this.handleNavAction(action);
            }
        }
    }
    /**
     * @description send a request to the webview to update the enable/disable status of the back/forward buttons.
     */
    updateForwardBackArrows() {
        const navigationStatus = this._pageHistory.currentCommands;
        for (const status of navigationStatus) {
            this.handleNavAction(status);
        }
    }
    /**
     * @description go forwards in page history.
     */
    async goForwards() {
        const response = this._pageHistory.goForward();
        const page = response.address;
        if (page != undefined) {
            await this.goToFile(page.path, false, page.connection);
        }
        for (const action of response.actions) {
            this.handleNavAction(action);
        }
    }
    /**
     * @description go backwards in page history.
     */
    async goBack() {
        const response = this._pageHistory.goBackward();
        const page = response.address;
        if (page != undefined) {
            await this.goToFile(page.path, false, page.connection);
        }
        for (const action of response.actions) {
            this.handleNavAction(action);
        }
    }
}
exports.WebviewComm = WebviewComm;
//# sourceMappingURL=webviewComm.js.map