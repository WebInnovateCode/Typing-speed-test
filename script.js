import fetchData from "./fetchData.js";
import {
    addEventListenertoElement,
    persistCountForHandler,
} from "./handlers.js";
import { getRandomNumberWithinRange } from "./mathUtilities.js";

const paragraphText = await fetchData("./data.json");
const passage =
    paragraphText["hard"][getRandomNumberWithinRange(0, 9)].text ??
    paragraphText["hard"][0].text;
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

passageParagraph.textContent = passage;
passageInput.style.height = passageParagraph.scrollHeight + "px";
