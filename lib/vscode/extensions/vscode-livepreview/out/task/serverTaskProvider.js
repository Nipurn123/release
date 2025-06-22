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
exports.ServerTaskProvider = exports.ServerStartedStatus = void 0;
const vscode = __importStar(require("vscode"));
const dispose_1 = require("../utils/dispose");
const serverTaskLinkProvider_1 = require("./serverTaskLinkProvider");
const serverTaskTerminal_1 = require("./serverTaskTerminal");
const constants_1 = require("../utils/constants");
const settingsUtil_1 = require("../utils/settingsUtil");
/**
 * @description The respose to a task's request to start the server. Either the server starts or it was already started manually.
 */
var ServerStartedStatus;
(function (ServerStartedStatus) {
    ServerStartedStatus[ServerStartedStatus["JUST_STARTED"] = 0] = "JUST_STARTED";
    ServerStartedStatus[ServerStartedStatus["STARTED_BY_EMBEDDED_PREV"] = 1] = "STARTED_BY_EMBEDDED_PREV";
})(ServerStartedStatus = exports.ServerStartedStatus || (exports.ServerStartedStatus = {}));
/**
 * @description task provider for `Live Preview - Run Server` task.
 */
class ServerTaskProvider extends dispose_1.Disposable {
    constructor(_reporter, endpointManager, connectionManager) {
        super();
        this._reporter = _reporter;
        // emitters to allow manager to communicate with the terminal.
        this._onRequestToOpenServerEmitter = this._register(new vscode.EventEmitter());
        this.onRequestToOpenServer = this._onRequestToOpenServerEmitter.event;
        this._onRequestOpenEditorToSide = this._register(new vscode.EventEmitter());
        this.onRequestOpenEditorToSide = this._onRequestOpenEditorToSide.event;
        this._onRequestToCloseServerEmitter = this._register(new vscode.EventEmitter());
        this.onRequestToCloseServer = this._onRequestToCloseServerEmitter.event;
        this._onShouldLaunchPreview = this._register(new vscode.EventEmitter());
        this.onShouldLaunchPreview = this._onShouldLaunchPreview.event;
        this._terminals = new Map();
        this._terminalLinkProvider = this._register(new serverTaskLinkProvider_1.serverTaskLinkProvider(_reporter, endpointManager, connectionManager));
        this._register(this._terminalLinkProvider.onShouldLaunchPreview((e) => this._onShouldLaunchPreview.fire(e)));
        this._terminalLinkProvider.onRequestOpenEditorToSide((e) => {
            this._onRequestOpenEditorToSide.fire(e);
        });
        this._runTaskWithExternalPreview =
            settingsUtil_1.SettingUtil.GetConfig().runTaskWithExternalPreview;
        this._register(vscode.workspace.onDidChangeConfiguration((e) => {
            this._runTaskWithExternalPreview =
                settingsUtil_1.SettingUtil.GetConfig().runTaskWithExternalPreview;
        }));
    }
    get isRunning() {
        return (Array.from(this._terminals.values()).find((term) => term.running) !==
            undefined);
    }
    /**
     * given a workspace, check if there is a task for that workspace that is running
     * @param workspace
     */
    isTaskRunning(workspace) {
        var _a;
        const term = this._terminals.get(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString());
        return (_a = term === null || term === void 0 ? void 0 : term.running) !== null && _a !== void 0 ? _a : false;
    }
    /**
     * @param {IServerMsg} msg the log information to send to the terminal for server logging.
     */
    sendServerInfoToTerminal(msg, workspace) {
        const term = this._terminals.get(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString());
        if (term && term.running) {
            term.showServerMsg(msg);
        }
    }
    /**
     * @param {vscode.Uri} externalUri the address where the server was started.
     * @param {ServerStartedStatus} status information about whether or not the task started the server.
     * @param {vscode.WorkspaceFolder | undefined} workspace the workspace associated with this action.
     */
    serverStarted(externalUri, status, workspace) {
        const term = this._terminals.get(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString());
        if (term && term.running) {
            term.serverStarted(externalUri, status);
        }
    }
    /**
     * Used to notify the terminal the result of their `stop server` request.
     * @param {boolean} now whether or not the server stopped just now or whether it will continue to run
     * @param {vscode.WorkspaceFolder | undefined} workspace the workspace associated with this action.
     */
    serverStop(now, workspace) {
        const term = this._terminals.get(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString());
        if (term && term.running) {
            if (now) {
                term.serverStopped();
            }
            else {
                term.serverWillBeStopped();
            }
        }
    }
    /**
     * Run task manually from extension
     * @param {vscode.WorkspaceFolder | undefined} workspace the workspace associated with this action.
     */
    async extRunTask(workspace) {
        /* __GDPR__
            "tasks.terminal.startFromExtension" : {}
        */
        this._reporter.sendTelemetryEvent('tasks.terminal.startFromExtension');
        const tasks = await vscode.tasks.fetchTasks({
            type: ServerTaskProvider.CustomBuildScriptType,
        });
        const selTasks = tasks.filter((x) => workspace === x.scope);
        if (selTasks.length > 0) {
            vscode.tasks.executeTask(selTasks[0]);
        }
    }
    provideTasks() {
        return this._getTasks();
    }
    /**
     * The function called to create a task from a task definition in tasks.json
     * @param _task the task from tasks.json
     * @returns
     */
    resolveTask(_task) {
        const definition = _task.definition;
        let workspace;
        try {
            workspace = _task.scope;
        }
        catch (e) {
            // no op
        }
        return this._getTask(definition, workspace);
    }
    get runTaskWithExternalPreview() {
        return this._runTaskWithExternalPreview;
    }
    /**
     * @returns the array of all possible tasks
     */
    _getTasks() {
        if (this._tasks !== undefined) {
            return this._tasks;
        }
        this._tasks = [];
        if (vscode.workspace.workspaceFolders) {
            vscode.workspace.workspaceFolders.forEach((workspace) => {
                this._tasks.push(this._getTask({
                    type: ServerTaskProvider.CustomBuildScriptType,
                }, workspace));
            });
        }
        else {
            this._tasks.push(this._getTask({
                type: ServerTaskProvider.CustomBuildScriptType,
            }, undefined));
        }
        return this._tasks;
    }
    /**
     * make a task for this configuration
     * @param definition
     * @param workspace
     * @returns the task with the proper details and callback
     */
    _getTask(definition, workspace) {
        definition.workspacePath = workspace === null || workspace === void 0 ? void 0 : workspace.uri.fsPath;
        const taskName = constants_1.TASK_TERMINAL_BASE_NAME;
        const term = this._terminals.get(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString());
        if (term && term.running) {
            return new vscode.Task(definition, workspace !== null && workspace !== void 0 ? workspace : vscode.TaskScope.Global, taskName, ServerTaskProvider.CustomBuildScriptType, undefined);
        }
        const custExec = new vscode.CustomExecution(async () => {
            // When the task is executed, this callback will run. Here, we set up for running the task.
            const term = this._terminals.get(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString());
            if (term && term.running) {
                return term;
            }
            const newTerm = new serverTaskTerminal_1.ServerTaskTerminal(this._reporter, workspace);
            newTerm.onRequestToOpenServer((e) => {
                this._onRequestToOpenServerEmitter.fire(e);
            });
            newTerm.onRequestToCloseServer((e) => {
                this._onRequestToCloseServerEmitter.fire(e);
                this._terminals.delete(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString());
            });
            this._terminals.set(workspace === null || workspace === void 0 ? void 0 : workspace.uri.toString(), newTerm);
            return newTerm;
        });
        const task = new vscode.Task(definition, workspace !== null && workspace !== void 0 ? workspace : vscode.TaskScope.Global, taskName, ServerTaskProvider.CustomBuildScriptType, custExec);
        task.isBackground = true;
        // currently, re-using a terminal will cause the link provider to fail
        // so we can create a new task terminal each time.
        task.presentationOptions.panel = vscode.TaskPanelKind.New;
        return task;
    }
}
exports.ServerTaskProvider = ServerTaskProvider;
ServerTaskProvider.CustomBuildScriptType = 'Live Preview';
//# sourceMappingURL=serverTaskProvider.js.map