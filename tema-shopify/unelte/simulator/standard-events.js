export function createViewEventElement(Base = HTMLElement) {
  return class extends Base { connectedCallback() {} dispatchViewEvent() {} };
}
const mk = () => class extends Event { constructor(d) { super('x', { bubbles: true }); Object.assign(this, d); } static createPromise() { let r, j; const promise = new Promise((a, b) => { r = a; j = b; }); promise.catch(() => {}); return { promise, resolve: r, reject: j }; } static createCartFromAjaxResponse(c) { return c; } };
export const PageViewEvent = mk(), CartLinesUpdateEvent = mk(), CartErrorEvent = mk(), CartNoteUpdateEvent = mk(), ProductSelectEvent = mk();
