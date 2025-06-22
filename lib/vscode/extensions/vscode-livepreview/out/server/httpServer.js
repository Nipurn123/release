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
exports.HttpServer = void 0;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
const path = __importStar(require("path"));
const dispose_1 = require("../utils/dispose");
const contentLoader_1 = require("./serverUtils/contentLoader");
const constants_1 = require("../utils/constants");
const pathUtil_1 = require("../utils/pathUtil");
const settingsUtil_1 = require("../utils/settingsUtil");
class HttpServer extends dispose_1.Disposable {
    constructor(_extensionUri, _reporter, _endpointManager, _connection) {
        super();
        this._reporter = _reporter;
        this._endpointManager = _endpointManager;
        this._connection = _connection;
        this._onNewReqProcessed = this._register(new vscode.EventEmitter());
        this.onNewReqProcessed = this._onNewReqProcessed.event;
        this._contentLoader = this._register(new contentLoader_1.ContentLoader(_extensionUri, _reporter, _endpointManager, _connection));
        this._defaultHeaders = settingsUtil_1.SettingUtil.GetConfig().httpHeaders;
        this._register(vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(settingsUtil_1.SETTINGS_SECTION_ID)) {
                this._defaultHeaders = settingsUtil_1.SettingUtil.GetConfig().httpHeaders;
            }
        }));
    }
    _unsetDefaultHeaders() {
        this._defaultHeaders = {};
    }
    /**
     * @returns {string | undefined} the path where the server index is located.
     */
    get _basePath() {
        var _a;
        return (_a = this._connection.rootPath) !== null && _a !== void 0 ? _a : '';
    }
    /**
     * @description start the HTTP server.
     * @param {number} port port to try to start server on.
     */
    start(port) {
        this._connection.httpPort = port;
        this._contentLoader.resetServedFiles();
        return this._startHttpServer();
    }
    /**
     * @description stop the HTTP server.
     */
    close() {
        var _a;
        (_a = this._server) === null || _a === void 0 ? void 0 : _a.close();
    }
    /**
     * @description contains all of the listeners required to start the server and recover on port collision.
     * @returns {boolean} whether the HTTP server started successfully (currently only returns true)
     */
    _startHttpServer() {
        this._server = this._createServer();
        return new Promise((resolve, reject) => {
            var _a, _b, _c;
            (_a = this._server) === null || _a === void 0 ? void 0 : _a.on('listening', () => {
                console.log(`Server is running on port ${this._connection.httpPort}`);
                resolve();
            });
            (_b = this._server) === null || _b === void 0 ? void 0 : _b.on('error', (err) => {
                var _a, _b;
                if (err.code == 'EADDRINUSE') {
                    this._connection.httpPort++;
                    (_a = this._server) === null || _a === void 0 ? void 0 : _a.listen(this._connection.httpPort, this._connection.host);
                }
                else if (err.code == 'EADDRNOTAVAIL') {
                    this._connection.resetHostToDefault();
                    (_b = this._server) === null || _b === void 0 ? void 0 : _b.listen(this._connection.httpPort, this._connection.host);
                }
                else {
                    /* __GDPR__
                        "server.err" : {
                            "type": {"classification": "SystemMetaData", "purpose": "FeatureInsight"},
                            "err": {"classification": "CallstackOrException", "purpose": "PerformanceAndHealth"}
                        }
                    */
                    this._reporter.sendTelemetryErrorEvent('server.err', {
                        type: 'http',
                        err: err,
                    });
                    console.log(`Unknown error: ${err}`);
                    reject();
                }
            });
            (_c = this._server) === null || _c === void 0 ? void 0 : _c.listen(this._connection.httpPort, this._connection.host);
        });
    }
    /**
     * @description contains the logic for content serving.
     * @param {string} basePath the path where the server index is located.
     * @param {http.IncomingMessage} req the request received
     * @param {http.ServerResponse} res the response to be loaded
     */
    async _serveStream(basePath, req, res) {
        var _a, _b, _c, _d, _e;
        const writeHeader = (code, contentType, contentLength) => {
            try {
                res.writeHead(code, {
                    ...(contentType ? { 'Content-Type': contentType } : {}),
                    ...(contentLength ? { 'Content-Length': contentLength } : {}),
                    // add CORP header for codespaces
                    // https://github.com/microsoft/vscode-livepreview/issues/560
                    ...{ 'Cross-Origin-Resource-Policy': 'cross-origin' },
                    ...this._defaultHeaders
                });
            }
            catch (e) {
                this._unsetDefaultHeaders(); // unset the headers so we don't keep trying to write them
                vscode.window.showErrorMessage(vscode.l10n.t('Error writing HTTP headers. Please double-check your Live Preview settings.'));
            }
        };
        const reportAndReturn = (status) => {
            // write the status to the header, send data for logging, then end.
            writeHeader(status);
            this._reportStatus(req, res);
            res.end();
        };
        if (!req || !req.url) {
            reportAndReturn(500);
            return;
        }
        const expectedUri = await this._connection.resolveExternalHTTPUri();
        const expectedHost = expectedUri.authority;
        if ((req.headers.host !== `localhost:${this._connection.httpPort}` &&
            req.headers.host !== this._connection.host &&
            req.headers.host !== expectedHost) ||
            (req.headers.origin &&
                req.headers.origin !== `${expectedUri.scheme}://${expectedHost}`)) {
            reportAndReturn(401); // unauthorized
            return;
        }
        let stream;
        let contentLength;
        if (req.url === constants_1.INJECTED_ENDPOINT_NAME) {
            const respInfo = this._contentLoader.loadInjectedJS();
            const contentType = (_a = respInfo.ContentType) !== null && _a !== void 0 ? _a : '';
            contentLength = respInfo.ContentLength;
            writeHeader(200, contentType, contentLength);
            stream = respInfo.Stream;
            stream === null || stream === void 0 ? void 0 : stream.pipe(res);
            return;
        }
        // can't use vscode.Uri.joinPath because that doesn't parse out the query
        const urlObj = vscode.Uri.parse(`${expectedUri.scheme}://${expectedUri.authority}${req.url}`);
        let URLPathName = urlObj.path;
        // start processing URL
        const writePageNotFound = (noServerRoot = false) => {
            const respInfo = noServerRoot ?
                this._contentLoader.createNoRootServer() :
                this._contentLoader.createPageDoesNotExist(absoluteReadPath);
            writeHeader(404, respInfo.ContentType, respInfo.ContentLength);
            this._reportStatus(req, res);
            stream = respInfo.Stream;
            stream === null || stream === void 0 ? void 0 : stream.pipe(res);
        };
        if (basePath === '' && (URLPathName === '/' || URLPathName === '')) {
            writePageNotFound(true);
            return;
        }
        let looseFile = false;
        URLPathName = decodeURI(URLPathName);
        let absoluteReadPath = path.join(basePath, URLPathName);
        let contentType = 'application/octet-stream';
        if (basePath === '') {
            if (URLPathName.startsWith('/endpoint_unsaved')) {
                const untitledFileName = URLPathName.substring(URLPathName.lastIndexOf('/') + 1);
                const content = await this._contentLoader.getFileStream(untitledFileName, false);
                if (content.Stream) {
                    stream = content.Stream;
                    contentType = (_b = content.ContentType) !== null && _b !== void 0 ? _b : '';
                    contentLength = content.ContentLength;
                    writeHeader(200, contentType, content.ContentLength);
                    stream.pipe(res);
                    return;
                }
            }
            const decodedReadPath = await this._endpointManager.decodeLooseFileEndpoint(URLPathName);
            looseFile = true;
            if (decodedReadPath &&
                (await pathUtil_1.PathUtil.FileExistsStat(decodedReadPath)).exists) {
                absoluteReadPath = decodedReadPath;
            }
            else {
                writePageNotFound();
                return;
            }
        }
        else if (!pathUtil_1.PathUtil.PathBeginsWith(absoluteReadPath, basePath)) {
            // double-check that we aren't serving parent files.
            // if this server's workspace is undefined, the the path is already checked because
            // the resolved path is already a child of the endpoint if it is to be decoded.
            absoluteReadPath = basePath;
        }
        // path should be valid now
        const absPathExistsStatInfo = await pathUtil_1.PathUtil.FileExistsStat(absoluteReadPath);
        if (!absPathExistsStatInfo.exists) {
            writePageNotFound();
            return;
        }
        if (absPathExistsStatInfo.stat && absPathExistsStatInfo.stat.isDirectory()) {
            if (!URLPathName.endsWith('/')) {
                const queries = urlObj.query;
                URLPathName = encodeURI(URLPathName);
                res.setHeader('Location', `${URLPathName}/${queries.length > 0 ? `?${queries}` : ''}`);
                reportAndReturn(302); // redirect
                return;
            }
            // Redirect to index.html if the request URL is a directory
            if ((await pathUtil_1.PathUtil.FileExistsStat(path.join(absoluteReadPath, 'index.html'))).exists) {
                absoluteReadPath = path.join(absoluteReadPath, 'index.html');
                const respInfo = await this._contentLoader.getFileStream(absoluteReadPath);
                stream = respInfo.Stream;
                contentType = (_c = respInfo.ContentType) !== null && _c !== void 0 ? _c : '';
                contentLength = respInfo.ContentLength;
            }
            else {
                // create a default index page
                const respInfo = await this._contentLoader.createIndexPage(absoluteReadPath, URLPathName, looseFile
                    ? pathUtil_1.PathUtil.GetEndpointParent(URLPathName)
                    : undefined);
                stream = respInfo.Stream;
                contentType = (_d = respInfo.ContentType) !== null && _d !== void 0 ? _d : '';
                contentLength = respInfo.ContentLength;
            }
        }
        else {
            const respInfo = await this._contentLoader.getFileStream(absoluteReadPath);
            stream = respInfo.Stream;
            contentType = (_e = respInfo.ContentType) !== null && _e !== void 0 ? _e : '';
            contentLength = respInfo.ContentLength;
        }
        if (stream) {
            stream.on('error', () => {
                reportAndReturn(500);
                return;
            });
            writeHeader(200, contentType, contentLength);
            stream.pipe(res);
        }
        else {
            reportAndReturn(500);
            return;
        }
        this._reportStatus(req, res);
        return;
    }
    /**
     * @returns the created HTTP server with the serving logic.
     */
    _createServer() {
        return http.createServer((req, res) => this._serveStream(this._basePath, req, res));
    }
    /**
     * @description send the server logging information to the terminal logging task.
     * @param {http.IncomingMessage} req the request object
     * @param {http.ServerResponse} res the response object
     */
    _reportStatus(req, res) {
        var _a, _b;
        this._onNewReqProcessed.fire({
            method: (_a = req.method) !== null && _a !== void 0 ? _a : '',
            url: (_b = req.url) !== null && _b !== void 0 ? _b : '',
            status: res.statusCode,
        });
    }
}
exports.HttpServer = HttpServer;
//# sourceMappingURL=httpServer.js.map