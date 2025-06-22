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
exports.EndpointManager = void 0;
const dispose_1 = require("../utils/dispose");
const pathUtil_1 = require("../utils/pathUtil");
const vscode = __importStar(require("vscode"));
/**
 * @description the object that manages the server endpoints for files outside of the default workspace
 *
 * encoding: actual file location -> endpoint used to access from server.
 * decoding: endpoint used to access from server -> actual file location.
 */
class EndpointManager extends dispose_1.Disposable {
    constructor() {
        super();
        // manages encoding and decoding endpoints
        this.validEndpointRoots = new Set();
        let i = 0;
        const workspaceDocuments = vscode.workspace.textDocuments;
        while (i < workspaceDocuments.length) {
            if (!workspaceDocuments[i].isUntitled &&
                !pathUtil_1.PathUtil.GetWorkspaceFromAbsolutePath(workspaceDocuments[i].fileName)) {
                this.encodeLooseFileEndpoint(workspaceDocuments[i].fileName);
            }
            i++;
        }
    }
    /**
     * @param location the file location to encode.
     * @returns the encoded endpoint.
     */
    async encodeLooseFileEndpoint(location) {
        let fullParent = await pathUtil_1.PathUtil.GetParentDir(location);
        const child = await pathUtil_1.PathUtil.GetFileName(location, true);
        fullParent = pathUtil_1.PathUtil.ConvertToPosixPath(fullParent);
        this.validEndpointRoots.add(fullParent);
        let endpoint_prefix = `/endpoint_unsaved`;
        if ((await pathUtil_1.PathUtil.FileExistsStat(location)).exists) {
            endpoint_prefix = this.changePrefixesForAbsPathEncode(fullParent);
        }
        endpoint_prefix = pathUtil_1.PathUtil.EscapePathParts(endpoint_prefix);
        // don't use path.join so that we don't remove leading slashes
        const ret = `${endpoint_prefix}/${child}`;
        return ret;
    }
    /**
     * @param {string} urlPath the endpoint to check
     * @returns {string | undefined} the filesystem path that it loads or undefined if it doesn't decode to anything.
     */
    async decodeLooseFileEndpoint(urlPath) {
        const path = this.changePrefixesForAbsPathDecode(pathUtil_1.PathUtil.UnescapePathParts(urlPath));
        const actualPath = this.validPath(path);
        if (actualPath) {
            const exists = (await pathUtil_1.PathUtil.FileExistsStat(actualPath)).exists;
            if (exists) {
                return actualPath;
            }
        }
        return undefined;
    }
    /**
     * @param {string} file the endpoint to check
     * @returns {boolean} whether the endpoint can be decoded to an acutal file path.
     */
    validPath(file) {
        for (const item of this.validEndpointRoots.values()) {
            for (const fileVariations of [file, `/${file}`]) { // if it's a unix path, it will be prepended by a `/`
                if (fileVariations.startsWith(item)) {
                    return fileVariations;
                }
            }
        }
        return undefined;
    }
    /**
     * Performs the prefix changes that happen when decoding an absolute file path.
     * Public so that the link previewer can use it to create a file URI.
     * @param urlPath
     */
    changePrefixesForAbsPathDecode(urlPath) {
        let path = urlPath;
        if (urlPath.startsWith('/') && urlPath.length > 1) {
            path = urlPath.substring(1);
        }
        if (urlPath.startsWith('unc/')) {
            path = `//${urlPath.substring(4)}`;
        }
        return path;
    }
    /**
     * Performs the prefix changes that happen when encoding an absolute file path.
     * @param urlPath
     */
    changePrefixesForAbsPathEncode(urlPath) {
        let path = `/${urlPath}`;
        if (urlPath.startsWith(`//`) && urlPath.length > 2) {
            // use `unc` to differentiate UNC paths
            path = `/unc/${urlPath.substring(2)}`;
        }
        return path;
    }
}
exports.EndpointManager = EndpointManager;
//# sourceMappingURL=endpointManager.js.map