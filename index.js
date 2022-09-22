import express from 'express';
import {yes, no, showLog, showStored, showBird, addBird, addQuestion} from './src/guesser.js';

const app = express();

app.listen(3000, () => {
    console.log("birdguesser is running at localhost:3000");
});

app.use(express.static("./"));

app.get("/", (req, res) => {
    return res.sendFile("./index.html")
});

app.get("/yes", (req, res) => {
    let initial = req.query.init === "1";
    res.json(yes(initial));
});

app.get("/no", (req, res) =>
    res.json(no())
);

app.get("/log", (req, res) =>
    res.json(showLog())
);

app.get("/show/all", (req, res) => {
    res.json(showStored());
});

app.get("/show", (req, res) => {
    res.json(showBird(req.query.bird));
});

app.get("/add/bird", (req, res) => {
    res.json(addBird(req.query.name));
});

app.get("/add/question", (req, res) => {
    addQuestion(req.query.text);
    res.sendStatus(200);
});