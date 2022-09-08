import express from 'express';
import {yes, no, showLog} from './src/guesser.js';

const app = express();

app.listen(3000, () => {
    console.log("app started");
});

app.use(express.static("./"));

app.get("/", (req, res) =>
    res.sendFile("./index.html")
);

app.get("/yes", (req, res) =>
    res.json(yes())
);

app.get("/no", (req, res) =>
    res.json(no())
);

app.get("/log", (req, res) =>
    res.json(showLog())
);
