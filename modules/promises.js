
/**
 * Creates a one-off event-handler for a given |type| on |target|.
 */
async function eventToPromise(target, type) {
  const controller = new AbortController();
  const signal = controller.signal;
  const promise =
    new Promise((resolve) => target.addEventHandler(type, resolve));
  const ev = await promise;
  controller.abort();
  return ev;
}

export {
  eventToPromise
}