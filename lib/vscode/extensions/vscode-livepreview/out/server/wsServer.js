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
exports.WSServer = exports.WSServerWithOriginCheck = void 0;
const WebSocket = __importStar(require("ws"));
const path = __importStar(require("path"));
const url_1 = require("url");
const crypto_1 = require("crypto");
const dispose_1 = require("../utils/dispose");
const utils_1 = require("../utils/utils");
const constants_1 = require("../utils/constants");
const pathUtil_1 = require("../utils/pathUtil");
/**
 * @description override the `Websocket.Server` class to check websocket connection origins;
 * connections should only be coming from the webview or the host address.
 */
class WSServerWithOriginCheck extends WebSocket.Server {
    /**
     * @param {http.IncomingMessage} req the incoming request to connect
     * @returns {boolean} whether or not to allow the request
     */
    shouldHandle(req) {
        const origin = req.headers['origin'];
        return ((super.shouldHandle(req) &&
            origin &&
            (origin.startsWith(constants_1.UriSchemes.vscode_webview) ||
                (this.externalHostName && origin === this.externalHostName))));
    }
}
exports.WSServerWithOriginCheck = WSServerWithOriginCheck;
/**
 * @description the websocket server, usually hosted on the port following the HTTP server port.
 * It serves two purposes:
 * - Messages from the server to the clients tell it to refresh when there are changes.
 *   The requests occur in `ServerGrouping`, but use this websocket server.
 * - Messages from the client to the server check the "injectability" of the file that is being navigated to.
 *   This only occurs in the webview (embedded preview).
 *
 *	 Being "injectable" means that we can inject our custom script into the file.
 *	 The injectable script has the following **main** roles:
 * 	   1. Facilitates live refresh.
 *	   2. Relays the current address to the webview from inside of the iframe. Without the injected script, the
 * 		  extension preview cannot properly handle history or display the address/title of the page in the webview.
 *	   3. Checks new links for injectability, although this case isn't currently handled since non-html files are
          unlikely to have hyperlinks.
 *	   4. Overrides the console to pipe console messages to the output channel.
 *
 *	 Only #2 needs to be handled for non-injectable files, since the others are unecessary for non-html files.
 *	 To handle displaying the information and handling history correctly, the client (when inside of a webview)
 *	 will let the websocket server know where it is navigating to before going there. If the address it is going
 *	 to is non-injectable, then the extension will relay the address to the `BrowserPreview` instance containing
 *	 the embedded preview to provide the appropriate information and refresh the history.
 */
