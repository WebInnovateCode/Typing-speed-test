import typingSpeedTest from "./test.js";
import { element } from "./element.js";
import { initializeValues } from "./initializestatvalues.js";

const currentTest = typingSpeedTest("easy", "60");
const {
    initializePassageInput,
    passageText,
    dialogElement,
    time: { timeElement },
    resultOfTest: { resultWPM, resultAccuracy, resultDifficulty, resultMode },
} = initializeValues(
    currentTest,
    "#passage",
    ".test__passage",
    "dialog",
    "time",
    "[data-type]",
    {
        wpm: "[data-result-wpm]",
        accuracy: "[data-result-accuracy]",
        difficulty: "[data-result-difficulty]",
        mode: "[data-result-mode]",
    },
);

let { passageInput, abortController, handlerTimer } = initializePassageInput();

function trackStats() {
    let count = 0;
    let totalCharactersTyped = 0;
    let numberOfIncorrect = 0;
    let timer = currentTest.startTimer(timeElement, "data-time");
    let passage;
    const { element: wpmElement } = element("[data-wpm]");
    const { element: accuracyElement } = element("[data-accuracy]");

    function handleKeydownEvent(event) {
        const currentCharacterSpan = passageText.children[count];
        if (timer.startTime() === 0) {
            passage = currentTest.getCurrentPassage();
            timer.start();
        }

        if (event.key === "Backspace") {
            if (count > 0) passageText.children[--count].className = "";
        } else if (
            event.key !== "CapsLock" &&
            event.key !== "Shift" &&
            event.key !== "Escape"
        ) {
            currentTest.setWPM(
                totalCharactersTyped,
                timer.getElapsedTime(),
                wpmElement,
            );
            currentTest.setAccuracy(
                totalCharactersTyped,
                numberOfIncorrect,
                accuracyElement,
            );

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
    };
}

function handleDifficulty(event) {
    const { element: activeButton } = element(".button--active");
    currentTest.setSinglePassage(
        currentTest.setDifficulty(
            event.target.attributes["data-difficulty"].value,
        ),
    );
    currentTest.insertPassageWithCharacterSpan(passageText);
    activeButton.classList.remove("button--active");
    event.target.classList.add("button--active");
    reset();
}

function handleMode(event) {
    currentTest.setMode(event.target.value, timeElement);
    reset();
}

function reset() {
    if (handlerTimer.startTime() !== 0) handlerTimer.stop();
    timeElement.textContent = currentTest.getMode() + "s";
    currentTest.setSinglePassage(currentTest.getDifficulty());
    currentTest.insertPassageWithCharacterSpan(passageText);
    abortController();
    ({ passageInput, abortController, handlerTimer } =
        initializePassageInput());
    resizeInputHeight();
}

function showResults() {
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
};
