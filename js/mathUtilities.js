export function getRandomNumberWithinRange(min, max) {
    if (!Number.isInteger(min) | !Number.isInteger(max)) {
        return 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
