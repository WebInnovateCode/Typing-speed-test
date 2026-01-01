const addListener = (element, type, handler) => {
    const listenerController = new AbortController();
    element.addEventListener(type, handler, {
        signal: listenerController.signal,
    });
    return () => listenerController.abort();
};

export function element(selector, eventType, eventHandler) {
    const element = document.querySelector(selector);
    let abortController;

    if (eventType && eventHandler)
        abortController = addListener(element, eventType, eventHandler);

    return {
        addListener: addListener.bind(undefined, element),
        element,
        abortController,
    };
}
