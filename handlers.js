const showGuess = (guess) => {
    prompt.innerText = `Это ${guess}!`;
    explainButton.hidden = false;
};

const showQuestion = (question) => {
    prompt.innerText = `${question}?`;
    explainButton.hidden = true;
};

const showControls = () => {
    noButton.hidden = true;
    yesButton.hidden = true;
    restartButton.hidden = false;
    dataButton.hidden = false;
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

const handleYesNoResponse = async response => {
    let json = await response.json();
    if (json.state === "guessed") {
        showGuess(json.text, prompt);
    } else if (json.state === "guessed_right") {
        prompt.innerText = `:> ${json.text} <:`;
        showControls();
    } else if (json.state === "failed") {
        prompt.innerText = "Сдаюсь.";
        explainButton.hidden = true;
        hideExplainArea();
        showControls();
    } else if (json.state === "question") {
        showQuestion(json.text, prompt);
    }
}

const yesClickHandler = async () => {
    let response = await fetch("/yes");
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

function buildLogString(json) {
    if (json.length === 1) {
        return `${json[0].value.name} - наиболее вероятный ответ (вероятность ${json[0].probability}%).`;
    }

    let log = "";
    for (let i = 0; i < json.length - 1; i++) {
        const item = json[i];
        const text = item.kind === 0 ? item.value.name : item.value.text;
        log += `[${item.id + 1}] ${text}? ${item.isTrue ? "Да" : "Нет"}\n`;
    }
    log += `Следовательно, это ${json[json.length - 1].value.name}.`;
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

const prompt = document.getElementById('prompt');
const explainArea = document.getElementById("explain_area");
const dataArea = document.getElementById("data_area");

const yesButton = document.getElementById('yes_btn');
const noButton = document.getElementById('no_btn');
const explainButton = document.getElementById('explain_btn');
const dataButton = document.getElementById('data_btn');
const restartButton = document.getElementById("restart_btn");

restartButton.addEventListener("click", () =>
    window.location.href = window.location.href
);