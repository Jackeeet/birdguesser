import {states, entryKinds} from './enums.js';
import fs from 'fs';

let state;
let iteration;

let totalCount;
let remainingBirdIds;
let remainingQuestionIds;
let log;

let lastGuess = null; // todo replace with last log entry
let lastQuestion = null; // todo replace with last log entry

let stored = null;

const prepare = () => {
    stored = JSON.parse(fs.readFileSync('./src/data.json'));
    totalCount = 0;
    iteration = 0;
    remainingBirdIds = [];
    remainingQuestionIds = [];
    log = [];

    // sort birb entries by frequency
    let sortedBirds = [...stored.birds];
    sortedBirds.sort((a, b) => {
        return b.count - a.count
    });

    for (const bird of sortedBirds) {
        remainingBirdIds.push(bird.id);
        totalCount += bird.count;
    }

    stored.questions.forEach((q) => {
        remainingQuestionIds.push(q.id);
    });
};

const addLogEntry = (entryKind, value) => {
    let probability = entryKind === entryKinds.BIRD ? 100 * value.count / totalCount : null;
    if (probability) {
        probability = Math.round((probability + Number.EPSILON) * 100) / 100
    }

    log.push({
        id: iteration,
        kind: entryKind,
        value: value,
        probability: probability,
        isTrue: null
    });
    iteration += 1;
};

const guessMostLikely = () => {
    const likelyBirdId = remainingBirdIds[0];
    remainingBirdIds = remainingBirdIds.filter(id => id !== likelyBirdId);
    const bird = stored.birds[likelyBirdId];

    addLogEntry(entryKinds.BIRD, bird);
    totalCount -= bird.count;
    lastGuess = bird;

    state = states.GUESSED;
    return {state: state, text: bird.name};
};

const askQuestion = () => {
    const questionId = remainingQuestionIds[0];
    remainingQuestionIds = remainingQuestionIds.filter(id => id !== questionId);
    const question = stored.questions[questionId];

    addLogEntry(entryKinds.QUESTION, question);
    lastQuestion = question;

    state = states.QUESTION;
    return {state: state, text: question.text};
};

const chooseNextAction = () => {
    if (remainingBirdIds.length === 0) {
        state = states.FAILED;
        return {state: state, text: null};
    }

    if (remainingQuestionIds.length === 0)
        return guessMostLikely();

    return askQuestion();
};

export const yes = () => {
    let roundStart = !state || state === states.GUESSED_RIGHT || state === states.FAILED;
    if (roundStart) {
        state = states.INITIAL;
    } else {
        log[log.length - 1].isTrue = true;
    }

    switch (state) {
        case states.INITIAL:
            prepare();
            return guessMostLikely();

        case states.QUESTION:
            remainingBirdIds = remainingBirdIds.filter(id =>
                lastQuestion.birds.includes(id)
            );
            return chooseNextAction();

        case states.GUESSED:
            state = states.GUESSED_RIGHT;
            return {state: state, text: lastGuess.name};
    }
};

export const no = () => {
    log[log.length - 1].isTrue = false;
    if (state === states.GUESSED) {
        // remove all questions that have the rejected bird as the only answer
        remainingQuestionIds = remainingQuestionIds.filter(id =>
            stored.questions[id].birds.length !== 1 ||
            stored.questions[id].birds[0] !== lastGuess.id
        );
    } else if (state === states.QUESTION) {
        remainingBirdIds = remainingBirdIds.filter(id =>
            !lastQuestion.birds.includes(id)
        );
    }

    return chooseNextAction();
};

export const showLog = () => log;
