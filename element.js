export function element(selector, eventType, eventHandler) {
    const element = document.querySelector(selector);

    if (eventType && eventHandler)
        element.addEventListener(eventType, eventHandler);

    return {
        addListener: (type, handler) => {
            element.addEventListener(type, handler);
        },
        element,
    };
}
