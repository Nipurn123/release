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
exports.PathUtil = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const settingsUtil_1 = require("./settingsUtil");
/**
 * A collection of functions to perform path operations
 */
class PathUtil {
    /**
     * @description escapes a path, but keeps the `/` delimeter intact.
     * @param {string} file the file path to escape.
     * @returns {string} the escaped path.
     */
    static EscapePathParts(file) {
        file = decodeURI(file);
        const parts = file.split('/');
        const newParts = parts
            .filter((part) => part.length > 0)
            .map((filterdPart) => encodeURI(filterdPart));
        return newParts.join('/');
    }
    /**
     * @description reverses the work performed by `PathUtil.EscapePathParts`.
     * @param {string} file the file path to unescape.
     * @returns {string} the unescaped path.
     */
    static UnescapePathParts(file) {
        const parts = file.split('/');
        const newParts = parts
            .filter((part) => part.length > 0)
            .map((filterdPart) => decodeURI(filterdPart));
        return newParts.join('/');
    }
    /**
     * @param {string} file a file path.
     * @returns {string} The parent pathname that the file belongs to; e.g. `c:/a/file/path.txt` returns `c:/a/file/`.
     * Using `c:/a/file/` should return `c:/a/file/` since `c:/a/file/` is a directory already.
     */
    static async GetParentDir(file) {
        const existsStatInfo = await PathUtil.FileExistsStat(file);
        if (existsStatInfo.exists && existsStatInfo.stat && existsStatInfo.stat.isDirectory()) {
            return file;
        }
        return path.dirname(file);
    }
    /**
     * @param {string} file a file path.
     * @param {boolean} returnEmptyOnDir whether to return an empty string when given an existing directory.
     * @returns {string} The filename from the path; e.g. `c:/a/file/path.txt` returns `path.txt`.
     */
    static async GetFileName(file, returnEmptyOnDir = false) {
        if (returnEmptyOnDir) {
            const existsStatInfo = await PathUtil.FileExistsStat(file);
            if (existsStatInfo.exists && existsStatInfo.stat && existsStatInfo.stat.isDirectory()) {
                return '';
            }
        }
        return path.basename(file);
    }
    /**
     * @param {string} file1
     * @param {string} file2
     * @returns {boolean} whether `file1` and `file2` are equal when using the same path delimeter
     */
    static PathEquals(file1, file2) {
        return path.normalize(file1) === path.normalize(file2);
    }
    /**
     * @param {string} file1
     * @param {string} file2
     * @returns {boolean} whether `file1` is a child of `file2`.
     */
    static PathBeginsWith(file1, file2) {
        return path.normalize(file1).startsWith(path.normalize(file2 + '/'));
    }
    /**
     * @param {string} file the file to convert
     * @returns {string} the file path using the `/` posix-compliant path delimeter.
     */
    static ConvertToPosixPath(file) {
        return file.split(path.sep).join(path.posix.sep);
    }
    /**
     * Get file path relative to workspace root.
     * @param file
     * @returns relative path (or undefined if the file does not belong to a workspace)
     */
    static async getPathRelativeToWorkspace(file) {
        const workspaceFolder = await PathUtil.GetWorkspaceFromURI(file);
        if (!workspaceFolder) {
            return undefined;
        }
        return file.fsPath.substring(workspaceFolder.uri.fsPath.length);
    }
    /**
     * @param {string} file the child path of the `Users` directory of the user data dir.
     * @returns {string} the path to the `Users` directory of the user data dir.
     */
    static GetUserDataDirFromStorageUri(file) {
        // a little hacky, but should work to find the target dir.
        if (!file) {
            return file;
        }
        file = PathUtil.ConvertToPosixPath(file);
        const parts = file.split('/');
        const newParts = [];
        for (const part of parts) {
            if (part.length > 0) {
                newParts.push(part);
            }
            if (part == 'User') {
                break;
            }
        }
        return newParts.join('/');
    }
    static async GetWorkspaceFromURI(file) {
        return await PathUtil.GetWorkspaceFromAbsolutePath(file.fsPath);
    }
    /**
     * @description Similar to `_absPathInWorkspace`, but checks all workspaces and returns the matching workspace.
     * @param {string} file path to test.
     * @returns {vscode.WorkspaceFolder | undefined} the workspace it belongs to
     */
    static async GetWorkspaceFromAbsolutePath(file) {
        const workspaces = vscode.workspace.workspaceFolders;
        if (!workspaces) {
            return undefined;
        }
        const checkPathBeginsWithForWorkspace = async (workspace, file) => {
            const rootPrefix = await PathUtil.GetValidServerRootForWorkspace(workspace);
            return PathUtil.PathBeginsWith(file, path.join(workspace.uri.fsPath, rootPrefix)) ? workspace : undefined;
        };
        const validWorkspacesForFile = await Promise.all(workspaces === null || workspaces === void 0 ? void 0 : workspaces.map((workspace) => {
            return checkPathBeginsWithForWorkspace(workspace, file);
        }));
        return validWorkspacesForFile.find((workspace) => (workspace !== undefined));
    }
    /**
     * @description Just like `pathExistsRelativeToDefaultWorkspace`, but tests all workspaces and returns the matching workspace.
     * Assumes that the file is relative to the root prefix in settings.
     * @param {string} file path to test.
     * @returns {vscode.WorkspaceFolder | undefined} the workspace it belongs to
     */
    static async GetWorkspaceFromRelativePath(file, ignoreFileRoot = false) {
        const workspaces = vscode.workspace.workspaceFolders;
        if (!workspaces) {
            return undefined;
        }
        const checkFileExistsStatForWorkspace = async (workspace) => {
            const rootPrefix = ignoreFileRoot ? '' : await PathUtil.GetValidServerRootForWorkspace(workspace);
            return (await PathUtil.FileExistsStat(path.join(workspace.uri.fsPath, rootPrefix, file))).exists;
        };
        const promises = workspaces.map((workspace) => checkFileExistsStatForWorkspace(workspace));
        const idx = (await Promise.all(promises)).findIndex((exists) => exists);
        if (idx === -1) {
            return undefined;
        }
        return workspaces[idx];
    }
    /**
     * @description used to get the `serverRoot` setting properly, as it is only applied when using it would make a valid path
     * @param workspace
     * @returns the server root from settings if it would point to an existing directory
     */
    static async GetValidServerRootForWorkspace(workspace) {
        const root = settingsUtil_1.SettingUtil.GetConfig(workspace).serverRoot;
        return (await PathUtil.FileExistsStat(path.join(workspace.uri.fsPath, root))).exists ? root : '';
    }
    /**
     * @param file
     * @returns object containing exists and stat info
     */
    static async FileExistsStat(file) {
        return fs.promises.stat(file)
            .then((stat) => { return { exists: true, stat }; })
            .catch(() => { return { exists: false, stat: undefined }; });
    }
    /**
     * Reads file in utf-8 encoding.
     * @param file
     * @returns file contents (or empty string if error encountered)
     */
    static async FileRead(file) {
        return fs.promises.readFile(file, 'utf-8')
            .then((data) => data.toString())
            .catch(() => '');
    }
    /**
     * Get the immediate parent of the encoded endpoint directory path. Needed to create index pages
     * @param urlPath
     */
    static GetEndpointParent(urlPath) {
        let endpoint = urlPath.endsWith('/')
            ? urlPath.substring(0, urlPath.length - 1)
            : urlPath;
        endpoint = endpoint.split('/').pop();
        if (!endpoint) {
            return '.';
        }
        return decodeURI(endpoint);
    }
}
exports.PathUtil = PathUtil;
// used to idetify the path separators, `/` or `\\`.
PathUtil._pathSepRegex = /(?:\\|\/)+/;
//# sourceMappingURL=pathUtil.js.map