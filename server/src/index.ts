import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/chat', chatRoutes);

if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));
    app.get(/^(?!\/chat).*$/, (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Spur Chat Agent API is running (Dev Mode)');
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