class WSServer extends dispose_1.Disposable {
    constructor(_reporter, _endpointManager, _connection) {
        super();
        this._reporter = _reporter;
        this._endpointManager = _endpointManager;
        this._connection = _connection;
        this._register(_connection.onConnected((e) => {
            this.externalHostName = `${e.httpURI.scheme}://${e.httpURI.authority}`;
        }));
    }
    set externalHostName(hostName) {
        if (this._wss) {
            this._wss.externalHostName = hostName;
        }
    }
    /**
     * @description the location of the workspace.
     */
    get _basePath() {
        return this._connection.rootPath;
    }
    get wsPath() {
        return this._connection.wsPath;
    }
    /**
     * @description Start the websocket server.
     * @param {number} wsPort the port to try to connect to.
     */
    start(wsPort) {
        var _a;
        this._connection.wsPort = wsPort;
        this._connection.wsPath = `/${(0, crypto_1.randomBytes)(20).toString('hex')}`;
        return this._startWSServer((_a = this._basePath) !== null && _a !== void 0 ? _a : '');
    }
    /**
     * @description Close the websocket server.
     */
    close() {
        if (this._wss != null) {
            this._wss.close();
        }
    }
    /**
     * @description send a message to all connected clients to refresh the page.
     */
    refreshBrowsers() {
        if (this._wss) {
            this._wss.clients.forEach((client) => client.send(JSON.stringify({ command: 'reload' })));
        }
    }
    /**
     * @param {string} basePath the path where the server index is hosted.
     * @returns {boolean} whether the server has successfully started.
     */
    _startWSServer(basePath) {
        return new Promise((resolve, reject) => {
            const _handleWSError = (err) => {
                if (err.code == 'EADDRINUSE') {
                    this._connection.wsPort++;
                    this._wss = new WSServerWithOriginCheck({
                        port: this._connection.wsPort,
                        host: this._connection.host,
                        path: this._connection.wsPath,
                    });
                }
                else if (err.code == 'EADDRNOTAVAIL') {
                    this._connection.resetHostToDefault();
                    this._wss = new WSServerWithOriginCheck({
                        port: this._connection.wsPort,
                        host: this._connection.host,
                        path: this._connection.wsPath,
                    });
                }
                else {
                    /* __GDPR__
                        "server.err" : {
                            "type": {"classification": "SystemMetaData", "purpose": "FeatureInsight"},
                            "err": {"classification": "CallstackOrException", "purpose": "PerformanceAndHealth"}
                        }
                    */
                    this._reporter.sendTelemetryErrorEvent('server.err', {
                        type: 'ws',
                        err: err,
                    });
                    console.log(`Unknown error: ${err}`);
                    reject();
                }
            };
            this._wss = new WSServerWithOriginCheck({
                port: this._connection.wsPort,
                host: this._connection.host,
                path: this._connection.wsPath,
            });
            this._wss.on('connection', (ws) => this._handleWSConnection(basePath, ws));
            this._wss.on('error', (err) => _handleWSError(err));
            this._wss.on('listening', () => {
                console.log(`Websocket server is running on port ${this._connection.wsPort}`);
                resolve();
            });
        });
    }
    /**
     * @description Handle messages from the clients.
     * @param {string} basePath the path where the server index is hosted.
     * @param {WebSocket} ws the websocket server instance.
     */
    _handleWSConnection(basePath, ws) {
        ws.on('message', async (message) => {
            const parsedMessage = JSON.parse(message);
            switch (parsedMessage.command) {
                // perform the url check
                case 'urlCheck': {
                    const results = await this._performTargetInjectableCheck(basePath, parsedMessage.url);
                    if (!results.injectable) {
                        /* __GDPR__
                            "server.ws.foundNonInjectable" : {}
                        */
                        this._reporter.sendTelemetryEvent('server.ws.foundNonInjectable');
                        const sendData = {
                            command: 'foundNonInjectable',
                            path: results.pathname,
                            port: results.port,
                        };
                        ws.send(JSON.stringify(sendData));
                    }
                }
            }
        });
    }
    /**
     * @description check URL injectability.
     * @param {string} basePath the path where the server index is hosted.
     * @param {string} urlString url to check
     * @returns {boolean,string} info on injectability, in addition to the pathname
     * 	in case it needs to be forwarded to the webview.
     */
    async _performTargetInjectableCheck(basePath, urlString) {
        const url = new url_1.URL(urlString);
        let absolutePath = path.join(basePath, url.pathname);
        let port = 0;
        try {
            port = parseInt(url.port);
        }
        catch {
            // no op
        }
        if (!basePath) {
            const decodedLocation = await this._endpointManager.decodeLooseFileEndpoint(pathUtil_1.PathUtil.ConvertToPosixPath(absolutePath));
            if (!decodedLocation || !(await pathUtil_1.PathUtil.FileExistsStat(decodedLocation)).exists) {
                // shows file not found page, which is injectable
                return { injectable: true, pathname: url.pathname, port };
            }
            else {
                absolutePath = decodedLocation;
            }
        }
        const existsStatInfo = await pathUtil_1.PathUtil.FileExistsStat(absolutePath);
        if (existsStatInfo.stat &&
            existsStatInfo.stat.isDirectory() ||
            (0, utils_1.isFileInjectable)(absolutePath)) {
            return { injectable: true, pathname: url.pathname, port };
        }
        return { injectable: false, pathname: url.pathname, port };
    }
}
exports.WSServer = WSServer;
//# sourceMappingURL=wsServer.js.map