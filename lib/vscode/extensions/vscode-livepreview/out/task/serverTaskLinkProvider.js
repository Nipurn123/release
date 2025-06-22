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
exports.serverTaskLinkProvider = void 0;
const vscode = __importStar(require("vscode"));
const url_1 = require("url");
const dispose_1 = require("../utils/dispose");
const pathUtil_1 = require("../utils/pathUtil");
const constants_1 = require("../utils/constants");
const utils_1 = require("../utils/utils");
/**
 * @description the link provider that runs on Live Preview's `Run Server` task
 */
class serverTaskLinkProvider extends dispose_1.Disposable {
    constructor(_reporter, _endpointManager, _connectionManager) {
        super();
        this._reporter = _reporter;
        this._endpointManager = _endpointManager;
        this._connectionManager = _connectionManager;
        // Triggers the editor to open a file, but to the side of the preview,
        // which means that the manager must use the panel column info from the preview
        // to open the file in a column where the preview is not.
        this._onRequestOpenEditorToSide = this._register(new vscode.EventEmitter());
        this.onRequestOpenEditorToSide = this._onRequestOpenEditorToSide.event;
        this._onShouldLaunchPreview = this._register(new vscode.EventEmitter());
        this.onShouldLaunchPreview = this._onShouldLaunchPreview.event;
        vscode.window.registerTerminalLinkProvider(this);
    }
    async provideTerminalLinks(context, token) {
        const links = new Array();
        if (!context.terminal.creationOptions.name ||
            !this._isLivePreviewTerminal(context.terminal.creationOptions.name)) {
            return links;
        }
        await Promise.all(this._connectionManager.connections.map((connection) => this._findFullLinkRegex(context.line, links, connection)));
        this._findPathnameRegex(context.line, links);
        return links;
    }
    async handleTerminalLink(link) {
        /* __GDPR__
            "task.terminal.handleTerminalLink" : {}
        */
        this._reporter.sendTelemetryEvent('task.terminal.handleTerminalLink');
        if (link.inEditor) {
            await this._openRelativeLinkInWorkspace(link.data, link.isDir);
        }
        else {
            const uri = vscode.Uri.parse(link.data);
            this._onShouldLaunchPreview.fire({ uri });
        }
    }
    /**
     * @param {string} terminalName the terminal name of the target terminal
     * @returns Whether it is a task terminal from the `Live Preview - Run Server` task.
     */
    _isLivePreviewTerminal(terminalName) {
        return terminalName.indexOf(constants_1.TASK_TERMINAL_BASE_NAME) != -1; // there may be additional terminal text in a multi-root workspace
    }
    /**
     * Collects the printed pathnames (e.g. `/file.html`) as terminal links.
     * @param {string} input the line read from the terminal.
     * @param {Array<vscode.TerminalLink>} links the array of links (pass-by-reference) that are added to.
     */
    _findPathnameRegex(input, links) {
        // match relative links
        const partialLinkRegex = new RegExp(`(?<=\\s)\\/([^\\0<>\\?\\|\\s!\`&*()\\[\\]'":;]*)\\?*[\\w=]*`, 'g');
        let partialLinkMatches;
        do {
            partialLinkMatches = partialLinkRegex.exec(input);
            if (partialLinkMatches) {
                for (let i = 0; i < partialLinkMatches.length; i++) {
                    if (partialLinkMatches[i]) {
                        const queryIndex = partialLinkMatches[i].lastIndexOf('?');
                        const link = queryIndex == -1
                            ? partialLinkMatches[i]
                            : partialLinkMatches[i].substring(0, queryIndex);
                        const isDir = link.endsWith('/');
                        const tooltip = isDir
                            ? vscode.l10n.t('Reveal Folder ')
                            : vscode.l10n.t('Open File ');
                        const tl = {
                            startIndex: partialLinkMatches.index,
                            length: partialLinkMatches[i].length,
                            tooltip: tooltip,
                            data: link,
                            inEditor: true,
                            isDir: isDir,
                        };
                        links.push(tl);
                    }
                }
            }
        } while (partialLinkMatches);
    }
    /**
     * Detects the host address (e.g. http://127.0.0.1:3000) as a terminal link.
     * @param {string} input the line read from the terminal.
     * @param {Array<vscode.TerminalLink>} links the array of links (pass-by-reference) that are added to.
     */
    async _findFullLinkRegex(input, links, connection) {
        const hostUri = connection.constructLocalUri(connection.httpPort);
        const extHostUri = await connection.resolveExternalHTTPUri();
        const extHostStr = (0, utils_1.escapeRegExp)(`${extHostUri.scheme}://${extHostUri.authority}`);
        const fullLinkRegex = new RegExp(`(?:${extHostStr})[\\w\\-.~:/?#[\\]@!$&()*+,;=]*`, 'g');
        let fullURLMatches;
        do {
            fullURLMatches = fullLinkRegex.exec(input);
            if (fullURLMatches) {
                for (let i = 0; i < fullURLMatches.length; i++) {
                    if (fullURLMatches[i]) {
                        const url = new url_1.URL(fullURLMatches[i]);
                        const tl = {
                            startIndex: fullURLMatches.index,
                            length: fullURLMatches[i].length,
                            tooltip: vscode.l10n.t('Open in Preview'),
                            data: vscode.Uri.joinPath(hostUri, url.pathname),
                            inEditor: false,
                        };
                        links.push(tl);
                    }
                }
            }
        } while (fullURLMatches);
    }
    /**
     * Opens a terminal link in the editor.
     * Expected behavior:
     * - If it's a filename, show files by opening them in editor.
     * - If it's a directory, highlight it in the file explorer. Will show an error if that directory is not in the current workspace(s).
     * @param {string} file the path to open in the editor
     * @param {boolean} isDir whether it is a directory.
     */
    async _openRelativeLinkInWorkspace(file, isDir) {
        var _a;
        file = unescape(file);
        const workspace = await pathUtil_1.PathUtil.GetWorkspaceFromRelativePath(file);
        const connection = this._connectionManager.getConnection(workspace);
        const uri = connection ? connection.getAppendedURI(file) : vscode.Uri.file((_a = await this._endpointManager.decodeLooseFileEndpoint(file)) !== null && _a !== void 0 ? _a : '');
        if (isDir) {
            if (!pathUtil_1.PathUtil.GetWorkspaceFromAbsolutePath(uri.fsPath)) {
                vscode.window.showErrorMessage('Cannot reveal folder. It is not in the open workspace.');
            }
            else {
                vscode.commands.executeCommand('revealInExplorer', uri);
            }
        }
        else {
            this._onRequestOpenEditorToSide.fire(uri);
        }
    }
}
exports.serverTaskLinkProvider = serverTaskLinkProvider;
//# sourceMappingURL=serverTaskLinkProvider.js.map