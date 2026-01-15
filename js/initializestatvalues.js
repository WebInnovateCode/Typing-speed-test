import { currentTest } from "./test.js";
import { element } from "./element.js";
import {
    trackStats,
    showResults,
    handleCustomPassageInput,
    handleDifficulty,
    handleMode,
    handleReset,
    handleTheme,
} from "./handlers.js";

export const targetElements = initializeValues(currentTest, {
    inputSelector: "#passage",
    textSelector: ".test__passage",
    wpmResultSelector: "[data-result-wpm]",
    accuracyResultSelector: "[data-result-accuracy]",
    difficultyResultSelector: "[data-result-difficulty]",
    modeResultSelector: "[data-result-mode]",
    accuracySelector: "[data-accuracy]",
    wpmSelector: "[data-wpm]",
    pbWPMSelector: ".personal-best__wpm",
    dialogSelector: ".dialog",
    dialogImageSelector: ".dialog__image",
    dialogTitleSelector: ".dialog__title",
    dialogSubtitleSelector: ".dialog__subtitle",
    dialogButtonSelector: ".dialog .button",
    timeSelector: "[role='timer']",
    resetSelector: "[data-type='restart']",
    textareaSelector: ".textarea",
    textareaInputSelector: ".textarea__input",
    textareaButtonSelector: ".textarea [data-type='complete']",
    statusSelector: "#status",
    alertSelector: "#alert",
    listSelector: ".list-wrapper .list:first-child",
    optionsSelector: ".controls",
    themeSelector: "[data-type='theme']",
    customSelector: "[data-difficulty='custom'",
});

function initNotExport(resetSelector, textareaButtonSelector, themeSelector) {
    for (const difficulty of ["easy", "medium", "hard", "custom"]) {
        element(`[data-difficulty="${difficulty}"]`, "click", handleDifficulty);
    }

    for (const mode of ["60", "45", "30", "15", "passage"]) {
        element(`[data-mode="${mode}"]`, "click", handleMode);
    }

    for (const element of document.querySelectorAll(resetSelector)) {
        element.addEventListener("click", handleReset);
    }

    element(themeSelector, "click", handleTheme);
}

function initializeValues(
    currentTest,
    {
        inputSelector,
        textSelector,
        wpmResultSelector,
        accuracyResultSelector,
        difficultyResultSelector,
        modeResultSelector,
        accuracySelector,
        wpmSelector,
        pbWPMSelector,
        dialogSelector,
        dialogImageSelector,
        dialogTitleSelector,
        dialogSubtitleSelector,
        dialogButtonSelector,
        timeSelector,
        resetSelector,
        textareaSelector,
        textareaInputSelector,
        textareaButtonSelector,
        statusSelector,
        alertSelector,
        listSelector,
        optionsSelector,
        themeSelector,
        customSelector,
    },
) {
    const accuracyElement = element(accuracySelector).element;
    const wpmElement = element(wpmSelector).element;
    const pbWPM = element(pbWPMSelector).element;
    const textareaButtonElement = element(
        textareaButtonSelector,
        "click",
        handleCustomPassageInput,
    ).element;
    const alertElement = element(alertSelector).element;
    const root = document.documentElement;
    const buttonThemeElement = element(themeSelector).element;
    const icon = buttonThemeElement.children[0];
    const restartIcon = element("#restart-icon").element;
    const toggleTheme = (theme, iconImageSource) => {
        root.dataset.theme = theme;
        icon.src = iconImageSource;
        icon.alt = theme + " mode";
        icon.classList.toggle("button__icon--white");
        restartIcon.classList.toggle("button__icon--black");
        localStorage.setItem("theme", theme);
    };
    let handleInputEvent,
        timer,
        totalCharactersTyped,
        numberOfIncorrect,
        currentWordPosition;

    function setup() {
        if (localStorage.getItem("theme") === "light") {
            toggleTheme("light", "./assets/images/sun-regular-full.svg");
        }

        pbWPM.textContent = currentTest.getPB();

        initNotExport(resetSelector, textareaButtonSelector, themeSelector);
    }

    setup();

    return {
        initPassageInput: (() => {
            const passageInput = element(inputSelector);
            return () => {
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
            };
        })(),
        passageText: element(textSelector).element,
        resultOfTest: {
            resultWPM: element(wpmResultSelector).element,
            resultAccuracy: element(accuracyResultSelector).element,
            resultDifficulty: element(difficultyResultSelector).element,
            resultMode: element(modeResultSelector).element,
        },
        accuracyElement,
        pbWPM,
        dialogElement: {
            dialogElement: element(dialogSelector).element,
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
        textareaElement: element(textareaSelector).element,
        textareaInputElement: element(textareaInputSelector).element,
        textareaButtonElement,
        statusElement: element(statusSelector).element,
        alertElement,
        listElement: element(listSelector).element,
        optionsElement: element(optionsSelector).element,
        buttonCustomElement: element(customSelector).element,
        toggleTheme,
        rootElement: root,
    };
}
