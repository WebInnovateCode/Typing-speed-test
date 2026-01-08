import { element } from "./element.js";
import {
    trackStats,
    handleDifficulty,
    handleMode,
    showResults,
    reset,
    resizeInputHeight,
    changeActiveButton,
} from "./handlers.js";

export function initializeValues(currentTest, ...selectors) {
    const [
        inputSelector,
        textSelector,
        {
            dialogSelector,
            dialogImageSelector,
            dialogTitleSelector,
            dialogSubtitleSelector,
            dialogButtonSelector,
        },
        timeSelector,
        resetSelector,
        { wpm, accuracy, difficulty, mode },
        pbWPMSelector,
        accuracySelector,
        wpmSelector,
        textareaButtonSelector,
        textareaSelector,
        textareaInputSelector,
        statusSelector,
        alertSelector,
    ] = selectors;
    const passageInput = element(inputSelector);
    const dialogElement = element(dialogSelector).element;
    const passageText = element(textSelector).element;
    const accuracyElement = element(accuracySelector).element;
    const wpmElement = element(wpmSelector).element;
    const pbWPM = element(pbWPMSelector).element;
    const textareaElement = element(textareaSelector).element;
    const textareaInputElement = element(textareaInputSelector).element;
    let handleKeydownEvent, timer, totalCharactersTyped, numberOfIncorrect;
    pbWPM.textContent = currentTest.getPB();

    function initializeNotExportedValues() {
        for (const difficulty of ["easy", "medium", "hard", "custom"]) {
            element(
                `[data-difficulty="${difficulty}"]`,
                "click",
                difficulty === "custom"
                    ? (event) => {
                          changeActiveButton(
                              ".button--active[data-difficulty]",
                              "button--active",
                              event.target,
                          );
                          textareaElement.classList.toggle("textarea--hidden");
                      }
                    : handleDifficulty,
            );
        }

        for (const mode of ["60", "45", "30", "15", "passage"]) {
            element(`[data-mode="${mode}"]`, "click", handleMode);
        }

        for (const element of document.querySelectorAll(resetSelector)) {
            element.addEventListener("click", () => {
                reset();
                dialogElement.close();
            });
        }

        element(textareaButtonSelector, "click", () => {
            const customPassage = DOMPurify.sanitize(
                textareaInputElement.value,
            );
            if (customPassage.length > 0) {
                textareaInputElement.value = "";
                currentTest.setCustomPassage(customPassage);
                currentTest.insertPassageWithCharacterSpan(passageText);
                currentTest.setDifficulty("custom");
                resizeInputHeight();
            }
            textareaElement.classList.toggle("textarea--hidden");
        });
    }

    initializeNotExportedValues();

    return {
        initializePassageInput: () => {
            ({
                handleKeydownEvent,
                timer,
                totalCharactersTyped,
                numberOfIncorrect,
            } = trackStats());
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
        passageText,
        dialogElement: {
            dialogElement,
            dialogImage: element(dialogImageSelector).element,
            dialogTitle: element(dialogTitleSelector).element,
            dialogSubtitle: element(dialogSubtitleSelector).element,
            dialogButton: element(dialogButtonSelector).element,
        },
        time: (() => {
            const timeElement = element(timeSelector).element;
            let previousTime = 0;
            const observer = new MutationObserver((mutation) => {
                const time = mutation[0].target.attributes["data-time"].value;
                if (previousTime !== time) {
                    currentTest.setWPM(
                        totalCharactersTyped(),
                        timer.getElapsedTime(),
                        wpmElement,
                    );
                    currentTest.setAccuracy(
                        totalCharactersTyped(),
                        numberOfIncorrect(),
                        accuracyElement,
                    );
                    if (currentTest.getAccuracy() < 100)
                        accuracyElement.classList.add("list__item-value--red");
                    previousTime = time;
                }
                if (time < currentTest.getMode())
                    timeElement.classList.add("list__item-value--yellow");
                if (currentTest.getMode() !== "0" && time === "0") {
                    showResults();
                }
            });

            observer.observe(timeElement, {
                attributes: true,
                attributeFilter: ["data-time"],
            });
            return {
                observer,
                timeElement,
            };
        })(),
        resultOfTest: {
            resultWPM: element(wpm).element,
            resultAccuracy: element(accuracy).element,
            resultDifficulty: element(difficulty).element,
            resultMode: element(mode).element,
        },
        pbWPM,
        accuracyElement,
        wpmElement,
        textareaElement,
        statusElement: element(statusSelector).element,
        alertElement: element(alertSelector).element,
    };
}
