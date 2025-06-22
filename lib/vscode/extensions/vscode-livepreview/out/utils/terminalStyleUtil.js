"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalStyleUtil = exports.TerminalDeco = exports.TerminalColor = void 0;
/**
 * @description the color to make the terminal text.
 */
var TerminalColor;
(function (TerminalColor) {
    TerminalColor[TerminalColor["red"] = 31] = "red";
    TerminalColor[TerminalColor["green"] = 32] = "green";
    TerminalColor[TerminalColor["yellow"] = 33] = "yellow";
    TerminalColor[TerminalColor["blue"] = 34] = "blue";
    TerminalColor[TerminalColor["purple"] = 35] = "purple";
    TerminalColor[TerminalColor["cyan"] = 36] = "cyan";
})(TerminalColor = exports.TerminalColor || (exports.TerminalColor = {}));
/**
 * @description Styling applied to the terminal string - reset (nothing), bold, or underline.
 */
var TerminalDeco;
(function (TerminalDeco) {
    TerminalDeco[TerminalDeco["reset"] = 0] = "reset";
    TerminalDeco[TerminalDeco["bold"] = 1] = "bold";
    TerminalDeco[TerminalDeco["underline"] = 4] = "underline";
})(TerminalDeco = exports.TerminalDeco || (exports.TerminalDeco = {}));
/**
 * @description A collection of functions for styling terminal strings.
 */
class TerminalStyleUtil {
    /**
     * @description Create a string that will be colored and decorated when printed in the terminal/pty.
     * @param {string} input the input string to stylize.
     * @param {TerminalColor} color the TerminalColor to use.
     * @param {TerminalDeco} decoration optional; the TerminalDeco styling to use.
     * @returns {string} the styled string.
     */
    static ColorTerminalString(input, color, decoration = TerminalDeco.reset) {
        return `\x1b[${decoration};${color}m${input}\x1b[0m`;
    }
}
exports.TerminalStyleUtil = TerminalStyleUtil;
//# sourceMappingURL=terminalStyleUtil.js.map