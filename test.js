import { getRandomNumberWithinRange } from "./mathUtilities.js";

export function getPassage(jsonData, difficulty) {
    return (
        jsonData[difficulty][getRandomNumberWithinRange(0, 9)].text ??
        jsonData[difficulty][0].text
    );
}

export function startTimer() {
    let start = 0;
    let request;

    function timer(timestamp) {
        if (start === 0) {
            start = timestamp;
        }

        const elapsed = (timestamp - start) / 1000;
        document.querySelector("time").textContent =
            Math.ceil(60 - elapsed) + "s";

        if (elapsed < 60) {
            request = requestAnimationFrame(timer);
        } else {
            cancelAnimationFrame(request);
        }
    }

    request = requestAnimationFrame(timer);
}
