import { currentTest } from "./test.js";
import { element } from "./element.js";
import { targetElements } from "./initializestatvalues.js";
import { controls } from "./controls.js";

const {
    initPassageInput,
    passageText,
    resultOfTest: { resultWPM, resultAccuracy, resultDifficulty, resultMode },
    accuracyElement,
    pbWPM,
    dialogElement: {
        dialogElement,
        dialogImage,
        dialogTitle,
        dialogSubtitle,
        dialogButton,
    },
    time: { timeElement },
    textareaElement,
    textareaInputElement,
    statusElement,
    alertElement,
    listElement,
    optionsElement,
    toggleTheme,
    rootElement,
} = targetElements;
let { passageInput, abortController, handlerTimer, currentWordPosition } =
    initPassageInput();
const controlsReset = controls(currentTest);

function trackStats() {
    let count = 0;
    let totalCharactersTyped = 0;
    let numberOfIncorrect = 0;
    let timer = currentTest.startTimer(timeElement, "data-time");
    let passage;
    let cursor;
    let currentCharacterSpan;
    const computedStyles = globalThis.getComputedStyle(passageText);
    const passageWidth =
        passageText.getBoundingClientRect().width -
        Number.parseFloat(computedStyles.paddingRight) -
        Number.parseFloat(computedStyles.paddingLeft);
    let lineWidth = 5;
    let line = 0;
    let wordCount = 0;
    let letterCount = 0;
    let currentWord = -1;
    let lineCount = 0;
    let currentWordPosition = 0;
    let words;
    function moveCursor(currentPosition, nextPosition, isBackspace = false) {
        cursor = passageText.children[wordCount].children[currentPosition];
        currentCharacterSpan =
            passageText.children[wordCount].children[nextPosition];
        if (passage[count] === " " && !isBackspace) {
            currentWordPosition += 1;
            wordCount += 1;
            letterCount = -1;
            passageText.children[wordCount].prepend(cursor);
        } else if (passage[count] === " " && isBackspace) {
            currentWordPosition -= 1;
            wordCount -= 1;
            letterCount = passageText.children[wordCount].children.length - 1;
            passageText.children[wordCount].children[letterCount].before(
                cursor,
            );
        } else currentCharacterSpan.after(cursor);
    }

    function handleInputEvent(event) {
        const key = event.data;
        const inputType = event.inputType;
        if (timer.startTime() === 0) {
            listElement.classList.add("list--hidden");
            textareaElement.classList.add("textarea--hidden");
            optionsElement.classList.add("controls--hidden");
            passage = currentTest.getCurrentPassage();
            words = passage.split(" ");
            timer.start();
        }

        if (inputType === "deleteContentBackward") {
            if (wordCount > 0 || letterCount > 0) {
                count -= 1;
                if (letterCount > 0) letterCount -= 1;
                moveCursor(letterCount, letterCount + 1, true);
                passageText.children[wordCount].children[
                    letterCount + 1
                ].classList.remove("correct", "incorrect");
            }
        } else {
            moveCursor(letterCount, letterCount + 1);
            if (currentWord !== wordCount && wordCount > currentWord) {
                lineWidth +=
                    passageText.children[wordCount].getBoundingClientRect()
                        .width - 5;
                currentWord = wordCount;
            }
            if (lineWidth >= passageWidth) {
                lineWidth =
                    passageText.children[wordCount].getBoundingClientRect()
                        .width;
                line += 1;
                if (line % 2 === 0) {
                    for (let index = lineCount; index >= 0; index--) {
                        passageText.children[index].remove();
                    }
                    line -= 1;
                    wordCount = wordCount - lineCount - 1;
                    currentWord = wordCount;
                }
                lineCount = wordCount - 1;
            }

            if (
                key === passage[count] ||
                (key === "-" && passage[count] === "\u2014")
            ) {
                currentCharacterSpan.classList.add("correct");
            } else {
                currentCharacterSpan.classList.add("incorrect");
                alertElement.textContent =
                    "Replace incorrect character: " +
                    key +
                    " with " +
                    passage[count] +
                    " in word " +
                    words[currentWordPosition];
                numberOfIncorrect += 1;
            }

            totalCharactersTyped += 1;
            count += 1;
            letterCount += 1;

            if (count >= passage.length) {
                showResults();
            }
        }
    }

    return {
        handleInputEvent,
        timer,
        totalCharactersTyped: () => totalCharactersTyped,
        numberOfIncorrect: () => numberOfIncorrect,
        currentWordPosition: () => currentWordPosition,
    };
}

