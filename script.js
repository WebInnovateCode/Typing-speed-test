import { currentTypingSpeedTest } from "./test.js";
import { passageInput, passageText } from "./handlers.js";

currentTypingSpeedTest.insertPassageWithCharacterSpan(passageText);
passageInput.style.height = passageText.scrollHeight + "px";
