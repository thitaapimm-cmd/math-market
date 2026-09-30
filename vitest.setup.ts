import "@testing-library/jest-dom/vitest";

/**
 * jsdom exposes HTMLDialogElement but does not implement its modal methods.
 * Keep this test-only shim close to the browser contract our components use:
 * opening makes the dialog modal, Escape dispatches cancel, and focus remains
 * inside the open dialog.
 */
if (typeof HTMLDialogElement !== "undefined") {
  const modalKeydownHandlers = new WeakMap<HTMLDialogElement, (event: KeyboardEvent) => void>();
  const modalFocusHandlers = new WeakMap<HTMLDialogElement, (event: FocusEvent) => void>();

  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");

      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        const cancelEvent = new Event("cancel", { cancelable: true });
        this.dispatchEvent(cancelEvent);
        if (!cancelEvent.defaultPrevented) this.close();
      };
      const handleFocus = (event: FocusEvent) => {
        if (this.contains(event.target as Node)) return;
        (this.querySelector<HTMLElement>("input, button, [tabindex]:not([tabindex='-1'])") ?? this).focus();
      };

      modalKeydownHandlers.set(this, handleKeydown);
      modalFocusHandlers.set(this, handleFocus);
      document.addEventListener("keydown", handleKeydown);
      document.addEventListener("focusin", handleFocus);
    },
  });

  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
      const keydownHandler = modalKeydownHandlers.get(this);
      const focusHandler = modalFocusHandlers.get(this);
      if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
      if (focusHandler) document.removeEventListener("focusin", focusHandler);
      this.dispatchEvent(new Event("close"));
    },
  });
}
