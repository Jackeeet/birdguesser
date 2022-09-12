import express from 'express';
import {yes, no, showLog, showStored, showBird} from './src/guesser.js';

const app = express();
let initial = true;

app.listen(3000, () => {
    console.log("app started");
});

app.use(express.static("./"));

app.get("/", (req, res) => {
    initial = true;
    return res.sendFile("./index.html")
});

app.get("/reset", (req, res) => {
    initial = true;
    return res.sendStatus(200);
});

app.get("/yes", (req, res) => {
    let response = yes(initial);
    initial = false;
    res.json(response);
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