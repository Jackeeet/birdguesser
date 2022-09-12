const showGuess = (guess) => {
    textArea.innerText = `Это ${guess}!`;
    explainButton.hidden = false;
};

const showQuestion = (question) => {
    textArea.innerText = `${question}?`;
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
    if (json.state === "bird") {
        showGuess(json.text, textArea);
    } else if (json.state === "question") {
        showQuestion(json.text, textArea);
    } else if (json.state === "guessed") {
        textArea.innerText = `:> ${json.text} <:`;
        showControls();
    } else if (json.state === "failed") {
        textArea.innerText = "Сдаюсь.";
        explainButton.hidden = true;
        hideExplainArea();
        showControls();
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

const restartClickHandler = async () => {
    let response = await fetch("/reset");
    if (response.ok) {
        window.location.reload();
    } else {
        console.log("restartClickHandler failed");
    }
}

const buildLogString = json => {
    if (json.length === 1) {
        return `${json[0].text} - корень базы знаний.`;
    }

    let log = "";
    for (let i = 0; i < json.length - 1; i++) {
        log += `${json[i].text}? ${json[i].answer ? 'Да' : 'Нет'}\n`;
    }

    log += `Следовательно, это ${json[json.length - 1].text}.`;
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

const showAllClickHandler = async () => {
    if (showAllButton.textContent.trim() === "Все птицы") {
        let response = await fetch("/show/all");
        if (response.ok) {
            let json = await response.json();
            showAllButton.textContent = "Скрыть птиц";
            dataView.innerText = json;
        } else {
            console.log("showAllClickHandler failed");
        }
    } else {
        showAllButton.textContent = "Все птицы";
        dataView.innerText = "";
    }
};

const searchClickHandler = async () => {
    const searchTerm = searchInput.value.trim();
    let response = await fetch(`/show?bird=${searchTerm}`);
    if (response.ok) {
        let json = await response.json();
        if (json.bird === null) {
            dataView.innerText = "Нет данных";
        } else {
            dataView.innerText = json.bird;
        }
    } else {
        console.log("searchClickHandler failed");
    }
};

const textArea = document.getElementById('prompt');
const explainArea = document.getElementById("explain_area");
const dataArea = document.getElementById("data_area");
const dataView = document.getElementById("data_view");

const searchInput = document.getElementById('bird_search_input');

const yesButton = document.getElementById('yes_btn');
const noButton = document.getElementById('no_btn');
const explainButton = document.getElementById('explain_btn');
const dataButton = document.getElementById('data_btn');
const restartButton = document.getElementById("restart_btn");
const showAllButton = document.getElementById('show_all_btn');
const searchButton = document.getElementById('bird_search_btn');
