import express from 'express';
import {yes, no, showLog, showStored, showBird} from './src/guesser.js';

const app = express();

app.listen(3000, () => {
    console.log("app started");
});

app.use(express.static("./"));

app.get("/", (req, res) => {
    return res.sendFile("./index.html")
});

app.get("/yes", (req, res) => {
    let initial = req.query.init === "1";
    let response = yes(initial);
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