import { getPassage, startTimer, setWPM, setAccuracy } from "./test.js";

export function addEventListenertoElement(element, type = "click", handler) {
    element.addEventListener(type, handler);
}

export function persistCountForHandler() {
    let count = 0;
    let beginTimer = false;
    let numberOfWords = 0;
    let elapsedTime;
    let totalCharactersTyped = 0;
    let numberOfIncorrect = 0;
    return function handleKeydownEvent(
        passageParagraph,
        passage,
        spanElement,
        event,
    ) {
        if (!beginTimer) {
            elapsedTime = startTimer();
            beginTimer = true;
        }

        if (event.key === "Backspace") {
            if (count > 0) {
                passageParagraph.lastElementChild.remove();
                passageParagraph.lastChild.replaceWith(passage.slice(--count));
            }
        } else if (
            event.key !== "CapsLock" &&
            event.key !== "Shift" &&
            event.key !== "Escape"
        ) {
            const cloneSpanElement = spanElement.cloneNode(true);
            cloneSpanElement.textContent = passage[count];

            if (
                event.key === passage[count] ||
                (event.key === "-" && passage[count] === "\u2014")
            ) {
                cloneSpanElement.classList.add("correct");
            } else {
                cloneSpanElement.classList.add("incorrect");
                numberOfIncorrect += 1;
            }

            totalCharactersTyped += 1;
            passageParagraph.lastChild.before(cloneSpanElement);
            passageParagraph.lastChild.replaceWith(passage.slice(++count));
        }

        if (passage[count] === " ") {
            numberOfWords += 1;
            setWPM(numberOfWords, elapsedTime());
            setAccuracy(totalCharactersTyped, numberOfIncorrect);
        }
    };
}

export function handleDifficulty(element, jsonData, event) {
    element.textContent = getPassage(
        jsonData,
        event.target.attributes["data-difficulty"].value,
    );
    document
        .querySelector(".button--active")
        .classList.remove("button--active");
    event.target.classList.add("button--active");
}
