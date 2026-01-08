import { typingSpeedTest } from "./test.js";
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
    statusElement,
    alertElement,
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
    "[role='timer']",
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
    "[role='status']",
    "[role='alert']",
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
    const computedStyles = globalThis.getComputedStyle(passageText);
    const passageWidth =
        passageText.getBoundingClientRect().width -
        Number.parseFloat(computedStyles.paddingRight) -
        Number.parseFloat(computedStyles.paddingLeft);
    let lineWidth = 5;
    let line = 0;
    let wordCount = 0;
    let letterCount = 0;
    let previousWord = 0;
    let currentWord = -1;
    let lineCount = 0;
    function moveCursor(currentPosition, nextPosition, isBackspace = false) {
        cursor = passageText.children[wordCount].children[currentPosition];
        currentCharacterSpan =
            passageText.children[wordCount].children[nextPosition];
        if (passage[count] === " " && !isBackspace) {
            wordCount += 1;
            letterCount = -1;
            passageText.children[wordCount].prepend(cursor);
        } else if (passage[count] === " " && isBackspace) {
            wordCount -= 1;
            letterCount = passageText.children[wordCount].children.length - 1;
            passageText.children[wordCount].children[letterCount].before(
                cursor,
            );
        } else currentCharacterSpan.after(cursor);
    }

    function handleKeydownEvent(event) {
        if (timer.startTime() === 0) {
            passage = currentTest.getCurrentPassage();
            timer.start();
        }

        if (event.key === "Backspace") {
            if (wordCount > 0 || letterCount > 0) {
                count -= 1;
                if (letterCount > 0) letterCount -= 1;
                moveCursor(letterCount, letterCount + 1, true);
                passageText.children[wordCount].children[
                    letterCount + 1
                ].className = "";
            }
        } else if (
            event.key !== "CapsLock" &&
            event.key !== "Shift" &&
            event.key !== "Escape"
        ) {
            moveCursor(letterCount, letterCount + 1);
            if (currentWord !== wordCount && wordCount > currentWord) {
                lineWidth +=
                    passageText.children[wordCount].getBoundingClientRect()
                        .width - 5;
                currentWord = wordCount;
                console.log(lineWidth);
            }
            if (lineWidth >= passageWidth) {
                console.log("test");
                lineWidth =
                    passageText.children[wordCount].getBoundingClientRect()
                        .width;
                line += 1;
                if (line % 2 === 0) {
                    for (let i = lineCount; i >= 0; i--) {
                        passageText.children[i].remove();
                    }
                    line -= 1;
                    wordCount = wordCount - lineCount - 1;
                    currentWord = wordCount;
                }
                lineCount = wordCount - 1;
            }

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
            letterCount += 1;

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
    const currentMode = currentTest.getMode();
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
    timeElement.textContent = currentMode + "s";
    currentTest.setSinglePassage(currentTest.getDifficulty());
    currentTest.insertPassageWithCharacterSpan(passageText);
    currentTest.setAccuracy(100, 0, accuracyElement);
    abortController();
    ({ passageInput, abortController, handlerTimer } =
        initializePassageInput());
    statusElement.textContent = `Typing test reset. Difficulty: ${currentTest.getDifficulty()}. Time mode: ${
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
