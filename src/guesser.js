import {states} from './enums.js';
import fs from 'fs';

const jsonPath = './src/data.json';

let state;
let current;
let depth;
let log;
let stored;

const moveLeft = () => {
    depth += 1;
    current = 2 * current + 1;
};

const moveRight = () => {
    depth += 1;
    current = 2 * current + 2;
}

const getBird = () => {
    return stored[current].bird;
};

const getQuestion = () => {
    return stored[current].question;
}

const bird = () => {
    log.push({
        text: getBird(),
        answer: null
    });
    state = states.BIRD;
    return {state: state, text: getBird()}
}

const question = () => {
    log.push({
        text: getQuestion(),
        answer: null
    });
    state = states.QUESTION;
    return {state: state, text: getQuestion()};
}

const success = () => {
    state = states.GUESSED;
    return {state: state, text: getBird()}
}

const failure = () => {
    state = states.FAILED;
    return {state: state, text: null}
};

const initialize = () => {
    stored = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    depth = 0;
    current = 0;
    log = [];
};

export const yes = (initial) => {
    if (initial) {
        initialize();
        return bird();
    }

    log[log.length - 1].answer = true;
    switch (state) {
        case states.BIRD:
            return success();
        case states.QUESTION:
            moveLeft();
            return getBird() !== null ? bird() : failure();
    }
};

export const no = () => {
    log[log.length - 1].answer = false;
    switch (state) {
        case states.BIRD:
            return getQuestion() !== null ? question() : failure();
        case states.QUESTION:
            moveRight();
            return getBird() !== null ? bird() : failure();
    }
};

const storedBirdInfo = index => {
    let parent = null;
    if (index > 0) {
        const parentIndex = index % 2 === 0 ? Math.floor((index - 1) / 2) : Math.floor(index / 2);
        parent = stored[parentIndex].bird;
    }

    return {
        bird: stored[index].bird,
        parent: parent,
        question: stored[index].question,
        children: [
            stored[2 * index + 1].bird,
            stored[2 * index + 2].bird
        ]
    }
}

export const showBird = name => {
    name = name.trim();
    for (let i = 0; i < stored.length; i++) {
        if (stored[i].bird === name) {
            return storedBirdInfo(i);
        }
    }

    return {bird: null}
};

export const showStored = () => stored;

export const showLog = () => log;

const addNextLevel = () => {
    for (let i = 0; i < Math.pow(2, depth + 1); i++)
        stored.push({bird: null, question: null});
}

export const addBird = name => {
    if (stored[current].bird === null) {
        stored[current] = {bird: name, question: null};
        fs.writeFileSync(jsonPath, JSON.stringify(stored));
        return {ask: false};
    } else {
        let newLeafNeeded = current * 2 + 2 >= stored.length;
        if (newLeafNeeded) {
            addNextLevel();
        }

        stored[2 * current + 1] = {bird: name, question: null};
        fs.writeFileSync(jsonPath, JSON.stringify(stored));
        return {ask: true};
    }
};

export const addQuestion = text => {
    stored[current].question = text;
    moveLeft();
    fs.writeFileSync(jsonPath, JSON.stringify(stored));
};