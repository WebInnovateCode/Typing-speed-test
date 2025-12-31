import { currentTypingSpeedTest } from "./test.js";
import { element } from "./element.js";

export const { element: passageInput } = element(
    "#passage",
    "keydown",
    trackStats(),
);

export const { element: passageText } = element(".test__passage");

(() => {
    for (const difficulty of ["easy", "medium", "hard"]) {
        element(`[data-difficulty="${difficulty}"]`, "click", handleDifficulty);
    }

    element("#mode", "change", handleMode);
})();

function trackStats() {
    let count = 0;
    let numberOfWords = 0;
    let totalCharactersTyped = 0;
    let numberOfIncorrect = 0;
    let timer = currentTypingSpeedTest.startTimer();
    let passage;
    const { element: wpmElement } = element("[data-wpm]");
    const { element: accuracyElement } = element("[data-accuracy]");

    return function handleKeydownEvent(event) {
        const currentCharacterSpan = passageText.children[count];
        if (timer.startTime() === 0) {
            passage = currentTypingSpeedTest.getCurrentPassage();
            timer.start();
        }

        if (event.key === "Backspace") {
            if (count > 0) passageText.children[--count].className = "";
        } else if (
            event.key !== "CapsLock" &&
            event.key !== "Shift" &&
            event.key !== "Escape"
        ) {
            if (passage[count] === " ") {
                numberOfWords += 1;
                wpmElement.textContent = currentTypingSpeedTest.setWPM(
                    numberOfWords,
                    timer.getElapsedTime(),
                );
                accuracyElement.textContent =
                    currentTypingSpeedTest.setAccuracy(
                        totalCharactersTyped,
                        numberOfIncorrect,
                    ) + "%";
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
        }
    };
}

function handleDifficulty(event) {
    const { element: activeButton } = element(".button--active");
    currentTypingSpeedTest.setSinglePassage(
        event.target.attributes["data-difficulty"].value,
    );
    currentTypingSpeedTest.insertPassageWithCharacterSpan(passageText);
    activeButton.classList.remove("button--active");
    event.target.classList.add("button--active");
    passageInput.style.height = "auto";
    passageInput.style.height = passageText.scrollHeight + "px";
}

function handleMode(event) {
    currentTypingSpeedTest.setMode(event.target.value);
}
