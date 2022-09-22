const showGuess = (guess) => {
    textArea.innerText = `Это ${guess}!`;
    explainButton.hidden = false;
};

const showQuestion = (question) => {
    textArea.innerText = `${question}?`;
    explainButton.hidden = true;
};

const showSuccess = (text, textArea) => {
    textArea.innerText = `:> ${text} <:`;
    hideInputs();
    showControls();
};

const showControls = () => {
    noButton.hidden = true;
    yesButton.hidden = true;
    restartButton.hidden = false;
    dataButton.hidden = false;
};

const hideControls = () => {
    restartButton.hidden = true;
    dataButton.hidden = true;
    newBirdButton.hidden = true;
};

const showDataArea = () => {
    hideExplainArea();
    dataButton.textContent = "Скрыть базу знаний";
    dataArea.hidden = false;
};

const showExplainArea = () => {
    hideDataArea();
    explainButton.textContent = "Скрыть разбор ответа";
    explainArea.hidden = false;
};

const hideExplainArea = () => {
    explainButton.textContent = "Почему такой ответ?";
    explainArea.innerText = "";
    explainArea.hidden = true;
};

const hideDataArea = () => {
    dataButton.textContent = "Показать базу знаний";
    dataArea.hidden = true;
};

const showInputs = () => {
    newBirdInput.hidden = false;
    saveInputButton.hidden = false;
};

const hideInputs = () => {
    newBirdInput.value = "";
    newBirdInput.hidden = true;
    saveInputButton.hidden = true;
};

const handleYesNoResponse = async response => {
    let json = await response.json();
    if (json.state === "bird") {
        lastBird = json.text;
        showGuess(json.text, textArea);
    } else if (json.state === "question") {
        showQuestion(json.text, textArea);
    } else if (json.state === "guessed") {
        showSuccess(json.text, textArea);
    } else if (json.state === "failed") {
        textArea.innerText = "Сдаюсь.";
        explainButton.hidden = true;
        newBirdButton.hidden = false;
        hideExplainArea();
        showControls();
    }
}

const yesClickHandler = async () => {
    let response;
    if (initial) {
        response = await fetch("/yes?init=1");
        initial = false;
    } else {
        response = await fetch("/yes?init=0");
    }

    if (response.ok) {
        document.getElementById('no_btn').disabled = false;
        await handleYesNoResponse(response);
    } else {
        console.log("yesClickHandler failed");
    }
};

const noClickHandler = async () => {
    let response = await fetch("/no");
    if (response.ok) {
        hideExplainArea();
        await handleYesNoResponse(response);
    } else {
        console.log("noCLickHandler failed");
    }
};

const restartClickHandler = async () => {
    window.location.reload();
}

const buildLogString = json => {
    if (json.length === 1) {
        return `${json[0].text} - корень базы знаний.`;
    }

    let log = "";
    for (let i = 0; i < json.length - 1; i++) {
        log += `${json[i].text}? ${json[i].answer ? 'Да' : 'Нет'}\n`;
    }

    log += `следовательно, это ${json[json.length - 1].text}.`;
    return log;
}

const explainClickHandler = async () => {
    if (explainButton.textContent.trim() === "Почему такой ответ?") {
        let response = await fetch("/log");
        if (response.ok) {
            let json = await response.json();
            explainArea.innerText = buildLogString(json);
            showExplainArea();
        } else {
            console.log("explainClickHandler failed");
        }

    } else {
        hideExplainArea();
    }
};

const dataClickHandler = () => {
    if (dataButton.textContent.trim() === "Показать базу знаний") {
        showDataArea();
    } else {
        hideDataArea();
    }
};

const showAll = json => {
    let info = "";
    for (let i = 0; i < json.length; i++) {
        const item = json[i];
        if (item.bird === null)
            continue;
        info += `птица ${i}: ${item.bird}\n` +
            `вопрос ${i}: ${item.question ? item.question + "?" : "нет вопроса"}\n\n`
    }
    let div = document.createElement("div");
    div.style["text-align"] = "start";
    div.innerText = info;
    dataView.appendChild(div);
};

