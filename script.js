import fetchData from "./fetchData.js";
import {
    addEventListenertoElement,
    persistCountForHandler,
    handleDifficulty,
} from "./handlers.js";
import { getPassage } from "./test.js";

const paragraphText = await fetchData("./data.json");
const difficulty = "easy";
const passage = getPassage(paragraphText, difficulty);
const passageParagraph = document.querySelector(".test__passage");
const passageInput = document.querySelector("#passage");

addEventListenertoElement(
    passageInput,
    "keydown",
    persistCountForHandler().bind(
        undefined,
        passageParagraph,
        passage,
        document.createElement("span"),
    ),
);

for (const element of document.querySelectorAll("[data-difficulty]")) {
    addEventListenertoElement(
        element,
        "click",
        handleDifficulty.bind(undefined, passageParagraph, paragraphText),
    );
}

passageParagraph.textContent = passage;
passageInput.style.height = passageParagraph.scrollHeight + "px";
