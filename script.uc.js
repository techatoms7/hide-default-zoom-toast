(function () {
  console.log("[ZoomToastScript] Loaded");

  const { ContentPrefs } = ChromeUtils.importESModule(
    "resource://gre/modules/ContentPrefs.sys.mjs"
  );

  const PREF_NAME = "browser.content.full-zoom";
  const loadContext = window.docShell.QueryInterface(Ci.nsILoadContext);

  const style = document.createElement("style");
  document.documentElement.appendChild(style);

  function formatZoom(val) {
    const num = Number(val);
    if (!Number.isFinite(num)) return "1";
    return Number(num.toFixed(2)).toString();
  }

  function applyZoomRule(rawVal) {
    const zoomStr = formatZoom(rawVal);
    style.textContent = `
      #zen-toast-container .zen-toast:has(label[data-l10n-id="zen-zoom-changed-toast"][data-l10n-args*='"percentage":${zoomStr}}']) {
        display: none !important;
      }
    `;
  }

  function refreshZoomPref() {
    ContentPrefs.getGlobal(PREF_NAME, loadContext, {
      handleResult(pref) {
        applyZoomRule(pref ? pref.value : 1);
      },
      handleCompletion() {}
    });
  }

  const observer = {
    onContentPrefSet(group, name, value) {
      if (group === null && name === PREF_NAME) {
        applyZoomRule(value);
      }
    },
    onContentPrefRemoved(group, name) {
      if (group === null && name === PREF_NAME) {
        applyZoomRule(1);
      }
    }
  };

  refreshZoomPref();
  ContentPrefs.addObserverForName(PREF_NAME, observer, loadContext);
  window.addEventListener("unload", () => {
    ContentPrefs.removeObserverForName(PREF_NAME, observer, loadContext);
    style.remove();
  }, { once: true });
})();
