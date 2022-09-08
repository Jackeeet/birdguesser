import express from 'express';
import { yesHandler, noHandler } from './src/guesser.js';

const app = express();

app.listen(3000, () => {
    console.log("app started");
});

app.use(express.static("./"));

app.get("/", (req, res) => {
    res.sendFile("./index.html");
});

app.get("/yes", (req, res) => {
    let response = yesHandler();
    res.json(response);
});

app.get("/no", (req, res) => {
    let response = noHandler();
    res.json(response);
});
