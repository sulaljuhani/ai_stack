const PUBLIC_WEBUI_BASE_URL = "https://web.suluhome.com";
const APP_NAME = "Open WebUI";
const normalizeBaseUrl = (url) => url?.replace(/\/+$/, "") ?? "";
const configuredBaseUrl = normalizeBaseUrl(PUBLIC_WEBUI_BASE_URL);
const defaultBaseUrl = "";
const WEBUI_BASE_URL = configuredBaseUrl || defaultBaseUrl;
const deriveHostname = (url) => {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
};
deriveHostname(WEBUI_BASE_URL);
const WEBUI_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1`;
const OLLAMA_API_BASE_URL = `${WEBUI_BASE_URL}/ollama`;
const AUDIO_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1/audio`;
const RETRIEVAL_API_BASE_URL = `${WEBUI_BASE_URL}/api/v1/retrieval`;
const WEBUI_VERSION = "0.6.38";
export {
  AUDIO_API_BASE_URL as A,
  OLLAMA_API_BASE_URL as O,
  RETRIEVAL_API_BASE_URL as R,
  WEBUI_BASE_URL as W,
  WEBUI_API_BASE_URL as a,
  WEBUI_VERSION as b,
  APP_NAME as c
};
//# sourceMappingURL=constants.js.map
