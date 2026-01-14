import { element } from "./element.js";
import {
    trackStats,
    handleDifficulty,
    handleMode,
    showResults,
    reset,
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
        listSelector,
        alertSelector,
        optionsSelector,
        themeSelector,
    ] = selectors;
    const passageInput = element(inputSelector);
    const dialogElement = element(dialogSelector).element;
    const passageText = element(textSelector).element;
    const accuracyElement = element(accuracySelector).element;
    const wpmElement = element(wpmSelector).element;
    const pbWPM = element(pbWPMSelector).element;
    const textareaElement = element(textareaSelector).element;
    const textareaInputElement = element(textareaInputSelector).element;
    const statusElement = element(statusSelector).element;
    const alertElement = element(alertSelector).element;
    const buttonThemeElement = element(themeSelector).element;
    const root = document.documentElement;
    let handleInputEvent,
        timer,
        totalCharactersTyped,
        numberOfIncorrect,
        currentWordPosition;
    pbWPM.textContent = currentTest.getPB();
    const theme = localStorage.getItem("theme") ?? "dark";
    if (theme === "light") {
        buttonThemeElement.children[0].classList.remove("button__icon--white");
        buttonThemeElement.children[0].src =
            "./assets/images/sun-regular-full.svg";
        document
            .querySelector("#restart-icon")
            .classList.toggle("button__icon--black");
    }
    document.querySelector("html").dataset.theme = theme;
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
                textareaInputElement.value.trim(),
            );
            if (customPassage.length > 0) {
                textareaInputElement.value = "";
                currentTest.setCustomPassage(customPassage);
                currentTest.insertPassageWithCharacterSpan(passageText);
                currentTest.setDifficulty("custom");
            }
            textareaElement.classList.toggle("textarea--hidden");
        });

        element(themeSelector, "click", () => {
            const icon = buttonThemeElement.children[0];

            if (root.dataset.theme === "dark") {
                root.dataset.theme = "light";
                icon.classList.remove("button__icon--white");
                icon.src = "./assets/images/sun-regular-full.svg";
                document
                    .querySelector("#restart-icon")
                    .classList.toggle("button__icon--black");

                localStorage.setItem("theme", "light");
            } else {
                root.dataset.theme = "dark";
                icon.classList.add("button__icon--white");
                icon.src = "./assets/images/moon-solid-full.svg";
                document
                    .querySelector("#restart-icon")
                    .classList.toggle("button__icon--black");

                localStorage.setItem("theme", "dark");
            }
        });
    }

    initializeNotExportedValues();

    return {
        initializePassageInput: () => {
            ({
                handleInputEvent,
                timer,
                totalCharactersTyped,
                numberOfIncorrect,
                currentWordPosition,
            } = trackStats());
            const abortController = passageInput.addListener(
                "input",
                handleInputEvent,
            );
            return {
                passageInput: passageInput.element,
                abortController,
                handlerTimer: timer,
                currentWordPosition,
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
                    if (time === "10") {
                        alertElement.textContent = "10 seconds remaining";
                    }
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
        statusElement,
        listElement: element(listSelector).element,
        alertElement,
        optionsElement: element(optionsSelector).element,
    };
}
