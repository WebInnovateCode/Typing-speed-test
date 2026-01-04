import typingSpeedTest from "./test.js";
import { element } from "./element.js";
import { initializeValues } from "./initializestatvalues.js";

const currentTest = typingSpeedTest("easy", "60");
const {
    initializePassageInput,
    passageText,
    dialogElement: {
        dialogElement,
        dialogImage,
        dialogTitle,
        dialogSubtitle,
        dialogButton,
    },
    time: { timeElement },
    resultOfTest: { resultWPM, resultAccuracy, resultDifficulty, resultMode },
    pbWPM,
    accuracyElement,
    textareaElement,
} = initializeValues(
    currentTest,
    "#passage",
    ".test__passage",
    {
        dialogSelector: "dialog",
        dialogImageSelector: "[data-image]",
        dialogTitleSelector: ".dialog__title",
        dialogSubtitleSelector: ".dialog__subtitle",
        dialogButtonSelector: "dialog [data-type]",
    },
    "time",
    "[data-type='restart']",
    {
        wpm: "[data-result-wpm]",
        accuracy: "[data-result-accuracy]",
        difficulty: "[data-result-difficulty]",
        mode: "[data-result-mode]",
    },
    ".personal-best__wpm",
    "[data-accuracy]",
    "[data-wpm]",
    "[data-type='complete']",
    ".textarea",
    ".textarea__input",
);

let { passageInput, abortController, handlerTimer } = initializePassageInput();

function trackStats() {
    let count = 0;
    let totalCharactersTyped = 0;
    let numberOfIncorrect = 0;
    let timer = currentTest.startTimer(timeElement, "data-time");
    let passage;
    let cursor;
    let currentCharacterSpan;

    function moveCursor(currentPosition, nextPosition) {
        cursor = passageText.children[currentPosition];
        currentCharacterSpan = passageText.children[nextPosition];
        currentCharacterSpan.after(cursor);
    }

    function handleKeydownEvent(event) {
        if (timer.startTime() === 0) {
            passage = currentTest.getCurrentPassage();
            timer.start();
        }

        if (event.key === "Backspace") {
            if (count > 0) {
                passageText.children[--count].className = "";
                moveCursor(count, count + 1);
            }
        } else if (
            event.key !== "CapsLock" &&
            event.key !== "Shift" &&
            event.key !== "Escape"
        ) {
            moveCursor(count, count + 1);

            if (
                event.key === passage[count] ||
                (event.key === "-" && passage[count] === "\u2014")
            ) {
                currentCharacterSpan.classList.add("correct");
            } else {
                currentCharacterSpan.classList.add("incorrect");
                numberOfIncorrect += 1;
            }

            totalCharactersTyped += 1;
            count += 1;

            if (count >= passage.length) {
                showResults();
            }
        }
    }

    return {
        handleKeydownEvent,
        timer,
        totalCharactersTyped: () => totalCharactersTyped,
        numberOfIncorrect: () => numberOfIncorrect,
    };
}

function handleDifficulty(event) {
    changeActiveButton(
        ".button--active[data-difficulty]",
        "button--active",
        event.target,
    );
    currentTest.setSinglePassage(
        currentTest.setDifficulty(
            event.target.attributes["data-difficulty"].value,
        ),
    );
    reset();
}

function handleMode(event) {
    changeActiveButton(
        ".button--active[data-mode]",
        "button--active",
        event.target,
    );
    currentTest.setMode(event.target.dataset.mode, timeElement);
    reset();
}

function changeActiveButton(
    activeButtonSelector,
    activeButtonClass,
    addToElement,
) {
    const { element: activeButton } = element(activeButtonSelector);
    activeButton.classList.remove(activeButtonClass);
    addToElement.classList.add(activeButtonClass);
}

function reset() {
    if (handlerTimer.startTime() !== 0) handlerTimer.stop();
    changeActiveButton(
        ".button--active[data-difficulty]",
        "button--active",
        document.querySelector(
            `[data-difficulty="${currentTest.getDifficulty()}"]`,
        ),
    );
    textareaElement.classList.add("textarea--hidden");
    timeElement.classList.remove("list__item-value--yellow");
    accuracyElement.classList.remove("list__item-value--red");
    timeElement.textContent = currentTest.getMode() + "s";
    currentTest.setSinglePassage(currentTest.getDifficulty());
    currentTest.insertPassageWithCharacterSpan(passageText);
    currentTest.setAccuracy(100, 0, accuracyElement);
    abortController();
    ({ passageInput, abortController, handlerTimer } =
        initializePassageInput());
    resizeInputHeight();
}

function showResults() {
    if (currentTest.getWPM() > currentTest.getPB()) {
        if (currentTest.getPlays() !== 0) {
            dialogViewChange(
                "dialog--default",
                "dialog--best",
                "High Score Smashed!",
                "You're getting faster. That was incredible typing.",
                "./assets/images/icon-new-pb.svg",
                { imgEffect: false, imgClass: "dialog__image--green-effect" },
                "Beat this score!",
            );
        }
        pbWPM.textContent = currentTest.setPB(currentTest.getWPM());
        localStorage.setItem("personalBest", currentTest.getPB());
    } else if (currentTest.getPlays() >= 1) {
        dialogViewChange(
            "dialog--best",
            "dialog--default",
            "Test Complete!",
            "Solid run. Keep pushing to beat your high score!",
            "./assets/images/icon-completed.svg",
            { imgEffect: true, imgClass: "dialog__image--green-effect" },
            "Go again!",
        );
    }
    currentTest.incrementPlays();
    localStorage.setItem("plays", currentTest.getPlays());
    resultWPM.textContent = currentTest.getWPM();
    resultAccuracy.textContent = currentTest.getAccuracy() + "%";
    resultDifficulty.textContent = currentTest.getDifficulty();
    resultMode.textContent =
        currentTest.getMode() === "0"
            ? handlerTimer.getElapsedTime() + "s"
            : currentTest.getMode() + "s";
    dialogElement.showModal();
    reset();
}

function dialogViewChange(
    dialogRemoveClass,
    dialogAddClass,
    title,
    subtitle,
    imgSource,
    { imgEffect, imgClass },
    buttonText,
) {
    dialogElement.classList.remove(dialogRemoveClass);
    dialogElement.classList.add(dialogAddClass);
    dialogImage.src = imgSource;
    if (imgEffect) dialogImage.classList.add(imgClass);
    else dialogImage.classList.remove(imgClass);
    dialogTitle.textContent = title;
    dialogSubtitle.textContent = subtitle;
    dialogButton.textContent = buttonText;
}

function resizeInputHeight() {
    passageInput.style.height = "auto";
    passageInput.style.height = passageText.scrollHeight + "px";
}

export {
    currentTest,
    passageText,
    trackStats,
    handleDifficulty,
    handleMode,
    reset,
    showResults,
    resizeInputHeight,
    changeActiveButton,
    handlerTimer,
};
