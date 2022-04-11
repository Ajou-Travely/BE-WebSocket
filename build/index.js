"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
class App {
    constructor() {
        this.application = (0, express_1.default)();
    }
}
const app = new App().application;
app.get("/", (req, res) => {
    res.send("start!!!");
});
app.listen(4000, () => console.log("start"));
//# sourceMappingURL=index.js.map