function handleReset() {
    reset();
    if (dialogElement.open) dialogElement.close();
}

function handleCustomPassageInput() {
    const customPassage = DOMPurify.sanitize(textareaInputElement.value.trim());
    if (customPassage.length > 0) {
        textareaInputElement.value = "";
        currentTest.setCustomPassage(customPassage);
        currentTest.insertPassageWithCharacterSpan(passageText);
        currentTest.isCustom.set(true);
    }
    if (currentTest.isCustom.get()) {
        textareaElement.classList.toggle("textarea--hidden");
    } else {
        reset();
    }
}

function handleDifficulty(event) {
    const difficulty = currentTest.setDifficulty(
        event.target.attributes["data-difficulty"].value,
    );
    changeActiveButton(
        ".button--active[data-difficulty]",
        "button--active",
        event.target,
    );
    if (difficulty === "custom") {
        textareaElement.classList.toggle("textarea--hidden");
        if (
            textareaElement.classList.contains("textarea--hidden") &&
            !currentTest.isCustom.get()
        ) {
            reset();
        }
    } else {
        reset();
    }
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

function handleTheme() {
    if (rootElement.dataset.theme === "dark") {
        toggleTheme("light", "./assets/images/sun-regular-full.svg");
    } else {
        toggleTheme("dark", "./assets/images/moon-solid-full.svg");
    }
}

function changeActiveButton(
    activeButtonSelector,
    activeButtonClass,
    addToElement,
) {
    const activeButton = element(activeButtonSelector).element;
    activeButton.classList.remove(activeButtonClass);
    addToElement.classList.add(activeButtonClass);
}

function reset() {
    const currentMode = currentTest.getMode();
    if (handlerTimer.startTime() !== 0) handlerTimer.stop();
    textareaElement.classList.add("textarea--hidden");
    listElement.classList.remove("list--hidden");
    optionsElement.classList.remove("controls--hidden");
    timeElement.classList.remove("list__item-value--yellow");
    accuracyElement.classList.remove("list__item-value--red");
    timeElement.textContent = currentMode + "s";
    currentTest.setSinglePassage(
        currentTest.getDifficulty() === "custom"
            ? currentTest.setDifficulty("easy")
            : currentTest.getDifficulty(),
    );
    currentTest.isCustom.set(false);
    changeActiveButton(
        ".button--active[data-difficulty]",
        "button--active",
        document.querySelector(
            `[data-difficulty="${currentTest.getDifficulty()}"]`,
        ),
    );
    currentTest.insertPassageWithCharacterSpan(passageText);
    currentTest.setAccuracy(100, 0, accuracyElement);
    abortController();
    ({ abortController, handlerTimer, currentWordPosition } =
        initPassageInput());
    controlsReset.reset();
    statusElement.textContent = `New passage set. Difficulty: ${currentTest.getDifficulty()}. Time mode: ${
        currentMode === "0" ? "passage" : currentMode + "seconds"
    }.`;
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
    if (currentTest.getMode() === "0") {
        resultMode.textContent = handlerTimer.getElapsedTime() + "s";
        resultMode.setAttribute("datetime", "");
    } else {
        resultMode.textContent = currentTest.getMode() + "s";
        resultMode.setAttribute("datetime", `PT${currentTest.getMode()}S`);
    }
    dialogElement.showModal();
    document.querySelector(".dialog ul").focus();
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

export {
    passageText,
    passageInput,
    statusElement,
    trackStats,
    reset,
    showResults,
    currentWordPosition,
    handleDifficulty,
    handleMode,
    handleCustomPassageInput,
    handleReset,
    handleTheme,
};
