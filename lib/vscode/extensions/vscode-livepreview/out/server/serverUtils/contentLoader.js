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
exports.ContentLoader = void 0;
const Stream = __importStar(require("stream"));
const fs = __importStar(require("fs"));
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const mime = __importStar(require("mime"));
const dispose_1 = require("../../utils/dispose");
const utils_1 = require("../../utils/utils");
const HTMLInjector_1 = require("./HTMLInjector");
const pathUtil_1 = require("../../utils/pathUtil");
const constants_1 = require("../../utils/constants");
/**
 * @description object responsible for loading content requested by the HTTP server.
 */
class ContentLoader extends dispose_1.Disposable {
    constructor(_extensionUri, _reporter, _endpointManager, _connection) {
        super();
        this._reporter = _reporter;
        this._endpointManager = _endpointManager;
        this._connection = _connection;
        this._servedFiles = new Set();
        this._insertionTags = ['head', 'body', 'html', '!DOCTYPE'];
        this._scriptInjector = new HTMLInjector_1.HTMLInjector(_extensionUri, _connection);
    }
    /**
     * @description reset the list of served files; served files are used to watch changes for when being changed in the editor.
     */
    resetServedFiles() {
        this._servedFiles = new Set();
    }
    /**
     * @returns the files served by the HTTP server
     */
    get servedFiles() {
        return this._servedFiles;
    }
    /**
     * @returns the script tags needed to reference the custom script endpoint.
     */
    get _scriptInjection() {
        return `<script type="text/javascript" src="${constants_1.INJECTED_ENDPOINT_NAME}"></script>`;
    }
    /**
     * @returns {IRespInfo} the injected script and its content type.
     */
    loadInjectedJS() {
        var _a, _b;
        const fileString = Buffer.from((_b = (_a = this._scriptInjector) === null || _a === void 0 ? void 0 : _a.script) !== null && _b !== void 0 ? _b : '');
        return {
            Stream: Stream.Readable.from(fileString),
            ContentType: 'text/javascript; charset=UTF-8',
            ContentLength: fileString.length,
        };
    }
    /**
     * @description create a "page does not exist" page to pair with the 404 error.
     * @param relativePath the path that does not exist
     * @returns {IRespInfo} the response information
     */
    createPageDoesNotExist(relativePath) {
        /* __GDPR__
            "server.pageDoesNotExist" : {}
        */
        this._reporter.sendTelemetryEvent('server.pageDoesNotExist');
        const fileNotFound = vscode.l10n.t('File not found');
        const relativePathFormatted = `<b>"${relativePath}"</b>`;
        const fileNotFoundMsg = vscode.l10n.t('The file {0} cannot be found. It may have been moved, edited, or deleted.', relativePathFormatted);
        const htmlString = Buffer.from(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>${fileNotFound}</title>
			</head>
			<body>
				<h1>${fileNotFound}</h1>
				<p>${fileNotFoundMsg}</p>
			</body>
			${this._scriptInjection}
		</html>
		`);
        return {
            Stream: Stream.Readable.from(htmlString),
            ContentType: 'text/html; charset=UTF-8',
            ContentLength: htmlString.length,
        };
    }
    /**
     * @description In a multi-root case, the index will not lead to anything. Create this page to list all possible indices to visit.
     * @returns {IRespInfo} the response info
     */
    createNoRootServer() {
        const noServerRoot = vscode.l10n.t('No Server Root');
        const noWorkspaceOpen = vscode.l10n.t('This server is not based inside of a workspace, so the index does not direct to anything.');
        const customMsg = `<p>${noWorkspaceOpen}</p>`;
        const htmlString = Buffer.from(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>${noServerRoot}</title>
			</head>
			<body>
				<h1>${noServerRoot}</h1>
				${customMsg}
			</body>
			${this._scriptInjection}
		</html>
		`);
        return {
            Stream: Stream.Readable.from(htmlString),
            ContentType: 'text/html; charset=UTF-8',
            ContentLength: htmlString.length,
        };
    }
    /**
     * @description Create a defaut index page (served if no `index.html` file is available for the directory).
     * @param {string} readPath the absolute path visited.
     * @param {string} relativePath the relative path (from workspace root).
     * @param {string} titlePath the path shown in the title.
     * @returns {Promise<IRespInfo>} the response info.
     */
    async createIndexPage(readPath, relativePath, titlePath = relativePath) {
        /* __GDPR__
            "server.indexPage" : {}
        */
        this._reporter.sendTelemetryEvent('server.indexPage');
        const childFiles = await this.fsReadDir(readPath);
        const fileEntries = new Array();
        const dirEntries = new Array();
        if (relativePath != '/') {
            dirEntries.push({ LinkSrc: '..', LinkName: '..', DateTime: '' });
        }
        for (const childFile of childFiles) {
            const relativeFileWithChild = path.join(relativePath, childFile);
            const absolutePath = path.join(readPath, childFile);
            const fileStats = (await pathUtil_1.PathUtil.FileExistsStat(absolutePath)).stat;
            if (!fileStats) {
                continue;
            }
            const modifiedDateTimeString = (0, utils_1.FormatDateTime)(fileStats.mtime);
            if (fileStats.isDirectory()) {
                dirEntries.push({
                    LinkSrc: relativeFileWithChild,
                    LinkName: childFile,
                    DateTime: modifiedDateTimeString,
                });
            }
            else {
                const fileSize = (0, utils_1.FormatFileSize)(fileStats.size);
                fileEntries.push({
                    LinkSrc: relativeFileWithChild,
                    LinkName: childFile,
                    FileSize: fileSize,
                    DateTime: modifiedDateTimeString,
                });
            }
        }
        let directoryContents = '';
        dirEntries.forEach((elem) => (directoryContents += `
				<tr>
				<td><a href="${elem.LinkSrc}/">${elem.LinkName}/</a></td>
				<td></td>
				<td>${elem.DateTime}</td>
				</tr>\n`));
        fileEntries.forEach((elem) => (directoryContents += `
				<tr>
				<td><a href="${elem.LinkSrc}">${elem.LinkName}</a></td>
				<td>${elem.FileSize}</td>
				<td>${elem.DateTime}</td>
				</tr>\n`));
        const indexOfTitlePath = vscode.l10n.t('Index of {0}', titlePath);
        const name = vscode.l10n.t('Name');
        const size = vscode.l10n.t('Size');
        const dateModified = vscode.l10n.t('Date Modified');
        const htmlString = Buffer.from(`
		<!DOCTYPE html>
		<html>
			<head>
				<style>
					table td {
						padding:4px;
					}
				</style>
				<title>${indexOfTitlePath}</title>
			</head>
			<body>
			<h1>${indexOfTitlePath}</h1>

			<table>
				<th>${name}</th><th>${size}</th><th>${dateModified}</th>
				${directoryContents}
			</table>
			</body>

			${this._scriptInjection}
		</html>
		`);
        return {
            Stream: Stream.Readable.from(htmlString),
            ContentType: 'text/html; charset=UTF-8',
            ContentLength: htmlString.length,
        };
    }
    /**
     * @description get the file contents and load it into a form that can be served.
     * @param {string} readPath the absolute file path to read from
     * @param {boolean} inFilesystem whether the path is in the filesystem (false for untitled files in editor)
     * @returns {IRespInfo} the response info
     */
    async getFileStream(readPath, inFilesystem = true) {
        var _a;
        this._servedFiles.add(readPath);
        const workspaceDocuments = vscode.workspace.textDocuments;
        let i = 0;
        let stream;
        let contentType = (_a = mime.getType(readPath)) !== null && _a !== void 0 ? _a : 'text/plain';
        let contentLength = 0;
        while (i < workspaceDocuments.length) {
            if (pathUtil_1.PathUtil.PathEquals(readPath, workspaceDocuments[i].fileName)) {
                if (inFilesystem && workspaceDocuments[i].isUntitled) {
                    continue;
                }
                let fileContents = workspaceDocuments[i].getText();
                if (workspaceDocuments[i].languageId == 'html') {
                    fileContents = this._injectIntoFile(fileContents);
                    contentType = 'text/html';
                }
                const fileContentsBuffer = Buffer.from(fileContents);
                stream = Stream.Readable.from(fileContentsBuffer);
                contentLength = fileContentsBuffer.length;
                break;
            }
            i++;
        }
        if (inFilesystem && i == workspaceDocuments.length) {
            if ((0, utils_1.isFileInjectable)(readPath)) {
                const buffer = await pathUtil_1.PathUtil.FileRead(readPath);
                const injectedFileContents = this._injectIntoFile(buffer.toString());
                const injectedFileContentsBuffer = Buffer.from(injectedFileContents);
                stream = Stream.Readable.from(injectedFileContentsBuffer);
                contentLength = injectedFileContentsBuffer.length;
            }
            else {
                stream = fs.createReadStream(readPath);
                contentLength = fs.statSync(readPath).size;
            }
        }
        if (contentType.startsWith('text/')) {
            contentType = `${contentType}; charset=UTF-8`;
        }
        return {
            Stream: stream,
            ContentType: contentType,
            ContentLength: contentLength
        };
    }
    /**
     * Inject the script tags to reference the custom Live Preview script.
     * NOTE: they are injected on the same line as existing content to ensure that
     * the debugging works, since `js-debug` relies on the line numbers on the filesystem
     * matching the served line numbers.
     * @param {string} contents the contents to inject.
     * @returns {string} the injected string.
     */
    _injectIntoFile(contents) {
        // order of preference for script placement:
        // 1. after <head>
        // 2. after <body>
        // 3. after <html>
        // 4. after <!DOCTYPE >
        // 5. at the very beginning
        let re;
        let tagEnd = 0;
        for (const tag of this._insertionTags) {
            re = new RegExp(`<${tag}[^>]*>`, 'g');
            re.test(contents);
            tagEnd = re.lastIndex;
            if (tagEnd != 0) {
                break;
            }
        }
        const newContents = contents.substring(0, tagEnd) +
            this._scriptInjection +
            contents.substring(tagEnd);
        return newContents;
    }
    fsReadDir(path) {
        return (new Promise((resolve) => fs.readdir(path, (err, files) => {
            resolve(err ? [] : files);
        })));
    }
}
exports.ContentLoader = ContentLoader;
//# sourceMappingURL=contentLoader.js.map