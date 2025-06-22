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
exports.SettingUtil = exports.PreviewType = exports.Settings = exports.SETTINGS_SECTION_ID = exports.CustomExternalBrowser = exports.OpenPreviewTarget = exports.AutoRefreshPreview = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("./constants");
/**
 * @description Options for the preview refresh settings dropdown.
 */
var AutoRefreshPreview;
(function (AutoRefreshPreview) {
    AutoRefreshPreview["onAnyChange"] = "On All Changes in Editor";
    AutoRefreshPreview["onSave"] = "On Changes to Saved Files";
    AutoRefreshPreview["never"] = "Never";
})(AutoRefreshPreview = exports.AutoRefreshPreview || (exports.AutoRefreshPreview = {}));
/**
 * @description Options for the preview target settings dropdown.
 */
var OpenPreviewTarget;
(function (OpenPreviewTarget) {
    OpenPreviewTarget["embeddedPreview"] = "Embedded Preview";
    OpenPreviewTarget["externalBrowser"] = "External Browser";
})(OpenPreviewTarget = exports.OpenPreviewTarget || (exports.OpenPreviewTarget = {}));
var CustomExternalBrowser;
(function (CustomExternalBrowser) {
    CustomExternalBrowser["edge"] = "Edge";
    CustomExternalBrowser["chrome"] = "Chrome";
    CustomExternalBrowser["firefox"] = "Firefox";
    CustomExternalBrowser["default"] = "Default";
})(CustomExternalBrowser = exports.CustomExternalBrowser || (exports.CustomExternalBrowser = {}));
/**
 * @description prefix for all extension contributions for Live Preview
 */
exports.SETTINGS_SECTION_ID = 'livePreview';
/**
 * @description contains the string constants for all settings (`SETTINGS_SECTION_ID`.`).
 */
exports.Settings = {
    portNumber: 'portNumber',
    showStatusBarItem: 'showStatusBarItem',
    showServerStatusNotifications: 'showServerStatusNotifications',
    autoRefreshPreview: 'autoRefreshPreview',
    openPreviewTarget: 'openPreviewTarget',
    serverKeepAliveAfterEmbeddedPreviewClose: 'serverKeepAliveAfterEmbeddedPreviewClose',
    notifyOnOpenLooseFile: 'notifyOnOpenLooseFile',
    runTaskWithExternalPreview: 'tasks.runTaskWithExternalPreview',
    defaultPreviewPath: 'defaultPreviewPath',
    debugOnExternalPreview: 'debugOnExternalPreview',
    hostIP: 'hostIP',
    customExternalBrowser: 'customExternalBrowser',
    serverRoot: 'serverRoot',
    previewDebounceDelay: 'previewDebounceDelay',
    httpHeaders: 'httpHeaders'
};
/**
 * @description the potential previewType for commands (formatted as `${SETTINGS_SECTION_ID}.start.${previewType}.${target}`).
 */
exports.PreviewType = {
    internalPreview: 'internalPreview',
    externalPreview: 'externalPreview',
    externalDebugPreview: 'externalDebugPreview',
};
class SettingUtil {
    /**
     * @description Get the current settings JSON.
     * @returns {ILivePreviewConfigItem} a JSON object with all of the settings for Live Preview.
     */
    static GetConfig(scope) {
        const config = vscode.workspace.getConfiguration(exports.SETTINGS_SECTION_ID, scope);
        return {
            portNumber: config.get(exports.Settings.portNumber, 3000),
            showServerStatusNotifications: config.get(exports.Settings.showServerStatusNotifications, false),
            autoRefreshPreview: config.get(exports.Settings.autoRefreshPreview, AutoRefreshPreview.onAnyChange),
            openPreviewTarget: config.get(exports.Settings.openPreviewTarget, OpenPreviewTarget.embeddedPreview),
            serverKeepAliveAfterEmbeddedPreviewClose: config.get(exports.Settings.serverKeepAliveAfterEmbeddedPreviewClose, 20),
            previewDebounceDelay: config.get(exports.Settings.previewDebounceDelay, 50),
            notifyOnOpenLooseFile: config.get(exports.Settings.notifyOnOpenLooseFile, true),
            runTaskWithExternalPreview: config.get(exports.Settings.runTaskWithExternalPreview, false),
            defaultPreviewPath: config.get(exports.Settings.defaultPreviewPath, ''),
            debugOnExternalPreview: config.get(exports.Settings.debugOnExternalPreview, false),
            hostIP: config.get(exports.Settings.hostIP, '127.0.0.1'),
            customExternalBrowser: config.get(exports.Settings.customExternalBrowser, CustomExternalBrowser.default),
            serverRoot: config.get(exports.Settings.serverRoot, ''),
            httpHeaders: config.get(exports.Settings.httpHeaders, constants_1.DEFAULT_HTTP_HEADERS),
        };
    }
    /**
     * @description Get the preferred preview target from settings.
     * @returns {string} the constant in the command string indicating internal or external preview.
     */
    static GetPreviewType() {
        if (SettingUtil.GetConfig().openPreviewTarget ==
            OpenPreviewTarget.embeddedPreview) {
            return exports.PreviewType.internalPreview;
        }
        else {
            return SettingUtil.GetExternalPreviewType();
        }
    }
    static GetExternalPreviewType() {
        if (SettingUtil.GetConfig().debugOnExternalPreview) {
            return exports.PreviewType.externalDebugPreview;
        }
        else {
            return exports.PreviewType.externalPreview;
        }
    }
    /**
     * @description Update a Live Preview setting
     * @param {string} settingSuffix the suffix, `livePreview.<suffix>` of the setting to set.
     * @param {T} value the value to set the setting to.
     * @param {vscode.ConfigurationTarget | boolean | null} scope settings scope
     * @param {vscode.Uri} uri uri to scope the settings to
     */
    static async UpdateSettings(settingSuffix, value, scope, uri) {
        await vscode.workspace
            .getConfiguration(exports.SETTINGS_SECTION_ID, uri)
            .update(settingSuffix, value, scope);
    }
}
exports.SettingUtil = SettingUtil;
//# sourceMappingURL=settingsUtil.js.map