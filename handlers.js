import { getPassage } from "./test.js";

export function addEventListenertoElement(element, type = "click", handler) {
    element.addEventListener(type, handler);
}

export function persistCountForHandler() {
    let count = 0;
    return function handleKeydownEvent(
        passageParagraph,
        passage,
        spanElement,
        event,
    ) {
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
            event.key === passage[count] ||
            (event.key === "-" && passage[count] === "\u2014")
                ? cloneSpanElement.classList.add("correct")
                : cloneSpanElement.classList.add("incorrect");
            passageParagraph.lastChild.before(cloneSpanElement);
            passageParagraph.lastChild.replaceWith(passage.slice(++count));
        }
    };
}

export function handleDifficulty(element, jsonData, event) {
    element.textContent = getPassage(
        jsonData,
        event.target.attributes["data-difficulty"].value,
    );
}