const showAllClickHandler = async () => {
    searchInput.value = null;
    dataView.innerText = "";
    if (showAllButton.textContent.trim() === "Все птицы") {
        let response = await fetch("/show/all");
        if (response.ok) {
            let json = await response.json();
            showAllButton.textContent = "Скрыть птиц";
            showAll(json);
        } else {
            console.log("showAllClickHandler failed");
        }
    } else {
        showAllButton.textContent = "Все птицы";
    }
};

const showBird = json => {
    dataView.innerText = `Птица: ${json.bird}\n` +
        `Предыдущая птица: ${json.parent ? json.parent : "нет элемента"}\n` +
        `Предыдущий вопрос: ${json.parentQuestion ? json.parentQuestion + "?" : "нет вопроса"}\n` +
        `Предыдущий ответ: ${json.parentAnswer === null ? "нет ответа" : json.parentAnswer ? "Да" : "Нет"}\n` +
        `Следующий вопрос: ${json.question ? json.question + "?" : "нет вопроса"}\n` +
        `Варианты ответов:\n` +
        `   "Да" -> ${json.children[0] ? json.children[0] : "нет ответа"} \n` +
        `   "Нет" -> ${json.children[1] ? json.children[1] : "нет ответа"}`;
};

const searchClickHandler = async () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm === "")
        return;

    showAllButton.textContent = "Все птицы";
    dataView.innerText = "";
    let response = await fetch(`/show?bird=${searchTerm}`);
    if (response.ok) {
        let json = await response.json();
        if (json.bird === null) {
            dataView.innerText = "нет данных";
        } else {
            showBird(json);
        }
    } else {
        console.log("searchClickHandler failed");
    }
};

const newBirdClickHandler = () => {
    hideDataArea();
    hideControls();
    showInputs();
    textArea.innerText = "Какую птицу вы загадали?";
    inputState = "bird";
};

const saveBird = async enteredValue => {
    let response = await fetch(`/add/bird?name=${enteredValue}`);
    if (response.ok) {
        let json = await response.json();
        if (json.ask) {
            inputState = "question";
            textArea.innerText = `Какое свойство отличает "${enteredValue}" от "${lastBird}"?`;
            newBirdInput.value = "";
            lastBird = enteredValue;
        } else {
            inputState = null;
            showSuccess(enteredValue, textArea);
        }
    } else {
        console.log("couldn't add bird");
    }
};

const saveQuestion = async enteredValue => {
    let response = await fetch(`/add/question?text=${enteredValue}`);
    if (response.ok) {
        inputState = null;
        showSuccess(lastBird, textArea);
    } else {
        console.log("couldn't add question");
    }
};

const cleanInput = input => {
    let enteredValue = input.trim().toLowerCase();
    if (enteredValue !== "") {
        let lastChar = enteredValue.length - 1;
        if (enteredValue[lastChar] === "?") {
            enteredValue = enteredValue.slice(0, lastChar);
        }
    }

    return enteredValue;
}

const saveInputClickHandler = async () => {
    let enteredValue = cleanInput(newBirdInput.value);
    if (enteredValue === "")
        return;

    if (inputState === "bird") {
        await saveBird(enteredValue);
    } else {
        await saveQuestion(enteredValue);
    }
};

const textArea = document.getElementById('prompt');
const explainArea = document.getElementById("explain_area");
const dataArea = document.getElementById("data_area");
const dataView = document.getElementById("data_view");

const searchInput = document.getElementById('bird_search_input');
const newBirdInput = document.getElementById('new_bird_input');

const yesButton = document.getElementById('yes_btn');
const noButton = document.getElementById('no_btn');
const explainButton = document.getElementById('explain_btn');
const dataButton = document.getElementById('data_btn');
const restartButton = document.getElementById("restart_btn");
const showAllButton = document.getElementById('show_all_btn');
const newBirdButton = document.getElementById('new_bird_button');
const saveInputButton = document.getElementById('save_input');

let initial = true;
let lastBird = "";
let inputState = null;