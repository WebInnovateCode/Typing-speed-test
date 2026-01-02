import { element } from "./element.js";
import {
    trackStats,
    handleDifficulty,
    handleMode,
    showResults,
    reset,
} from "./handlers.js";

export function initializeValues(
    currentTest,
    inputSelector,
    textSelector,
    dialogSelector,
    timeSelector,
    resetSelector,
    { wpm, accuracy, difficulty, mode },
) {
    const passageInput = element(inputSelector);
    const dialogElement = element(dialogSelector).element;

    (() => {
        for (const difficulty of ["easy", "medium", "hard"]) {
            element(
                `[data-difficulty="${difficulty}"]`,
                "click",
                handleDifficulty,
            );
        }

        for (const mode of ["60", "45", "30", "15", "passage"]) {
            element(`[data-mode="${mode}"]`, "click", handleMode);
        }
    })();

    return {
        initializePassageInput: () => {
            const { handleKeydownEvent, timer } = trackStats();
            const abortController = passageInput.addListener(
                "keydown",
                handleKeydownEvent,
            );
            return {
                passageInput: passageInput.element,
                abortController,
                handlerTimer: timer,
            };
        },
        passageText: element(textSelector).element,
        dialogElement,
        time: (() => {
            const timeElement = element(timeSelector).element;
            const observer = new MutationObserver((mutation) => {
                if (
                    currentTest.getMode() !== "0" &&
                    mutation[0].target.attributes["data-time"].value === "0"
                ) {
                    showResults();
                }
            });

            observer.observe(timeElement, { attributes: true });
            return {
                observer,
                timeElement,
            };
        })(),
        resetButtonElement: element(resetSelector, "click", () => {
            reset();
            dialogElement.close();
        }),
        resultOfTest: {
            resultWPM: element(wpm).element,
            resultAccuracy: element(accuracy).element,
            resultDifficulty: element(difficulty).element,
            resultMode: element(mode).element,
        },
    };
}
