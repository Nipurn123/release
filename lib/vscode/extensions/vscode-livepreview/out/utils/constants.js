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
exports.DEFAULT_HTTP_HEADERS = exports.TASK_TERMINAL_BASE_NAME = exports.LIVE_PREVIEW_SERVER_ON = exports.UriSchemes = exports.INJECTED_ENDPOINT_NAME = exports.OUTPUT_CHANNEL_NAME = exports.EXTENSION_ID = exports.DEFAULT_HOST = exports.OPEN_EXTERNALLY = exports.DONT_SHOW_AGAIN = exports.INIT_PANEL_TITLE = exports.HTTP_URL_PLACEHOLDER = exports.WS_URL_PLACEHOLDER = void 0;
const vscode = __importStar(require("vscode"));
exports.WS_URL_PLACEHOLDER = '${WS_URL}';
exports.HTTP_URL_PLACEHOLDER = '${HTTP_URL}';
exports.INIT_PANEL_TITLE = '/';
exports.DONT_SHOW_AGAIN = {
    title: vscode.l10n.t("Don't Show Again"),
};
exports.OPEN_EXTERNALLY = {
    title: vscode.l10n.t('Open Externally'),
};
exports.DEFAULT_HOST = '127.0.0.1';
exports.EXTENSION_ID = 'ms-vscode.live-server';
exports.OUTPUT_CHANNEL_NAME = vscode.l10n.t('Embedded Live Preview Console');
exports.INJECTED_ENDPOINT_NAME = '/___vscode_livepreview_injected_script';
exports.UriSchemes = {
    file: 'file',
    vscode_webview: 'vscode-webview',
    vscode_userdata: 'vscode-userdata',
    untitled: 'untitled',
};
exports.LIVE_PREVIEW_SERVER_ON = 'LivePreviewServerOn';
exports.TASK_TERMINAL_BASE_NAME = vscode.l10n.t('Run Server');
exports.DEFAULT_HTTP_HEADERS = { 'Accept-Ranges': 'bytes' };
//# sourceMappingURL=constants.js.map