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
) {
    const passageInput = element(inputSelector);
    const dialogElement = element(dialogSelector).element;

    (() => {
        for (const difficulty of ["easy", "medium", "hard", "custom"]) {
            element(
                `[data-difficulty="${difficulty}"]`,
                "click",
                difficulty === "custom"
                    ? (event) => {
                          const { element: activeButton } = element(
                              ".button--active[data-difficulty]",
                          );
                          activeButton.classList.remove("button--active");
                          event.target.classList.add("button--active");
                          document
                              .querySelector(".textarea")
                              .classList.toggle("textarea--hidden");
                      }
                    : handleDifficulty,
            );
        }

        for (const mode of ["60", "45", "30", "15", "passage"]) {
            element(`[data-mode="${mode}"]`, "click", handleMode);
        }
    })();

    for (const element of document.querySelectorAll(resetSelector)) {
        element.addEventListener("click", () => {
            reset();
            dialogElement.close();
        });
    }

    let handleKeydownEvent, timer;
    let passageText = element(textSelector).element;

    element(textareaButtonSelector, "click", () => {
        const customPassage = DOMPurify.sanitize(
            document.querySelector(".textarea__input").value,
        );
        document
            .querySelector(".textarea")
            .classList.toggle("textarea--hidden");
        document.querySelector(".textarea__input").value = "";
        currentTest.setCustomPassage(customPassage);
        currentTest.insertPassageWithCharacterSpan(passageText);
    });

    return {
        initializePassageInput: () => {
            ({ handleKeydownEvent, timer } = trackStats());
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
            const observer = new MutationObserver((mutation) => {
                const time = mutation[0].target.attributes["data-time"].value;
                if (time < currentTest.getMode())
                    timeElement.style.color = "var(--yellow-400)";
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
        pbWPM: element(pbWPMSelector).element,
        accuracyElement: element(accuracySelector).element,
        wpmElement: element(wpmSelector).element,
    };
}
