"use strict";
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
exports.ExternalBrowserUtils = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const settingsUtil_1 = require("./settingsUtil");
const vscode = __importStar(require("vscode"));
class ExternalBrowserUtils {
    static async openInBrowser(target, browser) {
        if (vscode.env.appHost !== 'desktop' || browser === settingsUtil_1.CustomExternalBrowser.default) {
            vscode.env.openExternal(vscode.Uri.parse(target));
            return;
        }
        try {
            const browserStr = browser.toLowerCase(); // the debug companion expects lowercase browser names
            vscode.commands.executeCommand('js-debug-companion.launch', { browserType: browserStr, URL: target });
        }
        catch (e) {
            vscode.env.openExternal(vscode.Uri.parse(target));
        }
    }
}
exports.ExternalBrowserUtils = ExternalBrowserUtils;
//# sourceMappingURL=externalBrowserUtils.js.map