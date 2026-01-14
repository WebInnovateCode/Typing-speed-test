import { getRandomNumberWithinRange } from "./mathUtilities.js";
import fetchData from "./fetchData.js";

const getEveryPassage = await fetchData("./data.json");
const generatePassage = (difficulty = "easy", passages) =>
    passages[difficulty][getRandomNumberWithinRange(0, 9)].text ??
    passages[difficulty][0].text;
const encloseCharactersInSpan = (passage) => {
    const fragment = document.createDocumentFragment();
    const spanElement = document.createElement("span");
    const divElement = document.createElement("div");
    let clone = spanElement.cloneNode();
    let divClone = divElement.cloneNode();
    let newWord = false;
    clone.classList.add("cursor");
    divClone.append(clone);
    for (const letter of passage) {
        clone = spanElement.cloneNode();
        clone.textContent = letter;
        if (newWord) {
            divClone = divElement.cloneNode();
            newWord = false;
        }

        if (letter === " ") {
            clone.classList.add("test__whitespace");
            divClone.append(clone);
            fragment.append(divClone);
            newWord = true;
        } else {
            divClone.append(clone);
        }
    }
    fragment.append(divClone);
    return fragment;
};

function typingSpeedTest(defaultDifficulty = "easy", defaultMode = "60") {
    let difficulty = defaultDifficulty;
    let singlePassage = generatePassage(difficulty, getEveryPassage);
    let wpm = 0;
    let accuracy = 100;
    let mode = defaultMode;
    let numberOfPlays = localStorage.getItem("plays") ?? 0;
    let personalBest = localStorage.getItem("personalBest") ?? 0;
    let isCustom = false;

    return {
        getEveryPassage: getEveryPassage,
        getCurrentPassage: () => singlePassage,
        setSinglePassage: (difficulty, passageElement) => {
            singlePassage = generatePassage(difficulty, getEveryPassage);

            if (passageElement) passageElement.textContent = singlePassage;

            return singlePassage;
        },
        setCustomPassage: (passage, passageElement) => {
            singlePassage = passage;

            if (passageElement) passageElement.textContent = singlePassage;

            return singlePassage;
        },
        getWPM: () => wpm,
        setWPM: (charactersInputted, timeElapsed, wpmElement) => {
            if (timeElapsed <= 0) return wpm;

            wpm = Math.round(
                (charactersInputted / 5) *
                    (60 / timeElapsed) *
                    (accuracy / 100),
            );

            if (wpmElement && !Number.isNaN(wpm)) wpmElement.textContent = wpm;

            return wpm;
        },
        getAccuracy: () => accuracy,
        setAccuracy: (totalCharacters, incorrect, accuracyElement) => {
            if (totalCharacters === 0) return accuracy;

            accuracy = Math.round(100 - (incorrect / totalCharacters) * 100);

            if (accuracyElement && !Number.isNaN(accuracy))
                accuracyElement.textContent = accuracy + "%";

            return accuracy;
        },
        getMode: () => (mode === "passage" ? "0" : mode),
        setMode: (newMode, modeElement) => {
            mode = newMode === "passage" ? "0" : newMode;

            if (modeElement) modeElement.textContent = mode + "s";

            return mode;
        },
        getDifficulty: () => difficulty,
        setDifficulty: (newDifficulty, difficultyElement) => {
            difficulty = newDifficulty;

            if (difficultyElement) difficultyElement.textContent = difficulty;

            return difficulty;
        },
        getPlays: () => numberOfPlays,
        incrementPlays: () => ++numberOfPlays,
        getPB: () => personalBest,
        setPB: (pb) => (personalBest = pb),
        isCustom: {
            get: () => isCustom,
            set: (custom) => (isCustom = custom),
        },
        startTimer: (element, attribute) => {
            let request;
            let start = 0;
            let elapsed = 0;

            const setTimeOnElement = (element, attribute) => {
                const currentTime =
                    mode === "0" ? elapsed : Math.max(mode - elapsed, 0);

                element.textContent = currentTime + "s";
                if (attribute) element.setAttribute(attribute, currentTime);

                return currentTime;
            };

            const timer = (timestamp) => {
                if (start === 0) {
                    start = timestamp;
                }

                elapsed = Math.floor((timestamp - start) / 1000);

                if (element) setTimeOnElement(element, attribute);

                if (mode === "0" || elapsed < mode) {
                    request = requestAnimationFrame(timer);
                } else {
                    cancelAnimationFrame(request);
                }
            };

            return {
                start: () => (request = requestAnimationFrame(timer)),
                getElapsedTime: () => elapsed,
                startTime: () => start,
                stop: () => cancelAnimationFrame(request),
            };
        },
        insertPassageWithCharacterSpan: (element) =>
            element.replaceChildren(encloseCharactersInSpan(singlePassage)),
    };
}

export const currentTest = typingSpeedTest("easy", "60");
