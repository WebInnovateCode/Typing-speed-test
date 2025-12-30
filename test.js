import { getRandomNumberWithinRange } from "./mathUtilities.js";

export function getPassage(jsonData, difficulty) {
    return (
        jsonData[difficulty][getRandomNumberWithinRange(0, 9)].text ??
        jsonData[difficulty][0].text
    );
}
