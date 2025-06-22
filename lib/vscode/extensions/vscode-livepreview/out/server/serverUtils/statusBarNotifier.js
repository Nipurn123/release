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
exports.StatusBarNotifier = void 0;
const vscode = __importStar(require("vscode"));
const dispose_1 = require("../../utils/dispose");
/**
 * @description the status bar handler.
 * The flow is inspired by status bar in original Live Server extension:
 * https://github.com/ritwickdey/vscode-live-server/blob/master/src/StatusbarUi.ts
 */
class StatusBarNotifier extends dispose_1.Disposable {
    constructor() {
        super();
        this._statusBar = this._register(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100));
        this._statusBar.name = vscode.l10n.t('Live Preview Ports');
        this.serverOff();
        this._on = false;
        this._ports = new Map();
    }
    /**
     * @description called to notify that the server turned on.
     */
    setServer(uri, port) {
        this._on = true;
        this._statusBar.show();
        this._ports.set(uri === null || uri === void 0 ? void 0 : uri.toString(), port);
        this._refreshBar();
    }
    _refreshBar() {
        let portsLabel;
        let portsTooltip;
        if (this._ports.size === 1) {
            const port = this._ports.values().next().value;
            portsLabel = vscode.l10n.t('Port: {0}', port);
        }
        else {
            if (this._ports.size === 2) {
                portsLabel = vscode.l10n.t('Ports: {0}', Array.from(this._ports.values()).join(', '));
            }
            else {
                portsLabel = vscode.l10n.t('{0} Ports', this._ports.size);
            }
        }
        const bulletPoints = [];
        this._ports.forEach((port, uriString) => {
            try {
                const workspace = uriString
                    ? vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(uriString))
                    : undefined;
                bulletPoints.push(`\n\t• ${port} (${workspace
                    ? workspace.name
                    : vscode.l10n.t('non-workspace files')})`);
            }
            catch {
                // no op
            }
        });
        portsTooltip =
            this._ports.size == 1
                ? vscode.l10n.t('Live Preview running on port:')
                : vscode.l10n.t('Live Preview running on ports:') + ' ';
        portsTooltip += bulletPoints.join('');
        this._statusBar.tooltip = portsTooltip;
        this._statusBar.text = `$(radio-tower) ${portsLabel}`;
        this._statusBar.command = {
            title: vscode.l10n.t('Open Command Palette'),
            command: 'workbench.action.quickOpen',
            arguments: ['>Live Preview: '],
        };
    }
    /**
     * @description called to notify that all of the servers are off
     */
    serverOff() {
        this._on = false;
        this._statusBar.hide();
    }
    /**
     * @description called to notify that a server shut down.
     */
    removeServer(uri) {
        this._ports.delete(uri === null || uri === void 0 ? void 0 : uri.toString());
        if (this._ports.size === 0) {
            this.serverOff();
        }
        else {
            this._refreshBar();
        }
    }
}
exports.StatusBarNotifier = StatusBarNotifier;
//# sourceMappingURL=statusBarNotifier.js.map