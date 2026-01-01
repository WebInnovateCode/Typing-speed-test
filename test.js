import { getRandomNumberWithinRange } from "./mathUtilities.js";
import fetchData from "./fetchData.js";

const getEveryPassage = await fetchData("./data.json");
const generatePassage = (difficulty = "easy", passages) =>
    passages[difficulty][getRandomNumberWithinRange(0, 9)].text ??
    passages[difficulty][0].text;
const encloseCharactersInSpan = (passage) => {
    const fragment = document.createDocumentFragment();
    const spanElement = document.createElement("span");
    for (const letter of passage) {
        const clone = spanElement.cloneNode();
        clone.textContent = letter;
        fragment.append(clone);
    }
    return fragment;
};

export default function typingSpeedTest(
    defaultDifficulty = "easy",
    defaultMode = "60",
) {
    let difficulty = defaultDifficulty;
    let singlePassage = generatePassage(difficulty, getEveryPassage);
    let wpm = 40;
    let accuracy = 100;
    let mode = defaultMode;

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
        startTimer: (element, attribute) => {
            let request;
            let start = 0;
            let elapsed = 0;

            const setTimeOnElement = (element, attribute) => {
                const currentTime = mode === "0" ? elapsed : mode - elapsed;

                element.textContent = currentTime + "s";
                if (attribute) element.setAttribute(attribute, currentTime);

                return currentTime;
            };

            const timer = (timestamp) => {
                if (start === 0) {
                    start = timestamp;
                }

                elapsed = Math.round((timestamp - start) / 1000);

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
