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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxy = proxy;
exports.wsProxy = wsProxy;
const path = __importStar(require("path"));
const http_1 = require("../../common/http");
const http_2 = require("../http");
const proxy_1 = require("../proxy");
const getProxyTarget = (req, opts) => {
    // If there is a base path, strip it out.
    const base = req.base || "";
    const port = parseInt(req.params.port, 10);
    if (isNaN(port)) {
        throw new http_1.HttpError("Invalid port", http_1.HttpCode.BadRequest);
    }
    return `http://0.0.0.0:${port}${(opts === null || opts === void 0 ? void 0 : opts.proxyBasePath) || ""}/${req.originalUrl.slice(base.length)}`;
};
function proxy(req, res, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, http_2.ensureProxyEnabled)(req);
        if (req.method === "OPTIONS" && req.args["skip-auth-preflight"]) {
            // Allow preflight requests with `skip-auth-preflight` flag
        }
        else if (!(yield (0, http_2.authenticated)(req))) {
            // If visiting the root (/:port only) redirect to the login page.
            if (!req.params.path || req.params.path === "/") {
                const to = (0, http_2.self)(req);
                return (0, http_2.redirect)(req, res, "login", {
                    to: to !== "/" ? to : undefined,
                });
            }
            throw new http_1.HttpError("Unauthorized", http_1.HttpCode.Unauthorized);
        }
        // The base is used for rewriting (redirects, target).
        if (!(opts === null || opts === void 0 ? void 0 : opts.passthroughPath)) {
            ;
            req.base = req.path.split(path.sep).slice(0, 3).join(path.sep);
        }
        proxy_1.proxy.web(req, res, {
            ignorePath: true,
            target: getProxyTarget(req, opts),
        });
    });
}
function wsProxy(req, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, http_2.ensureProxyEnabled)(req);
        (0, http_2.ensureOrigin)(req);
        yield (0, http_2.ensureAuthenticated)(req);
        // The base is used for rewriting (redirects, target).
        if (!(opts === null || opts === void 0 ? void 0 : opts.passthroughPath)) {
            ;
            req.base = req.path.split(path.sep).slice(0, 3).join(path.sep);
        }
        proxy_1.proxy.ws(req, req.ws, req.head, {
            ignorePath: true,
            target: getProxyTarget(req, opts),
        });
    });
}
//# sourceMappingURL=pathProxy.js.map