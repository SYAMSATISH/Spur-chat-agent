"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const chat_1 = __importDefault(require("./routes/chat"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/chat', chat_1.default);
if (process.env.NODE_ENV === 'production') {
    const publicPath = path_1.default.join(__dirname, '../public');
    app.use(express_1.default.static(publicPath));
    app.get(/^(?!\/chat).*$/, (req, res) => {
        res.sendFile(path_1.default.join(publicPath, 'index.html'));
    });
}
else {
    app.get('/', (req, res) => {
        res.send('Spur Chat Agent API is running (Dev Mode)');
    });
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map