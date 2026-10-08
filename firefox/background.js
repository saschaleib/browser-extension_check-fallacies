// Works in Chrome (service worker) and Firefox (background script).
const api = globalThis.browser ?? globalThis.chrome;

api.action.onClicked.addListener(async (tab) => {
  try {
  	browser.sidebarAction.toggle();

  } catch (err) {
		console.error("Failed to call sidebar: " + err);
  }
});
