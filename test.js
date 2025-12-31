import { getRandomNumberWithinRange } from "./mathUtilities.js";
import fetchData from "./fetchData.js";

const getEveryPassage = await fetchData("./data.json");
const generatePassage = (difficulty) =>
    getEveryPassage[difficulty][getRandomNumberWithinRange(0, 9)].text ??
    getEveryPassage[difficulty][0].text;
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

export const currentTypingSpeedTest = typingSpeedTest("easy", "60");

export function typingSpeedTest(
    defaultDifficulty = "easy",
    defaultMode = "60",
) {
    let difficulty = defaultDifficulty;
    let singlePassage = generatePassage(difficulty);
    let wpm = 40;
    let accuracy = 94;
    let mode = defaultMode;

    return {
        getEveryPassage: getEveryPassage,
        getCurrentPassage: () => singlePassage,
        setSinglePassage: (difficulty) =>
            (singlePassage = generatePassage(difficulty)),
        setCustomPassage: (passage) => (singlePassage = passage),
        getWPM: () => wpm,
        setWPM: (numberOfWords, timeElapsed) =>
            (wpm = Math.round(numberOfWords * (60 / timeElapsed))),
        getAccuracy: () => accuracy,
        setAccuracy: (totalCharacters, numberOfIncorrect) =>
            Math.round(100 - (numberOfIncorrect / totalCharacters) * 100),
        getMode: () => mode,
        setMode: (newMode) => (mode = newMode),
        startTimer: () => {
            let request;
            let start = 0;
            let elapsed;
            const timer = (timestamp) => {
                if (start === 0) {
                    start = timestamp;
                }
                elapsed = Math.round((timestamp - start) / 1000);
                document.querySelector("time").textContent = 60 - elapsed + "s";
                elapsed < 60
                    ? (request = requestAnimationFrame(timer))
                    : cancelAnimationFrame(request);
            };

            return {
                start: () => (request = requestAnimationFrame(timer)),
                getElapsedTime: () => elapsed,
                startTime: () => start,
            };
        },
        insertPassageWithCharacterSpan: (element) =>
            element.replaceChildren(encloseCharactersInSpan(singlePassage)),
    };
}
