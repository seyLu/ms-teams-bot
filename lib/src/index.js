"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app/app"));
// Start the application
(async () => {
    await app_1.default.start(process.env.PORT || process.env.port || 3978);
    console.log(`\nAgent started, app listening to`, process.env.PORT || process.env.port || 3978);
})();
//# sourceMappingURL=index.js.map