import {states} from './enums.js';
import fs from 'fs';

let state;

let totalRounds;
let remainingBirdIds;
let remainingQuestionIds;
let log;

let lastGuess = null; // todo replace with last log entry
let lastQuestion = null; // todo replace with last log entry

let stored = null;

const prepare = () => {
    stored = JSON.parse(fs.readFileSync('./src/data.json'));
    totalRounds = 0;
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
        totalRounds += bird.count;
    }

    stored.questions.forEach((q) => {
        remainingQuestionIds.push(q.id);
    });
};

const guessMostLikely = () => {
    const likelyBirdId = remainingBirdIds[0];
    remainingBirdIds = remainingBirdIds.filter(id => id !== likelyBirdId);
    lastGuess = stored.birds[likelyBirdId];
    state = states.GUESSED;
    return {state: state, text: lastGuess.name};
};

const askQuestion = () => {
    const questionId = remainingQuestionIds[0];
    remainingQuestionIds = remainingQuestionIds.filter(id => id !== questionId);
    lastQuestion = stored.questions[questionId];
    state = states.QUESTION;
    return {state: state, text: lastQuestion.text};
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
    }

    switch (state) {
        case states.INITIAL:
            prepare();
            return guessMostLikely();

        case states.QUESTION:
            remainingBirdIds = remainingBirdIds.filter(id => lastQuestion.birds.includes(id));
            return chooseNextAction();

        case states.GUESSED:
            state = states.GUESSED_RIGHT;
            return {state: state, text: lastGuess.name};
    }
};

export const no = () => {
    if (state === states.GUESSED) {
        // remove all questions that have the rejected bird as the only answer
        remainingQuestionIds = remainingQuestionIds.filter(id =>
            stored.questions[id].birds.length !== 1 ||
            stored.questions[id].birds[0] !== lastGuess.id
        );
    } else if (state === states.QUESTION) {
        remainingBirdIds = remainingBirdIds.filter(id => !lastQuestion.birds.includes(id));
    }

    return chooseNextAction();
};

