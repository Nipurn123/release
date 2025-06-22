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
exports.HTMLInjector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("../../utils/constants");
const dispose_1 = require("../../utils/dispose");
/**
 * @description the object responsible to loading the injected script and performing the appropriate replacements.
 * For more info about the script's purpose, see the jsdoc for `WSServer`.
 */
class HTMLInjector extends dispose_1.Disposable {
    constructor(_extensionUri, _connection) {
        super();
        this._connection = _connection;
        const scriptPath = path.join(_extensionUri.fsPath, 'media', 'injectScript.js');
        // Reading the file synchronously since the rawScript string must exist for the
        // object to function correctly.
        this.rawScript = fs.readFileSync(scriptPath, 'utf8').toString();
        this._initScript(this.rawScript, undefined, undefined);
        this._register(this._connection.onConnected((e) => {
            this._refresh(e.httpURI, e.wsURI);
        }));
    }
    /**
     * @description get the injected script (already has replacements).
     * For debugging, to serve non-injected files, just change this to always return the empty string.
     */
    get script() {
        return this._script;
    }
    /**
     * @description populate `this._script` with the script containing replacements for the server addresses.
     * @param {string} fileString the raw loaded script with no replacements yet.
     */
    async _initScript(fileString, httpUri, wsUri) {
        if (!httpUri) {
            httpUri = await this._connection.resolveExternalHTTPUri();
        }
        if (!wsUri) {
            wsUri = await this._connection.resolveExternalWSUri();
        }
        // if the HTTP scheme uses SSL, the WS scheme must also use SSL
        const wsURL = `${httpUri.scheme === 'https' ? 'wss' : 'ws'}://${wsUri.authority}${wsUri.path}`;
        let httpURL = `${httpUri.scheme}://${httpUri.authority}`;
        if (httpURL.endsWith('/')) {
            httpURL = httpURL.substring(httpURL.length - 1);
        }
        const replacements = [
            { original: constants_1.WS_URL_PLACEHOLDER, replacement: wsURL },
            { original: constants_1.HTTP_URL_PLACEHOLDER, replacement: httpURL },
        ];
        this._script = this._replace(fileString, replacements);
    }
    /**
     * @param {string} script the main string to perform replacements on
     * @param {IReplaceObj[]} replaces array replacements to make
     * @returns {string} string with all replacements performed on.
     */
    _replace(script, replaces) {
        replaces.forEach((replace) => {
            const placeHolderIndex = script.indexOf(replace.original);
            script =
                script.substring(0, placeHolderIndex) +
                    replace.replacement +
                    script.substring(placeHolderIndex + replace.original.length);
        });
        return script;
    }
    /**
     * @description re-populate the script field with replacements. Will re-query the connection manager for the port and host.
     */
    async _refresh(httpUri, wsUri) {
        await this._initScript(this.rawScript, httpUri, wsUri);
    }
}
exports.HTMLInjector = HTMLInjector;
//# sourceMappingURL=HTMLInjector.js.map