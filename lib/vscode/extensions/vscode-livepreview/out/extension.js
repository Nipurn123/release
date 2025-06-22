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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const vscode_extension_telemetry_1 = __importDefault(require("vscode-extension-telemetry"));
const constants_1 = require("./utils/constants");
const pathUtil_1 = require("./utils/pathUtil");
const settingsUtil_1 = require("./utils/settingsUtil");
const manager_1 = require("./manager");
let reporter;
let serverPreview;
function activate(context) {
    var _a, _b, _c;
    const extPackageJSON = context.extension.packageJSON;
    reporter = new vscode_extension_telemetry_1.default(constants_1.EXTENSION_ID, extPackageJSON.version, extPackageJSON.aiKey);
    serverPreview = new manager_1.Manager(context.extensionUri, reporter, pathUtil_1.PathUtil.GetUserDataDirFromStorageUri((_a = context.storageUri) === null || _a === void 0 ? void 0 : _a.fsPath));
    /* __GDPR__
        "extension.startUp" : {
            "numWorkspaceFolders" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
        }
    */
    reporter.sendTelemetryEvent('extension.startUp', {}, { numWorkspaceFolders: (_c = (_b = vscode.workspace.workspaceFolders) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0 });
    context.subscriptions.push(reporter);
    // Auto-activate preview button on HTML files
    const autoInitializeLivePreview = async () => {
        try {
            // Add Live Preview button to UI 
            await vscode.commands.executeCommand("setContext", "livePreview.isBuiltIn", true);
            // Only auto-open if an HTML file is open on startup
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.languageId === 'html') {
                // We don't auto-open preview but ensure the UI shows the preview button
                console.log("Live Preview extension activated with HTML file open");
            }
        }
        catch (error) {
            console.log(`Error initializing Live Preview: ${error}`);
        }
    };
    // Call the auto-initialize function
    autoInitializeLivePreview();
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.start`, async () => {
        serverPreview.openPreview();
    }));
    /**
     * Not used directly by the extension, but can be called by a task or another extension to open a preview at a file
     */
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.start.preview.atFileString`, async (filePath) => {
        filePath = filePath !== null && filePath !== void 0 ? filePath : '/';
        await serverPreview.openPreviewAtFileString(filePath);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.start.preview.atFile`, async (file, options) => {
        await serverPreview.openPreviewAtFileUri(file, options);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.start.debugPreview.atFile`, async (file, options) => {
        // TODO: implement internalDebugPreview and use settings to choose which one to launch
        await serverPreview.openPreviewAtFileUri(file, options, settingsUtil_1.PreviewType.externalDebugPreview);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.start.externalPreview.atFile`, async (file, options) => {
        /* __GDPR__
            "preview" :{
                "type" : {"classification": "SystemMetaData", "purpose": "FeatureInsight"},
                "location" : {"classification": "SystemMetaData", "purpose": "FeatureInsight"}
            }
        */
        reporter.sendTelemetryEvent('preview', {
            type: 'external',
            location: 'atFile',
            debug: 'false',
        });
        await serverPreview.openPreviewAtFileUri(file, options, settingsUtil_1.PreviewType.externalPreview);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.start.internalPreview.atFile`, async (file, options) => {
        /* __GDPR__
            "preview" :{
                "type" : {"classification": "SystemMetaData", "purpose": "FeatureInsight"},
                "location" : {"classification": "SystemMetaData", "purpose": "FeatureInsight"}
            }
        */
        reporter.sendTelemetryEvent('preview', {
            type: 'internal',
            location: 'atFile',
        });
        await serverPreview.openPreviewAtFileUri(file, options, settingsUtil_1.PreviewType.internalPreview);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.start.externalDebugPreview.atFile`, async (file, options) => {
        /* __GDPR__
            "preview" :{
                "type" : {"classification": "SystemMetaData", "purpose": "FeatureInsight"},
                "location" : {"classification": "SystemMetaData", "purpose": "FeatureInsight"}
            }
        */
        reporter.sendTelemetryEvent('preview', {
            type: 'external',
            location: 'atFile',
            debug: 'true',
        });
        await serverPreview.openPreviewAtFileUri(file, options, settingsUtil_1.PreviewType.externalDebugPreview);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.runServerLoggingTask`, async (file) => {
        await serverPreview.runTaskForFile(file);
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.end`, () => {
        /* __GDPR__
            "server.forceClose" : {}
        */
        reporter.sendTelemetryEvent('server.forceClose');
        serverPreview.forceCloseServers();
    }));
    context.subscriptions.push(vscode.commands.registerCommand(`${settingsUtil_1.SETTINGS_SECTION_ID}.setDefaultOpenFile`, async (file) => {
        // Will set the path on workspace folder settings if workspace is open
        // otherwise, it will set user setting.
        const workspace = vscode.workspace.getWorkspaceFolder(file);
        if (!workspace) {
            await settingsUtil_1.SettingUtil.UpdateSettings(settingsUtil_1.Settings.defaultPreviewPath, pathUtil_1.PathUtil.ConvertToPosixPath(file.fsPath), vscode.ConfigurationTarget.Global);
            return;
        }
        const relativeFileStr = file.fsPath.substring(workspace.uri.fsPath.length);
        await settingsUtil_1.SettingUtil.UpdateSettings(settingsUtil_1.Settings.defaultPreviewPath, pathUtil_1.PathUtil.ConvertToPosixPath(relativeFileStr), vscode.ConfigurationTarget.WorkspaceFolder, file);
    }));
}
exports.activate = activate;
function deactivate() {
    serverPreview.closePanel();
    serverPreview.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map