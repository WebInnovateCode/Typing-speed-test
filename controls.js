import {
    statusElement,
    currentWordPosition,
    passageInput,
} from "./handlers.js";

export function controls(currentTest) {
    let currentKey;
    let oldWordPosition = -1;
    let words = currentTest.getCurrentPassage().split(" ");

    document.addEventListener("keyup", (event) => {
        if (document.activeElement === passageInput) {
            currentKey = event.key;

            if (currentKey === "Escape" && currentWordPosition() === 0) {
                statusElement.textContent =
                    "The test begins after the following word: " + words[0];
            } else if (currentWordPosition() !== oldWordPosition) {
                statusElement.textContent = words[currentWordPosition()];
                oldWordPosition = currentWordPosition();
            }

            if (currentKey === "ArrowUp") {
                statusElement.textContent = words[currentWordPosition() + 1];
            } else if (currentKey === "ArrowDown") {
                statusElement.textContent = words[currentWordPosition()];
            }
        }
    });

    return {
        reset: () => {
            currentKey = undefined;
            oldWordPosition = -1;
            words = currentTest.getCurrentPassage().split(" ");
        },
    };
}
