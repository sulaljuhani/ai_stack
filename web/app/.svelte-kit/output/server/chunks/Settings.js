import { a as attr, c as attr_class, d as clsx, b as bind_props, j as escape_html, s as store_get, e as ensure_array_like, o as stringify, u as unsubscribe_stores, h as slot } from "./index.js";
import { g as goto, t as tick } from "./client.js";
import { p as page } from "./stores.js";
import { a as toast } from "./Toaster.svelte_svelte_type_style_lang.js";
import "clsx";
import { h as settings, n as config, m as models, u as user } from "./index2.js";
import { g as getModels, b as getBackendConfig } from "./index7.js";
import fileSaver from "file-saver";
import { a as WEBUI_API_BASE_URL, W as WEBUI_BASE_URL } from "./constants.js";
import { Y as fallback, Z as getContext } from "./context.js";
import { T as TTS_RESPONSE_SPLIT, a as copyToClipboard } from "./index4.js";
import "dompurify";
import "yaml";
import "dequal";
import "./create.js";
import { S as Spinner } from "./Spinner.js";
/* empty css                                     */
import "sortablejs";
import { marked } from "marked";
import { d as deleteAllModels, g as getBaseModels, u as updateModelById, c as createNewModel } from "./index9.js";
import { S as Search, E as EllipsisHorizontal } from "./EllipsisHorizontal.js";
import { T as Tooltip } from "./Tooltip.js";
import { S as Switch_1 } from "./Switch.js";
import "dayjs";
/* empty css                                    */
/* empty css                                            */
import { W as WrenchAlt, C as Cog6, D as DocumentDuplicate } from "./WrenchAlt.js";
import { M as Modal } from "./Modal.js";
import { C as ConfirmDialog } from "./ConfirmDialog.js";
import { C as ChevronUp, D as Download } from "./Download.js";
import { C as ChevronDown } from "./helpers.js";
import { X as XMark } from "./XMark.js";
import { M as Menu_content, f as flyAndScale, a as Menu_item } from "./menu-trigger.js";
import { T as Tags, D as Dropdown } from "./Tags.js";
import { L as Link } from "./Link.js";
import { P as Plus } from "./Plus.js";
import { S as SensitiveInput } from "./SensitiveInput.js";
import { T as Textarea } from "./Textarea.js";
import "socket.io-client";
import { A as AccessControl } from "./AccessControl.js";
const setToolServerConnections = async (token, connections) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/configs/tool_servers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...connections
    })
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getModelsConfig = async (token) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/configs/models`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
function Minus($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function PencilSolid($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"${attr_class(clsx(className))}><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function AddConnectionModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let ollama = fallback($$props["ollama"], false);
    let direct = fallback($$props["direct"], false);
    let connection = fallback($$props["connection"], null);
    let url = "";
    let key = "";
    let auth_type = "bearer";
    let connectionType = "external";
    let azure = false;
    let prefixId = "";
    let enable = true;
    let apiVersion = "";
    let headers = "";
    let tags = [];
    let modelId = "";
    let modelIds = [];
    let loading = false;
    const init = () => {
      if (connection) {
        url = connection.url;
        key = connection.key;
        auth_type = connection.config.auth_type ?? "bearer";
        headers = connection.config?.headers ? JSON.stringify(connection.config.headers, null, 2) : "";
        enable = connection.config?.enable ?? true;
        tags = connection.config?.tags ?? [];
        prefixId = connection.config?.prefix_id ?? "";
        modelIds = connection.config?.model_ids ?? [];
        if (ollama) {
          connectionType = connection.config?.connection_type ?? "local";
        } else {
          connectionType = connection.config?.connection_type ?? "external";
          azure = connection.config?.azure ?? false;
          apiVersion = connection.config?.api_version ?? "";
        }
      }
    };
    azure = (url.includes("azure.") || url.includes("cognitive.microsoft.com")) && !direct ? true : false;
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-1.5"><h1 class="text-lg font-medium self-center font-primary">`);
          if (edit) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Connection"))}`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Connection"))}`);
          }
          $$renderer4.push(`<!--]--></h1> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close modal"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1">`);
          if (!direct) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex gap-2"><div class="flex w-full justify-between items-center"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connection Type"))}</div> <div><button type="button" class="text-xs text-gray-700 dark:text-gray-300">`);
            if (connectionType === "local") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Local"))}`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("External"))}`);
            }
            $$renderer4.push(`<!--]--></button></div></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2 mt-1.5"><div class="flex flex-col w-full"><label for="url-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("URL"))}</label> <div class="flex-1"><input id="url-input"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", url)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("API Base URL"))} autocomplete="off" required/></div></div> `);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"),
            className: "self-end -mb-1",
            children: ($$renderer5) => {
              $$renderer5.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 rounded-lg transition" type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"))}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="w-4 h-4"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"></path></svg></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <div class="flex flex-col shrink-0 self-end"><label class="sr-only" for="toggle-connection">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Toggle whether current connection is active."))}</label> `);
          Tooltip($$renderer4, {
            content: enable ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
            children: ($$renderer5) => {
              Switch_1($$renderer5, {
                id: "toggle-connection",
                get state() {
                  return enable;
                },
                set state($$value) {
                  enable = $$value;
                  $$settled = false;
                }
              });
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="select-bearer-or-session"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Auth"))}</label> <div class="flex gap-2"><div class="flex-shrink-0 self-start">`);
          $$renderer4.select(
            {
              id: "select-bearer-or-session",
              class: `w-full text-sm bg-transparent pr-5 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`,
              value: auth_type
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "none" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("None"))}`);
              });
              $$renderer5.option({ value: "bearer" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Bearer"))}`);
              });
              if (!ollama) {
                $$renderer5.push("<!--[-->");
                $$renderer5.option({ value: "session" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Session"))}`);
                });
                $$renderer5.push(` `);
                if (!direct) {
                  $$renderer5.push("<!--[-->");
                  $$renderer5.option({ value: "system_oauth" }, ($$renderer6) => {
                    $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth"))}`);
                  });
                  $$renderer5.push(` `);
                  if (azure) {
                    $$renderer5.push("<!--[-->");
                    $$renderer5.option({ value: "microsoft_entra_id" }, ($$renderer6) => {
                      $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Entra ID"))}`);
                    });
                  } else {
                    $$renderer5.push("<!--[!-->");
                  }
                  $$renderer5.push(`<!--]-->`);
                } else {
                  $$renderer5.push("<!--[!-->");
                }
                $$renderer5.push(`<!--]-->`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
          $$renderer4.push(`</div> <div class="flex flex-1 items-center">`);
          if (auth_type === "bearer") {
            $$renderer4.push("<!--[-->");
            SensitiveInput($$renderer4, {
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("API Key"),
              required: false,
              get value() {
                return key;
              },
              set value($$value) {
                key = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[!-->");
            if (auth_type === "none") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No authentication"))}</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
              if (auth_type === "session") {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user session credentials to authenticate"))}</div>`);
              } else {
                $$renderer4.push("<!--[!-->");
                if (auth_type === "system_oauth") {
                  $$renderer4.push("<!--[-->");
                  $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user OAuth access token to authenticate"))}</div>`);
                } else {
                  $$renderer4.push("<!--[!-->");
                  if (["azure_ad", "microsoft_entra_id"].includes(auth_type)) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Uses DefaultAzureCredential to authenticate"))}</div>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]-->`);
                }
                $$renderer4.push(`<!--]-->`);
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]-->`);
          }
          $$renderer4.push(`<!--]--></div></div></div></div> `);
          if (!ollama && !direct) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="headers-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Headers"))}</label> <div class="flex-1">`);
            Tooltip($$renderer4, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t('Enter additional headers in JSON format (e.g. {"X-Custom-Header": "value"}'),
              children: ($$renderer5) => {
                Textarea($$renderer5, {
                  className: "w-full text-sm outline-hidden",
                  placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter additional headers in JSON format"),
                  required: false,
                  minSize: 30,
                  get value() {
                    return headers;
                  },
                  set value($$value) {
                    headers = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="prefix-id-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prefix ID"))}</label> <div class="flex-1">`);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Prefix ID is used to avoid conflicts with other connections by adding a prefix to the model IDs - leave empty to disable"),
            children: ($$renderer5) => {
              $$renderer5.push(`<input${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text" id="prefix-id-input"${attr("value", prefixId)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Prefix ID"))} autocomplete="off"/>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></div></div> `);
          if (!ollama && !direct) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex flex-row justify-between items-center w-full mt-2"><label for="prefix-id-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Provider Type"))}</label> <div><button type="button" class="text-xs text-gray-700 dark:text-gray-300">${escape_html(azure ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Azure OpenAI") : store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAI"))}</button></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (azure) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="api-version-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("API Version"))}</label> <div class="flex-1"><input id="api-version-input"${attr_class(`w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", apiVersion)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("API Version"))} autocomplete="off" required/></div></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex flex-col w-full mt-2"><div class="mb-1 flex justify-between"><div${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model IDs"))}</div></div> `);
          if (modelIds.length > 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<ul class="flex flex-col"><!--[-->`);
            const each_array = ensure_array_like(modelIds);
            for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
              let modelId2 = each_array[modelIdx];
              $$renderer4.push(`<li class="flex gap-2 w-full justify-between items-center"><div class="text-sm flex-1 py-1 rounded-lg">${escape_html(modelId2)}</div> <div class="shrink-0"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t(`Remove {{MODELID}} from list.`, { MODELID: modelId2 }))} type="button">`);
              Minus($$renderer4, { strokeWidth: "2", className: "size-3.5" });
              $$renderer4.push(`<!----></button></div></li>`);
            }
            $$renderer4.push(`<!--]--></ul>`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`<div${attr_class(`text-gray-500 text-xs text-center py-2 px-10
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>`);
            if (ollama) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t('Leave empty to include all models from "{{url}}/api/tags" endpoint', { url }))}`);
            } else {
              $$renderer4.push("<!--[!-->");
              if (azure) {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Deployment names are required for Azure OpenAI"))}`);
              } else {
                $$renderer4.push("<!--[!-->");
                $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t('Leave empty to include all models from "{{url}}/models" endpoint', { url }))}`);
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]--></div>`);
          }
          $$renderer4.push(`<!--]--></div> <div class="flex items-center"><label class="sr-only" for="add-model-id-input">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add a model ID"))}</label> <input${attr_class(`w-full py-1 text-sm rounded-lg bg-transparent ${stringify("text-gray-500")} ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "dark:placeholder:text-gray-100 placeholder:text-gray-700" : "placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden")}`)}${attr("value", modelId)} id="add-model-id-input"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Add a model ID"))}/> <div><button type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Add"))}>`);
          Plus($$renderer4, { className: "size-3.5", strokeWidth: "2" });
          $$renderer4.push(`<!----></button></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Tags"))}</div> <div class="flex-1 mt-0.5">`);
          Tags($$renderer4, {
            get tags() {
              return tags;
            },
            set tags($$value) {
              tags = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div></div> <div class="flex justify-end pt-3 text-sm font-medium gap-1.5">`);
          if (edit) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<button class="px-3.5 py-1.5 text-sm font-medium dark:bg-black dark:hover:bg-gray-900 dark:text-white bg-white text-black hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onSubmit, onDelete, show, edit, ollama, direct, connection });
  });
}
function AddToolServerModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let direct = fallback($$props["direct"], false);
    let connection = fallback($$props["connection"], null);
    let type = "openapi";
    let url = "";
    let spec_type = "url";
    let spec = "";
    let path = "openapi.json";
    let auth_type = "bearer";
    let key = "";
    let headers = "";
    let accessControl = {};
    let id = "";
    let name = "";
    let description = "";
    let oauthClientInfo = null;
    let enable = true;
    let loading = false;
    const init = () => {
      if (connection) {
        type = connection?.type ?? "openapi";
        url = connection.url;
        spec_type = connection?.spec_type ?? "url";
        spec = connection?.spec ?? "";
        path = connection?.path ?? "openapi.json";
        auth_type = connection?.auth_type ?? "bearer";
        headers = connection?.headers ? JSON.stringify(connection.headers, null, 2) : "";
        key = connection?.key ?? "";
        id = connection.info?.id ?? "";
        name = connection.info?.name ?? "";
        description = connection.info?.description ?? "";
        oauthClientInfo = connection.info?.oauth_client_info ?? null;
        enable = connection.config?.enable ?? true;
        accessControl = connection.config?.access_control ?? null;
      }
    };
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-2"><h1 class="text-lg font-medium self-center font-primary">`);
          if (edit) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Connection"))}`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Connection"))}`);
          }
          $$renderer4.push(`<!--]--></h1> <div class="flex items-center gap-3"><div class="flex gap-1.5 text-xs justify-end"><button class="hover:underline" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import"))}</button> <button class="hover:underline" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</button></div> <button class="self-center"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Close Configure Connection Modal"))}>`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><input type="file" hidden="" accept=".json"/> <form class="flex flex-col w-full"><div class="px-1">`);
          if (!direct) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex gap-2 mb-1.5"><div class="flex w-full justify-between items-center"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Type"))}</div> <div><button type="button" class="text-xs text-gray-700 dark:text-gray-300">`);
            if (["", "openapi"].includes(type)) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAPI"))}`);
            } else {
              $$renderer4.push("<!--[!-->");
              if (type === "mcp") {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("MCP"))} <span class="text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Streamable HTTP"))}</span>`);
              } else {
                $$renderer4.push("<!--[!-->");
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]--></button></div></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2"><div class="flex flex-col w-full"><div class="flex justify-between mb-0.5"><label for="api-base-url"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("URL"))}</label></div> <div class="flex flex-1 items-center"><input id="api-base-url"${attr_class(`w-full flex-1 text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", url)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("API Base URL"))} autocomplete="off" required/> `);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"),
            className: "shrink-0 flex items-center mr-1",
            children: ($$renderer5) => {
              $$renderer5.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 rounded-lg transition"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Verify Connection"))} type="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"></path></svg></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Tooltip($$renderer4, {
            content: enable ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
            children: ($$renderer5) => {
              Switch_1($$renderer5, {
                get state() {
                  return enable;
                },
                set state($$value) {
                  enable = $$value;
                  $$settled = false;
                }
              });
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></div></div> `);
          if (["", "openapi"].includes(type)) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between items-center mb-0.5"><div class="flex gap-2 items-center"><div for="select-bearer-or-session"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAPI Spec"))}</div></div></div> <div class="flex gap-2"><div class="flex-shrink-0 self-start">`);
            $$renderer4.select(
              {
                id: "select-bearer-or-session",
                class: `w-full text-sm bg-transparent pr-5 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`,
                value: spec_type
              },
              ($$renderer5) => {
                $$renderer5.option({ value: "url" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("URL"))}`);
                });
                $$renderer5.option({ value: "json" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("JSON"))}`);
                });
              }
            );
            $$renderer4.push(`</div> <div class="flex flex-1 items-center">`);
            if (spec_type === "url") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="flex-1 flex items-center"><label for="url-or-path" class="sr-only">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("openapi.json URL or Path"))}</label> <input${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text" id="url-or-path"${attr("value", path)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("openapi.json URL or Path"))} autocomplete="off" required/></div>`);
            } else {
              $$renderer4.push("<!--[!-->");
              if (spec_type === "json") {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<div${attr_class(`text-xs w-full self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}><label for="url-or-path" class="sr-only">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("JSON Spec"))}</label> <textarea${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700 text-black dark:text-white"}`)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("JSON Spec"))} autocomplete="off" required rows="5">`);
                const $$body = escape_html(spec);
                if ($$body) {
                  $$renderer4.push(`${$$body}`);
                }
                $$renderer4.push(`</textarea></div>`);
              } else {
                $$renderer4.push("<!--[!-->");
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]--></div></div> `);
            if (["", "url"].includes(spec_type)) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div${attr_class(`text-xs mt-1 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`WebUI will make requests to "{{url}}"`, {
                url: path.includes("://") ? path : `${url}${path.startsWith("/") ? "" : "/"}${path}`
              }))}</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><div class="flex justify-between items-center"><div class="flex gap-2 items-center"><div for="select-bearer-or-session"${attr_class(`text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Auth"))}</div></div> `);
          if (auth_type === "oauth_2.1") {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex items-center gap-2"><div class="flex flex-col justify-end items-center shrink-0">`);
            Tooltip($$renderer4, {
              content: oauthClientInfo ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Register Again") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Register Client"),
              children: ($$renderer5) => {
                $$renderer5.push(`<button class="text-xs underline dark:text-gray-500 dark:hover:text-gray-200 text-gray-700 hover:text-gray-900 transition" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Register Client"))}</button>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div> `);
            if (!oauthClientInfo) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="text-xs font-medium px-1.5 rounded-md bg-yellow-500/20 text-yellow-700 dark:text-yellow-200">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Not Registered"))}</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<div class="text-xs font-medium px-1.5 rounded-md bg-green-500/20 text-green-700 dark:text-green-200">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Registered"))}</div>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div> <div class="flex gap-2"><div class="flex-shrink-0 self-start">`);
          $$renderer4.select(
            {
              id: "select-bearer-or-session",
              class: `w-full text-sm bg-transparent pr-5 ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`,
              value: auth_type
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "none" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("None"))}`);
              });
              $$renderer5.option({ value: "bearer" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Bearer"))}`);
              });
              $$renderer5.option({ value: "session" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Session"))}`);
              });
              if (!direct) {
                $$renderer5.push("<!--[-->");
                $$renderer5.option({ value: "system_oauth" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth"))}`);
                });
                $$renderer5.push(` `);
                if (type === "mcp") {
                  $$renderer5.push("<!--[-->");
                  $$renderer5.option({ value: "oauth_2.1" }, ($$renderer6) => {
                    $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OAuth 2.1"))}`);
                  });
                } else {
                  $$renderer5.push("<!--[!-->");
                }
                $$renderer5.push(`<!--]-->`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
          $$renderer4.push(`</div> <div class="flex flex-1 items-center">`);
          if (auth_type === "bearer") {
            $$renderer4.push("<!--[-->");
            SensitiveInput($$renderer4, {
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("API Key"),
              required: false,
              get value() {
                return key;
              },
              set value($$value) {
                key = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[!-->");
            if (auth_type === "none") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No authentication"))}</div>`);
            } else {
              $$renderer4.push("<!--[!-->");
              if (auth_type === "session") {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user session credentials to authenticate"))}</div>`);
              } else {
                $$renderer4.push("<!--[!-->");
                if (auth_type === "system_oauth") {
                  $$renderer4.push("<!--[-->");
                  $$renderer4.push(`<div${attr_class(`text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Forwards system user OAuth access token to authenticate"))}</div>`);
                } else {
                  $$renderer4.push("<!--[!-->");
                  if (auth_type === "oauth_2.1") {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<div${attr_class(`flex items-center text-xs self-center translate-y-[1px] ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Uses OAuth 2.1 Dynamic Client Registration"))}</div>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]-->`);
                }
                $$renderer4.push(`<!--]-->`);
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]-->`);
          }
          $$renderer4.push(`<!--]--></div></div></div></div> `);
          if (!direct) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="headers-input"${attr_class(`mb-0.5 text-xs text-gray-500
								${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : ""}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Headers"))}</label> <div class="flex-1">`);
            Tooltip($$renderer4, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t('Enter additional headers in JSON format (e.g. {"X-Custom-Header": "value"}'),
              children: ($$renderer5) => {
                Textarea($$renderer5, {
                  className: "w-full text-sm outline-hidden",
                  placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter additional headers in JSON format"),
                  required: false,
                  minSize: 30,
                  get value() {
                    return headers;
                  },
                  set value($$value) {
                    headers = $$value;
                    $$settled = false;
                  }
                });
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div></div></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="flex gap-2"><div class="flex flex-col w-full"><label for="enter-id"${attr_class(`mb-0.5 text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ID"))} `);
            if (type !== "mcp") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<span class="text-xs text-gray-200 dark:text-gray-800 ml-0.5">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Optional"))}</span>`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--></label> <div class="flex-1"><input id="enter-id"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", id)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter ID"))} autocomplete="off"${attr("required", type === "mcp", true)}/></div></div></div> <div class="flex gap-2 mt-2"><div class="flex flex-col w-full"><label for="enter-name"${attr_class(`mb-0.5 text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100" : "text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</label> <div class="flex-1"><input id="enter-name"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter name"))} autocomplete="off" required/></div></div></div> <div class="flex flex-col w-full mt-2"><label for="description"${attr_class(`mb-1 text-xs ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "text-gray-800 dark:text-gray-100 placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-500"}`)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Description"))}</label> <div class="flex-1"><input id="description"${attr_class(`w-full text-sm bg-transparent ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : "outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-700"}`)} type="text"${attr("value", description)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter description"))} autocomplete="off"/></div></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="my-2 -mx-2"><div class="px-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-3xl">`);
            AccessControl($$renderer4, {
              get accessControl() {
                return accessControl;
              },
              set accessControl($$value) {
                accessControl = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div> `);
          if (type === "mcp") {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="bg-yellow-500/20 text-yellow-700 dark:text-yellow-200 rounded-2xl text-xs px-4 py-3 mb-2"><span class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Warning"))}:</span> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("MCP support is experimental and its specification changes often, which can lead to incompatibilities. OpenAPI specification support is directly maintained by the Open WebUI team, making it the more reliable option for compatibility."))} <a class="font-medium underline" href="https://docs.openwebui.com/features/mcp" target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Read more →"))}</a></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="flex justify-between pt-3 text-sm font-medium gap-1.5"><div></div> <div class="flex gap-1.5">`);
          if (edit) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<button class="px-3.5 py-1.5 text-sm font-medium dark:bg-black dark:hover:bg-gray-900 dark:text-white bg-white text-black hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></button></div></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onSubmit, onDelete, show, edit, direct, connection });
  });
}
function Connection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let onSubmit = fallback($$props["onSubmit"], () => {
    });
    let connection = fallback($$props["connection"], null);
    let direct = fallback($$props["direct"], false);
    let showConfigModal = false;
    let showDeleteConfirmDialog = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AddToolServerModal($$renderer3, {
        edit: true,
        direct,
        connection,
        onDelete: () => {
          showDeleteConfirmDialog = true;
        },
        onSubmit: (c) => {
          connection = c;
          onSubmit(c);
        },
        get show() {
          return showConfigModal;
        },
        set show($$value) {
          showConfigModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="flex w-full gap-2 items-center">`);
      Tooltip($$renderer3, {
        className: "w-full relative",
        content: "",
        placement: "top-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex w-full"><div${attr_class(`flex-1 relative flex gap-1.5 items-center ${stringify(!(connection?.config?.enable ?? true) ? "opacity-50" : "")}`)}>`);
          Tooltip($$renderer4, {
            content: connection?.type === "mcp" ? store_get($$store_subs ??= {}, "$i18n", i18n).t("MCP") : store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAPI"),
            children: ($$renderer5) => {
              WrenchAlt($$renderer5, {});
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          if (connection?.info?.name) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="capitalize outline-hidden w-full bg-transparent">${escape_html(connection?.info?.name ?? connection?.url)} <span class="text-gray-500">${escape_html(connection?.info?.id ?? "")}</span></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`<div>${escape_html(connection?.url)}</div>`);
          }
          $$renderer4.push(`<!--]--></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> <div class="flex gap-1">`);
      Tooltip($$renderer3, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Configure"),
        className: "self-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<button class="self-center p-1 bg-transparent hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 rounded-lg transition" type="button">`);
          Cog6($$renderer4, {});
          $$renderer4.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onDelete, onSubmit, connection, direct });
  });
}
function Database($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    $$renderer2.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full"><div><div class="mb-2 text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Database"))}</div> <input id="config-json-input" hidden="" type="file" accept=".json"/> <button type="button" class="flex rounded-md py-2 px-3 w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"><div class="self-center mr-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z"></path><path fill-rule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clip-rule="evenodd"></path></svg></div> <div class="self-center text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import Config from JSON File"))}</div></button> <button type="button" class="flex rounded-md py-2 px-3 w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"><div class="self-center mr-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z"></path><path fill-rule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clip-rule="evenodd"></path></svg></div> <div class="self-center text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export Config to JSON File"))}</div></button> <hr class="border-gray-50 dark:border-gray-850 my-1"/> `);
    if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_admin_export ?? true) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex w-full justify-between"><button class="flex rounded-md py-1.5 px-3 w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition" type="button"><div class="self-center mr-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z"></path><path fill-rule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clip-rule="evenodd"></path></svg></div> <div class="self-center text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Download Database"))}</div></button></div> <button class="flex rounded-md py-2 px-3 w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"><div class="self-center mr-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z"></path><path fill-rule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clip-rule="evenodd"></path></svg></div> <div class="self-center text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export All Chats (All Users)"))}</div></button> <button class="flex rounded-md py-2 px-3 w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"><div class="self-center mr-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3Z"></path><path fill-rule="evenodd" d="M13 6H3v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6ZM8.75 7.75a.75.75 0 0 0-1.5 0v2.69L6.03 9.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06l-1.22 1.22V7.75Z" clip-rule="evenodd"></path></svg></div> <div class="self-center text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export Users"))}</div></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></form>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function General($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function Pipelines($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="flex justify-center h-full"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { saveHandler });
  });
}
function Audio($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let TTS_ENGINE = "";
    let TTS_VOICE = "";
    let TTS_SPLIT_ON = TTS_RESPONSE_SPLIT.PUNCTUATION;
    let STT_ENGINE = "";
    let STT_SUPPORTED_CONTENT_TYPES = "";
    let STT_WHISPER_MODEL = "";
    let STT_WHISPER_MODEL_LOADING = false;
    let voices = [];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full"><div class="flex flex-col gap-3"><div><div class="mt-0.5 mb-2.5 text-base font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Speech-to-Text"))}</div> <hr class="border-gray-100 dark:border-gray-850 my-2"/> `);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="mb-2"><div class="mb-1.5 text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Supported MIME Types"))}</div> <div class="flex w-full"><div class="flex-1"><input class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"${attr("value", STT_SUPPORTED_CONTENT_TYPES)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("e.g., audio/wav,audio/mpeg,video/* (leave blank for defaults)"))}/></div></div></div>`);
      }
      $$renderer3.push(`<!--]--> <div class="mb-2 py-0.5 flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Speech-to-Text Engine"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: "dark:bg-gray-900 cursor-pointer w-fit pr-8 rounded-sm px-2 p-1 text-xs bg-transparent outline-hidden text-right",
          value: STT_ENGINE,
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select an engine")
        },
        ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Whisper (Local)"))}`);
          });
          $$renderer4.option({ value: "openai" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAI"))}`);
          });
          $$renderer4.option({ value: "web" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Web API"))}`);
          });
          $$renderer4.option({ value: "deepgram" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Deepgram"))}`);
          });
          $$renderer4.option({ value: "azure" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Azure AI Speech"))}`);
          });
          $$renderer4.option({ value: "mistral" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("MistralAI"))}`);
          });
        }
      );
      $$renderer3.push(`</div></div> `);
      {
        $$renderer3.push("<!--[!-->");
        {
          $$renderer3.push("<!--[!-->");
          {
            $$renderer3.push("<!--[!-->");
            {
              $$renderer3.push("<!--[!-->");
              {
                $$renderer3.push("<!--[-->");
                $$renderer3.push(`<div><div class="mb-1.5 text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("STT Model"))}</div> <div class="flex w-full"><div class="flex-1 mr-2"><input class="w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Set whisper model"))}${attr("value", STT_WHISPER_MODEL)}/></div> <button class="px-2.5 bg-gray-50 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-100 rounded-lg transition"${attr("disabled", STT_WHISPER_MODEL_LOADING, true)}>`);
                {
                  $$renderer3.push("<!--[!-->");
                  $$renderer3.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z"></path><path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z"></path></svg>`);
                }
                $$renderer3.push(`<!--]--></button></div> <div class="mt-2 mb-1 text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Open WebUI uses faster-whisper internally.`))} <a class="hover:underline dark:text-gray-200 text-gray-800" href="https://github.com/SYSTRAN/faster-whisper" target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(`Click here to learn more about faster-whisper and see the available models.`))}</a></div></div>`);
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--></div> <div><div class="mt-0.5 mb-2.5 text-base font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Text-to-Speech"))}</div> <hr class="border-gray-100 dark:border-gray-850 my-2"/> <div class="mb-2 py-0.5 flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Text-to-Speech Engine"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: "dark:bg-gray-900 w-fit pr-8 cursor-pointer rounded-sm px-2 p-1 text-xs bg-transparent outline-hidden text-right",
          value: TTS_ENGINE,
          placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a mode")
        },
        ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Web API"))}`);
          });
          $$renderer4.option({ value: "transformers" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Transformers"))} (${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Local"))})`);
          });
          $$renderer4.option({ value: "openai" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("OpenAI"))}`);
          });
          $$renderer4.option({ value: "elevenlabs" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ElevenLabs"))}`);
          });
          $$renderer4.option({ value: "azure" }, ($$renderer5) => {
            $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Azure AI Speech"))}`);
          });
        }
      );
      $$renderer3.push(`</div></div> `);
      {
        $$renderer3.push("<!--[!-->");
        {
          $$renderer3.push("<!--[!-->");
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!--]--> <div class="mb-2">`);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div><div class="mb-1.5 text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("TTS Voice"))}</div> <div class="flex w-full"><div class="flex-1">`);
        $$renderer3.select(
          {
            class: "w-full rounded-lg py-2 px-4 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden",
            value: TTS_VOICE
          },
          ($$renderer4) => {
            $$renderer4.option({ value: "", selected: TTS_VOICE !== "" }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Default"))}`);
            });
            $$renderer4.push(`<!--[-->`);
            const each_array = ensure_array_like(voices);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let voice = each_array[$$index];
              $$renderer4.option(
                {
                  value: voice.voiceURI,
                  class: "bg-gray-100 dark:bg-gray-700",
                  selected: TTS_VOICE === voice.voiceURI
                },
                ($$renderer5) => {
                  $$renderer5.push(`${escape_html(voice.name)}`);
                }
              );
            }
            $$renderer4.push(`<!--]-->`);
          }
        );
        $$renderer3.push(`</div></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="pt-0.5 flex w-full justify-between"><div class="self-center text-xs font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Response splitting"))}</div> <div class="flex items-center relative">`);
      $$renderer3.select(
        {
          class: "dark:bg-gray-900 w-fit pr-8 cursor-pointer rounded-sm px-2 p-1 text-xs bg-transparent outline-hidden text-right",
          "aria-label": store_get($$store_subs ??= {}, "$i18n", i18n).t("Select how to split message text for TTS requests"),
          value: TTS_SPLIT_ON
        },
        ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array_6 = ensure_array_like(Object.values(TTS_RESPONSE_SPLIT));
          for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
            let split = each_array_6[$$index_6];
            $$renderer4.option({ value: split }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(split.charAt(0).toUpperCase() + split.slice(1)))}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        }
      );
      $$renderer3.push(`</div></div> <div class="mt-2 mb-1 text-xs text-gray-400 dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Control how message text is split for TTS requests. 'Punctuation' splits into sentences, 'paragraphs' splits into paragraphs, and 'none' keeps the message as a single string."))}</div></div></div></div> <div class="flex justify-end text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function Images($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let loading = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden pr-2">`);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function EllipsisVertical($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Interface($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="h-full w-full flex justify-center items-center">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function ModelList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let modelIds = fallback($$props["modelIds"], () => [], true);
    if (modelIds.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-col -translate-x-1"><!--[-->`);
      const each_array = ensure_array_like(modelIds);
      for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
        let modelId = each_array[modelIdx];
        $$renderer2.push(`<div class="flex gap-2 w-full justify-between items-center"${attr("id", `model-item-${stringify(modelId)}`)}>`);
        Tooltip($$renderer2, {
          content: modelId,
          placement: "top-start",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="flex items-center gap-1">`);
            EllipsisVertical($$renderer3, { className: "size-4 cursor-move model-item-handle" });
            $$renderer3.push(`<!----> <div class="text-sm flex-1 py-1 rounded-lg">`);
            if (store_get($$store_subs ??= {}, "$models", models).find((model) => model.id === modelId)) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`${escape_html(store_get($$store_subs ??= {}, "$models", models).find((model) => model.id === modelId).name)}`);
            } else {
              $$renderer3.push("<!--[!-->");
              $$renderer3.push(`${escape_html(modelId)}`);
            }
            $$renderer3.push(`<!--]--></div></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="text-gray-500 text-xs text-center py-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No models found"))}</div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { modelIds });
  });
}
function ModelSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let title = fallback($$props["title"], "");
    let models2 = fallback($$props["models"], () => [], true);
    let modelIds = fallback($$props["modelIds"], () => [], true);
    let selectedModelId = "";
    $$renderer2.push(`<div><div class="flex flex-col w-full"><div class="mb-1 flex justify-between"><div class="text-xs text-gray-500">${escape_html(title)}</div></div> <div class="flex items-center -mr-1">`);
    $$renderer2.select(
      {
        class: `w-full py-1 text-sm rounded-lg bg-transparent ${stringify("text-gray-500")} placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden`,
        value: selectedModelId
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a model"))}`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(models2);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let model = each_array[$$index];
          if (!modelIds.includes(model.id)) {
            $$renderer3.push("<!--[-->");
            $$renderer3.option({ value: model.id, class: "bg-gray-50 dark:bg-gray-700" }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(model.name)}`);
            });
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> `);
    if (modelIds.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-col"><!--[-->`);
      const each_array_1 = ensure_array_like(modelIds);
      for (let modelIdx = 0, $$length = each_array_1.length; modelIdx < $$length; modelIdx++) {
        let modelId = each_array_1[modelIdx];
        $$renderer2.push(`<div class="flex gap-2 w-full justify-between items-center"><div class="text-sm flex-1 py-1 rounded-lg">${escape_html(models2.find((model) => model.id === modelId)?.name)}</div> <div class="shrink-0"><button type="button">`);
        Minus($$renderer2, { strokeWidth: "2", className: "size-3.5" });
        $$renderer2.push(`<!----></button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="text-gray-500 text-xs text-center py-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No models selected"))}</div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { title, models: models2, modelIds });
  });
}
function ArenaModelModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let edit = fallback($$props["edit"], false);
    let model = fallback($$props["model"], null);
    let name = "";
    let id = "";
    const generateId = () => {
      if (!edit) {
        id = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      }
    };
    let profileImageUrl = `${WEBUI_BASE_URL}/favicon.png`;
    let description = "";
    let selectedModelId = "";
    let modelIds = [];
    let filterMode = "include";
    let accessControl = {};
    let loading = false;
    let showDeleteConfirmDialog = false;
    const initModel = () => {
      if (model) {
        name = model.name;
        id = model.id;
        profileImageUrl = model.meta.profile_image_url;
        description = model.meta.description;
        modelIds = model.meta.model_ids || [];
        filterMode = model.meta?.filter_mode ?? "include";
        accessControl = "access_control" in model.meta ? model.meta.access_control : {};
      }
    };
    if (name) {
      generateId();
    }
    if (show) {
      initModel();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center font-primary">`);
          if (edit) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Arena Model"))}`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Arena Model"))}`);
          }
          $$renderer4.push(`<!--]--></div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-4 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="px-1"><div class="flex justify-center pb-3"><input type="file" hidden="" accept="image/*"/> <button class="relative rounded-full w-fit h-fit shrink-0" type="button"><img${attr("src", profileImageUrl)} class="size-16 rounded-full object-cover shrink-0" alt="Profile"/> <div class="absolute flex justify-center rounded-full bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-gray-700 bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-50"><div class="my-auto text-white">`);
          PencilSolid($$renderer4, { className: "size-4" });
          $$renderer4.push(`<!----></div></div></button></div> <div class="flex gap-2"><div class="flex flex-col w-full"><div class="mb-0.5 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Name"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Model Name"))} autocomplete="off" required/></div></div> <div class="flex flex-col w-full"><div class="mb-0.5 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("ID"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", id)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Model ID"))} autocomplete="off" required${attr("disabled", edit, true)}/></div></div></div> <div class="flex flex-col w-full mt-2"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Description"))}</div> <div class="flex-1"><input class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", description)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter description"))} autocomplete="off"/></div></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="my-2 -mx-2"><div class="px-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-3xl">`);
          AccessControl($$renderer4, {
            get accessControl() {
              return accessControl;
            },
            set accessControl($$value) {
              accessControl = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="flex flex-col w-full"><div class="mb-1 flex justify-between"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"))}</div> <div><button class="text-xs text-gray-500" type="button">`);
          if (filterMode === "include") {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Include"))}`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Exclude"))}`);
          }
          $$renderer4.push(`<!--]--></button></div></div> `);
          if (modelIds.length > 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex flex-col"><!--[-->`);
            const each_array = ensure_array_like(modelIds);
            for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
              let modelId = each_array[modelIdx];
              $$renderer4.push(`<div class="flex gap-2 w-full justify-between items-center"><div class="text-sm flex-1 py-1 rounded-lg">${escape_html(store_get($$store_subs ??= {}, "$models", models).find((model2) => model2.id === modelId)?.name)}</div> <div class="shrink-0"><button type="button">`);
              Minus($$renderer4, { strokeWidth: "2", className: "size-3.5" });
              $$renderer4.push(`<!----></button></div></div>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`<div class="text-gray-500 text-xs text-center py-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Leave empty to include all models or select specific models"))}</div>`);
          }
          $$renderer4.push(`<!--]--></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> <div class="flex items-center">`);
          $$renderer4.select(
            {
              class: `w-full py-1 text-sm rounded-lg bg-transparent ${stringify("text-gray-500")} placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden`,
              value: selectedModelId
            },
            ($$renderer5) => {
              $$renderer5.option({ value: "" }, ($$renderer6) => {
                $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a model"))}`);
              });
              $$renderer5.push(`<!--[-->`);
              const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$models", models).filter((m) => m?.owned_by !== "arena"));
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let model2 = each_array_1[$$index_1];
                $$renderer5.option({ value: model2.id, class: "bg-gray-50 dark:bg-gray-700" }, ($$renderer6) => {
                  $$renderer6.push(`${escape_html(model2.name)}`);
                });
              }
              $$renderer5.push(`<!--]-->`);
            }
          );
          $$renderer4.push(` <div><button type="button">`);
          Plus($$renderer4, { className: "size-3.5", strokeWidth: "2" });
          $$renderer4.push(`<!----></button></div></div></div> <div class="flex justify-end pt-3 text-sm font-medium gap-1.5">`);
          if (edit) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<button class="px-3.5 py-1.5 text-sm font-medium dark:bg-black dark:hover:bg-gray-950 dark:text-white bg-white text-black hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</button>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-950 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, edit, model });
  });
}
function ConfigureModelsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let initHandler = fallback($$props["initHandler"], () => {
    });
    let config2 = null;
    let defaultModelIds = [];
    let defaultPinnedModelIds = [];
    let modelIds = [];
    let sortKey = "";
    let sortOrder = "";
    let loading = false;
    let showResetModal = false;
    const init = async () => {
      config2 = await getModelsConfig(localStorage.token);
      if (config2?.DEFAULT_MODELS) {
        defaultModelIds = config2?.DEFAULT_MODELS.split(",").filter((id) => id);
      } else {
        defaultModelIds = [];
      }
      if (config2?.DEFAULT_PINNED_MODELS) {
        defaultPinnedModelIds = config2?.DEFAULT_PINNED_MODELS.split(",").filter((id) => id);
      } else {
        defaultPinnedModelIds = [];
      }
      const modelOrderList = config2.MODEL_ORDER_LIST || [];
      const allModelIds = store_get($$store_subs ??= {}, "$models", models).map((model) => model.id);
      const orderedSet = new Set(modelOrderList);
      modelIds = [
        // Add all IDs from MODEL_ORDER_LIST that exist in allModelIds
        ...modelOrderList.filter((id) => orderedSet.has(id) && allModelIds.includes(id)),
        // Add remaining IDs not in MODEL_ORDER_LIST, sorted alphabetically
        ...allModelIds.filter((id) => !orderedSet.has(id)).sort((a, b) => a.localeCompare(b))
      ];
      sortKey = "";
      sortOrder = "";
    };
    if (show) {
      init();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset All Models"),
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("This will delete all models including custom models and cannot be undone."),
        onConfirm: async () => {
          const res = deleteAllModels(localStorage.token);
          if (res) {
            toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("All models deleted successfully"));
            initHandler();
          }
        },
        get show() {
          return showResetModal;
        },
        set show($$value) {
          showResetModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4 pb-2"><div class="text-lg font-medium self-center font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-5 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6">`);
          if (config2) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<form class="flex flex-col w-full"><div><div class="flex flex-col w-full"><button class="mb-1 flex gap-2" type="button"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Reorder Models"))}</div> `);
            if (sortKey === "model") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<span class="font-normal self-center">`);
              if (sortOrder === "asc") {
                $$renderer4.push("<!--[-->");
                ChevronUp($$renderer4, { className: "size-3" });
              } else {
                $$renderer4.push("<!--[!-->");
                ChevronDown($$renderer4, { className: "size-3" });
              }
              $$renderer4.push(`<!--]--></span>`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<span class="invisible">`);
              ChevronUp($$renderer4, { className: "size-3" });
              $$renderer4.push(`<!----></span>`);
            }
            $$renderer4.push(`<!--]--></button> `);
            ModelList($$renderer4, {
              get modelIds() {
                return modelIds;
              },
              set modelIds($$value) {
                modelIds = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div></div> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> `);
            ModelSelector($$renderer4, {
              title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Default Models"),
              models: store_get($$store_subs ??= {}, "$models", models),
              get modelIds() {
                return defaultModelIds;
              },
              set modelIds($$value) {
                defaultModelIds = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> <hr class="border-gray-100 dark:border-gray-700/10 my-2.5 w-full"/> `);
            ModelSelector($$renderer4, {
              title: store_get($$store_subs ??= {}, "$i18n", i18n).t("Default Pinned Models"),
              models: store_get($$store_subs ??= {}, "$models", models),
              get modelIds() {
                return defaultPinnedModelIds;
              },
              set modelIds($$value) {
                defaultPinnedModelIds = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> <div class="flex justify-between pt-3 text-sm font-medium gap-1.5">`);
            Tooltip($$renderer4, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("This will delete all models including custom models"),
              children: ($$renderer5) => {
                $$renderer5.push(`<button class="px-3.5 py-1.5 text-sm font-medium dark:bg-black dark:hover:bg-gray-950 dark:text-white bg-white text-black hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset All Models"))}</button>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> <button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
            {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--></button></div></form>`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`<div>`);
            Spinner($$renderer4, { className: "size-5" });
            $$renderer4.push(`<!----></div>`);
          }
          $$renderer4.push(`<!--]--></div></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, initHandler });
  });
}
function ManageModelsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "sm",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-4"><div class="text-lg font-medium self-center font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage Models"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-3 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6">`);
          {
            $$renderer4.push("<!--[!-->");
            {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`<div class="py-5">`);
              Spinner($$renderer4, {});
              $$renderer4.push(`<!----></div>`);
            }
            $$renderer4.push(`<!--]-->`);
          }
          $$renderer4.push(`<!--]--></div></div></div>`);
        },
        $$slots: { default: true }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show });
  });
}
function ModelMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let user2 = $$props["user"];
    let model = $$props["model"];
    let exportHandler = $$props["exportHandler"];
    let hideHandler = $$props["hideHandler"];
    let copyLinkHandler = $$props["copyLinkHandler"];
    let cloneHandler = $$props["cloneHandler"];
    let onClose = $$props["onClose"];
    let show = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dropdown($$renderer3, {
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("More"),
            children: ($$renderer5) => {
              $$renderer5.push(`<!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content">`);
            Menu_content($$renderer4, {
              class: "w-full max-w-[170px] rounded-xl p-1 border border-gray-100  dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-sm",
              sideOffset: -2,
              side: "bottom",
              align: "start",
              transition: flyAndScale,
              children: ($$renderer5) => {
                Menu_item($$renderer5, {
                  class: "flex  gap-2  items-center px-3 py-1.5 text-sm  font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md",
                  children: ($$renderer6) => {
                    if (model?.meta?.hidden ?? false) {
                      $$renderer6.push("<!--[-->");
                      $$renderer6.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"></path></svg>`);
                    } else {
                      $$renderer6.push("<!--[!-->");
                      $$renderer6.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path></svg>`);
                    }
                    $$renderer6.push(`<!--]--> <div class="flex items-center">`);
                    if (model?.meta?.hidden ?? false) {
                      $$renderer6.push("<!--[-->");
                      $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Show Model"))}`);
                    } else {
                      $$renderer6.push("<!--[!-->");
                      $$renderer6.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Hide Model"))}`);
                    }
                    $$renderer6.push(`<!--]--></div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex gap-2 items-center px-3 py-1.5 text-sm  font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md",
                  children: ($$renderer6) => {
                    Link($$renderer6, {});
                    $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy Link"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex gap-2 items-center px-3 py-1.5 text-sm  font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md",
                  children: ($$renderer6) => {
                    DocumentDuplicate($$renderer6, {});
                    $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Clone"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex gap-2 items-center px-3 py-1.5 text-sm  font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md",
                  children: ($$renderer6) => {
                    Download($$renderer6, {});
                    $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div>`);
          }
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      user: user2,
      model,
      exportHandler,
      hideHandler,
      copyLinkHandler,
      cloneHandler,
      onClose
    });
  });
}
function Models($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { saveAs } = fileSaver;
    const i18n = getContext("i18n");
    let modelsImportInProgress = false;
    let models$1 = null;
    let workspaceModels = null;
    let baseModels = null;
    let filteredModels = [];
    let showConfigModal = false;
    let showManageModal = false;
    let searchValue = "";
    const init = async () => {
      models$1 = null;
      workspaceModels = await getBaseModels(localStorage.token);
      baseModels = await getModels(localStorage.token, null, true);
      models$1 = baseModels.map((m) => {
        const workspaceModel = workspaceModels.find((wm) => wm.id === m.id);
        if (workspaceModel) {
          return { ...m, ...workspaceModel };
        } else {
          return { ...m, id: m.id, name: m.name, is_active: true };
        }
      });
    };
    const upsertModelHandler = async (model) => {
      model.base_model_id = null;
      if (workspaceModels.find((m) => m.id === model.id)) {
        const res = await updateModelById(localStorage.token, model.id, model).catch((error) => {
          return null;
        });
        if (res) {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model updated successfully"));
        }
      } else {
        const res = await createNewModel(localStorage.token, {
          meta: {},
          id: model.id,
          name: model.name,
          base_model_id: null,
          params: {},
          access_control: {},
          ...model
        }).catch((error) => {
          return null;
        });
        if (res) {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Model updated successfully"));
        }
      }
      await init();
      models.set(await getModels(localStorage.token, store_get($$store_subs ??= {}, "$config", config)?.features?.enable_direct_connections && (store_get($$store_subs ??= {}, "$settings", settings)?.directConnections ?? null)));
    };
    const hideModelHandler = async (model) => {
      model.meta = { ...model.meta, hidden: !(model?.meta?.hidden ?? false) };
      /* @__PURE__ */ console.debug(model);
      toast.success(model.meta.hidden ? store_get($$store_subs ??= {}, "$i18n", i18n).t(`Model {{name}} is now hidden`, { name: model.id }) : store_get($$store_subs ??= {}, "$i18n", i18n).t(`Model {{name}} is now visible`, { name: model.id }));
      upsertModelHandler(model);
    };
    const copyLinkHandler = async (model) => {
      const baseUrl = window.location.origin;
      const res = await copyToClipboard(`${baseUrl}/?model=${encodeURIComponent(model.id)}`);
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copied link to clipboard"));
      } else {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to copy link"));
      }
    };
    const cloneHandler = async (model) => {
      sessionStorage.model = JSON.stringify({
        ...model,
        base_model_id: model.id,
        id: `${model.id}-clone`,
        name: `${model.name} (Clone)`
      });
      goto();
    };
    const exportModelHandler = async (model) => {
      let blob = new Blob([JSON.stringify([model])], { type: "application/json" });
      saveAs(blob, `${model.id}-${Date.now()}.json`);
    };
    if (models$1) {
      filteredModels = models$1.filter((m) => searchValue === "").sort((a, b) => {
        return (a?.name ?? a?.id ?? "").localeCompare(b?.name ?? b?.id ?? "");
      });
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfigureModelsModal($$renderer3, {
        initHandler: init,
        get show() {
          return showConfigModal;
        },
        set show($$value) {
          showConfigModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ManageModelsModal($$renderer3, {
        get show() {
          return showManageModal;
        },
        set show($$value) {
          showManageModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (models$1 !== null) {
        $$renderer3.push("<!--[-->");
        {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="flex flex-col gap-1 mt-1.5 mb-2"><div class="flex justify-between items-center"><div class="flex items-center md:self-center text-xl font-medium px-0.5 gap-2">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"))} <span class="text-lg font-medium text-gray-500 dark:text-gray-300">${escape_html(filteredModels.length)}</span></div> <div class="flex items-center gap-1.5">`);
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage Models"),
            children: ($$renderer4) => {
              $$renderer4.push(`<button class="p-1 rounded-full flex gap-1 items-center" type="button">`);
              Download($$renderer4, {});
              $$renderer4.push(`<!----></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings"),
            children: ($$renderer4) => {
              $$renderer4.push(`<button class="p-1 rounded-full flex gap-1 items-center" type="button">`);
              Cog6($$renderer4, {});
              $$renderer4.push(`<!----></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div></div> <div class="flex flex-1 items-center w-full space-x-2"><div class="flex flex-1 items-center"><div class="self-center ml-1 mr-3">`);
          Search($$renderer3, { className: "size-3.5" });
          $$renderer3.push(`<!----></div> <input class="w-full text-sm py-1 rounded-r-xl outline-hidden bg-transparent"${attr("value", searchValue)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search Models"))}/> `);
          {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div></div></div> <div class="my-2 mb-5" id="model-list">`);
          if (models$1.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<!--[-->`);
            const each_array = ensure_array_like(filteredModels);
            for (let modelIdx = 0, $$length = each_array.length; modelIdx < $$length; modelIdx++) {
              let model = each_array[modelIdx];
              $$renderer3.push(`<div${attr_class(` flex space-x-4 cursor-pointer w-full px-3 py-2 dark:hover:bg-white/5 hover:bg-black/5 rounded-lg transition ${stringify(model?.meta?.hidden ? "opacity-50 dark:opacity-50" : "")}`)}${attr("id", `model-item-${stringify(model.id)}`)}><button class="flex flex-1 text-left space-x-3.5 cursor-pointer w-full" type="button"><div class="self-center w-8"><div${attr_class(` rounded-full object-cover ${stringify(model?.is_active ?? true ? "" : "opacity-50 dark:opacity-50")} `)}><img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${model.id}`)} alt="modelfile profile" class="rounded-full w-full h-auto object-cover"/></div></div> <div${attr_class(` flex-1 self-center ${stringify(model?.is_active ?? true ? "" : "text-gray-500")}`)}>`);
              Tooltip($$renderer3, {
                content: marked.parse(!!model?.meta?.description ? model?.meta?.description : model?.ollama?.digest ? `${model?.ollama?.digest} **(${model?.ollama?.modified_at})**` : model.id),
                className: " w-fit",
                placement: "top-start",
                children: ($$renderer4) => {
                  $$renderer4.push(`<div class="font-semibold line-clamp-1">${escape_html(model.name)}</div>`);
                },
                $$slots: { default: true }
              });
              $$renderer3.push(`<!----> <div class="text-xs overflow-hidden text-ellipsis line-clamp-1 text-gray-500"><span class="line-clamp-1">${escape_html(!!model?.meta?.description ? model?.meta?.description : model?.ollama?.digest ? `${model.id} (${model?.ollama?.digest})` : model.id)}</span></div></div></button> <div class="flex flex-row gap-0.5 items-center self-center">`);
              {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<button class="self-center w-fit text-sm px-2 py-2 dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl" type="button"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"></path></svg></button> `);
                ModelMenu($$renderer3, {
                  user: store_get($$store_subs ??= {}, "$user", user),
                  model,
                  exportHandler: () => {
                    exportModelHandler(model);
                  },
                  hideHandler: () => {
                    hideModelHandler(model);
                  },
                  copyLinkHandler: () => {
                    copyLinkHandler(model);
                  },
                  cloneHandler: () => {
                    cloneHandler(model);
                  },
                  onClose: () => {
                  },
                  children: ($$renderer4) => {
                    $$renderer4.push(`<button class="self-center w-fit text-sm p-1.5 dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl" type="button">`);
                    EllipsisHorizontal($$renderer4, { className: "size-5" });
                    $$renderer4.push(`<!----></button>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer3.push(`<!----> <div class="ml-1">`);
                Tooltip($$renderer3, {
                  content: model?.is_active ?? true ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled"),
                  children: ($$renderer4) => {
                    Switch_1($$renderer4, {
                      get state() {
                        return model.is_active;
                      },
                      set state($$value) {
                        model.is_active = $$value;
                        $$settled = false;
                      }
                    });
                  },
                  $$slots: { default: true }
                });
                $$renderer3.push(`<!----></div>`);
              }
              $$renderer3.push(`<!--]--></div></div>`);
            }
            $$renderer3.push(`<!--]-->`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div class="flex flex-col items-center justify-center w-full h-20"><div class="text-gray-500 dark:text-gray-400 text-xs">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No models found"))}</div></div>`);
          }
          $$renderer3.push(`<!--]--></div> `);
          if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex justify-end w-full mb-3"><div class="flex space-x-1"><input id="models-import-input" type="file" accept=".json" hidden=""/> <button class="flex text-xs items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition"${attr("disabled", modelsImportInProgress, true)}>`);
            {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]--> <div class="self-center mr-2 font-medium line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Import Presets"))}</div> <div class="self-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm4 9.5a.75.75 0 0 1-.75-.75V8.06l-.72.72a.75.75 0 0 1-1.06-1.06l2-2a.75.75 0 0 1 1.06 0l2 2a.75.75 0 1 1-1.06 1.06l-.72-.72v2.69a.75.75 0 0 1-.75.75Z" clip-rule="evenodd"></path></svg></div></button> <button class="flex text-xs items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 transition"><div class="self-center mr-2 font-medium line-clamp-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export Presets"))} (${escape_html(models$1.length)})</div> <div class="self-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5"><path fill-rule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm4 3.5a.75.75 0 0 1 .75.75v2.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 1.06-1.06l.72.72V6.25A.75.75 0 0 1 8 5.5Z" clip-rule="evenodd"></path></svg></div></button></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="h-full w-full flex justify-center items-center">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Connections($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let OLLAMA_BASE_URLS = [""];
    let OLLAMA_API_CONFIGS = {};
    let OPENAI_API_KEYS = [""];
    let OPENAI_API_BASE_URLS = [""];
    let OPENAI_API_CONFIGS = {};
    let showAddOpenAIConnectionModal = false;
    let showAddOllamaConnectionModal = false;
    const updateOpenAIHandler = async () => {
    };
    const updateOllamaHandler = async () => {
    };
    const addOpenAIConnectionHandler = async (connection) => {
      OPENAI_API_BASE_URLS = [...OPENAI_API_BASE_URLS, connection.url];
      OPENAI_API_KEYS = [...OPENAI_API_KEYS, connection.key];
      OPENAI_API_CONFIGS[OPENAI_API_BASE_URLS.length - 1] = connection.config;
      await updateOpenAIHandler();
    };
    const addOllamaConnectionHandler = async (connection) => {
      OLLAMA_BASE_URLS = [...OLLAMA_BASE_URLS, connection.url];
      OLLAMA_API_CONFIGS[OLLAMA_BASE_URLS.length - 1] = { ...connection.config, key: connection.key };
      await updateOllamaHandler();
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AddConnectionModal($$renderer3, {
        onSubmit: addOpenAIConnectionHandler,
        get show() {
          return showAddOpenAIConnectionModal;
        },
        set show($$value) {
          showAddOpenAIConnectionModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      AddConnectionModal($$renderer3, {
        ollama: true,
        onSubmit: addOllamaConnectionHandler,
        get show() {
          return showAddOllamaConnectionModal;
        },
        set show($$value) {
          showAddOllamaConnectionModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="flex h-full justify-center"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Documents($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let showResetConfirm = false;
    let showResetUploadDirConfirm = false;
    let showReindexConfirm = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        get show() {
          return showResetUploadDirConfirm;
        },
        set show($$value) {
          showResetUploadDirConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        get show() {
          return showResetConfirm;
        },
        set show($$value) {
          showResetConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        get show() {
          return showReindexConfirm;
        },
        set show($$value) {
          showReindexConfirm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between space-y-3 text-sm">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="flex items-center justify-center h-full">`);
        Spinner($$renderer3, { className: "size-5" });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]--></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function WebSearch($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function DocumentChartBar($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"${attr_class(clsx(className))}><path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM9.75 17.25a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-.75Zm2.25-3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-5.25Z" clip-rule="evenodd"></path><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Evaluations($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let showAddModel = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ArenaModelModal($$renderer3, {
        get show() {
          return showAddModel;
        },
        set show($$value) {
          showAddModel = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="flex h-full justify-center"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function CodeExecution($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveHandler = $$props["saveHandler"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<form class="flex flex-col h-full justify-between space-y-3 text-sm"><div class="space-y-3 overflow-y-scroll scrollbar-hidden h-full">`);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveHandler });
  });
}
function Tools($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let saveSettings = $$props["saveSettings"];
    let servers = null;
    let showConnectionModal = false;
    const addConnectionHandler = async (server) => {
      servers = [...servers, server];
      await updateHandler();
    };
    const updateHandler = async () => {
      const res = await setToolServerConnections(localStorage.token, { TOOL_SERVER_CONNECTIONS: servers }).catch((err) => {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to save connections"));
        return null;
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connections saved successfully"));
      }
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AddToolServerModal($$renderer3, {
        onSubmit: addConnectionHandler,
        get show() {
          return showConnectionModal;
        },
        set show($$value) {
          showConnectionModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <form class="flex flex-col h-full justify-between text-sm"><div class="overflow-y-scroll scrollbar-hidden h-full">`);
      if (servers !== null) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div><div class="mb-3"><div class="mt-0.5 mb-2.5 text-base font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("General"))}</div> <hr class="border-gray-100 dark:border-gray-850 my-2"/> <div class="mb-2.5 flex flex-col w-full justify-between"><div class="flex justify-between items-center mb-0.5"><div class="font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Manage Tool Servers"))}</div> `);
        Tooltip($$renderer3, {
          content: store_get($$store_subs ??= {}, "$i18n", i18n).t(`Add Connection`),
          children: ($$renderer4) => {
            $$renderer4.push(`<button class="px-1" type="button">`);
            Plus($$renderer4, {});
            $$renderer4.push(`<!----></button>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div> <div class="flex flex-col gap-1"><!--[-->`);
        const each_array = ensure_array_like(servers);
        for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
          let server = each_array[idx];
          Connection($$renderer3, {
            onSubmit: () => {
              updateHandler();
            },
            onDelete: () => {
              servers = servers.filter((_, i) => i !== idx);
              updateHandler();
            },
            get connection() {
              return server;
            },
            set connection($$value) {
              server = $$value;
              $$settled = false;
            }
          });
        }
        $$renderer3.push(`<!--]--></div> <div class="my-1.5"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connect to your own OpenAPI compatible external tool servers."))}</div></div></div></div></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="flex h-full justify-center"><div class="my-auto">`);
        Spinner($$renderer3, { className: "size-6" });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="flex justify-end pt-3 text-sm font-medium"><button class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button></div></form>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { saveSettings });
  });
}
function Settings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let selectedTab = "general";
    const scrollToTab = (tabId) => {
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    };
    {
      const pathParts = store_get($$store_subs ??= {}, "$page", page).url.pathname.split("/");
      const tabFromPath = pathParts[pathParts.length - 1];
      selectedTab = [
        "general",
        "connections",
        "models",
        "evaluations",
        "tools",
        "documents",
        "web",
        "code-execution",
        "interface",
        "audio",
        "images",
        "pipelines",
        "db"
      ].includes(tabFromPath) ? tabFromPath : "general";
    }
    if (selectedTab) {
      scrollToTab(selectedTab);
    }
    $$renderer2.push(`<div class="flex flex-col lg:flex-row w-full h-full pb-2 lg:space-x-4"><div id="admin-settings-tabs-container" class="tabs mx-[16px] lg:mx-0 lg:px-[16px] flex flex-row overflow-x-auto gap-2.5 max-w-full lg:gap-1 lg:flex-col lg:flex-none lg:w-50 dark:text-gray-200 text-sm font-medium text-left scrollbar-none"><button id="general"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 lg:flex-none flex text-right transition ${stringify(
      // Adjust horizontal scroll position based on vertical scroll
      // Scroll to the selected tab on mount
      selectedTab === "general" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white"
    )}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-1.081a.5.5 0 0 1 .67.033l.774.775a.5.5 0 0 1 .034.67l-1.08 1.32c.25.417.44.873.561 1.357l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l1.082 1.322a.5.5 0 0 1-.034.67l-.774.774a.5.5 0 0 1-.67.033l-1.322-1.08c-.416.25-.872.44-1.356.561l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562L4.108 13.37a.5.5 0 0 1-.67-.033l-.774-.775a.5.5 0 0 1-.034-.67l1.08-1.32a4.971 4.971 0 0 1-.561-1.357l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356L2.629 4.107a.5.5 0 0 1 .034-.67l.774-.774a.5.5 0 0 1 .67-.033L5.43 3.71a4.97 4.97 0 0 1 1.356-.561l.17-1.699ZM6 8c0 .538.212 1.026.558 1.385l.057.057a2 2 0 0 0 2.828-2.828l-.058-.056A2 2 0 0 0 6 8Z" clip-rule="evenodd"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("General"))}</div></button> <button id="connections"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "connections" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M1 9.5A3.5 3.5 0 0 0 4.5 13H12a3 3 0 0 0 .917-5.857 2.503 2.503 0 0 0-3.198-3.019 3.5 3.5 0 0 0-6.628 2.171A3.5 3.5 0 0 0 1 9.5Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Connections"))}</div></button> <button id="models"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "models" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 1c3.866 0 7 1.79 7 4s-3.134 4-7 4-7-1.79-7-4 3.134-4 7-4zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.21-3.134 4-7 4s-7-1.79-7-4V8.178c.396.37.842.688 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37zM3 13.179V15c0 2.21 3.134 4 7 4s7-1.79 7-4v-1.822c-.396.37-.842.688-1.306.953-1.532.875-3.548 1.369-5.694 1.369s-4.162-.494-5.694-1.37A7.009 7.009 0 013 13.179z" clip-rule="evenodd"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"))}</div></button> <button id="evaluations"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "evaluations" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2">`);
    DocumentChartBar($$renderer2, {});
    $$renderer2.push(`<!----></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Evaluations"))}</div></button> <button id="tools"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "tools" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clip-rule="evenodd"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("External Tools"))}</div></button> <button id="documents"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "documents" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M11.625 16.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z"></path><path fill-rule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 0 0 1.06-1.06l-1.047-1.048A3.375 3.375 0 1 0 11.625 18Z" clip-rule="evenodd"></path><path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Documents"))}</div></button> <button id="web"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "web" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Web Search"))}</div></button> <button id="code-execution"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "code-execution" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2.22 1.97a.75.75 0 0 0 0 1.06l.97.97-.97.97a.75.75 0 1 0 1.06 1.06l1.5-1.5a.75.75 0 0 0 0-1.06l-1.5-1.5a.75.75 0 0 0-1.06 0ZM8.75 8.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clip-rule="evenodd"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Code Execution"))}</div></button> <button id="interface"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "interface" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h7.5A2.25 2.25 0 0 1 14 4.25v5.5A2.25 2.25 0 0 1 11.75 12h-1.312c.1.128.21.248.328.36a.75.75 0 0 1 .234.545v.345a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.345a.75.75 0 0 1 .234-.545c.118-.111.228-.232.328-.36H4.25A2.25 2.25 0 0 1 2 9.75v-5.5Zm2.25-.75a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-7.5Z" clip-rule="evenodd"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Interface"))}</div></button> <button id="audio"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "audio" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M7.557 2.066A.75.75 0 0 1 8 2.75v10.5a.75.75 0 0 1-1.248.56L3.59 11H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.59l3.162-2.81a.75.75 0 0 1 .805-.124ZM12.95 3.05a.75.75 0 1 0-1.06 1.06 5.5 5.5 0 0 1 0 7.78.75.75 0 1 0 1.06 1.06 7 7 0 0 0 0-9.9Z"></path><path d="M10.828 5.172a.75.75 0 1 0-1.06 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 1 0 1.06 1.06 4 4 0 0 0 0-5.656Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Audio"))}</div></button> <button id="images"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "images" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0L9.354 9.646a.5.5 0 0 1-.708 0L6.354 7.354a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0-.146.353V12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V9.707ZM12 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clip-rule="evenodd"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Images"))}</div></button> <button id="pipelines"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "pipelines" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4"><path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z"></path><path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z"></path><path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Pipelines"))}</div></button> <button id="db"${attr_class(`px-0.5 py-1 min-w-fit rounded-lg flex-1 md:flex-none flex text-left transition ${stringify(selectedTab === "db" ? "" : " text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")}`)}><div class="self-center mr-2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M8 7c3.314 0 6-1.343 6-3s-2.686-3-6-3-6 1.343-6 3 2.686 3 6 3Z"></path><path d="M8 8.5c1.84 0 3.579-.37 4.914-1.037A6.33 6.33 0 0 0 14 6.78V8c0 1.657-2.686 3-6 3S2 9.657 2 8V6.78c.346.273.72.5 1.087.683C4.42 8.131 6.16 8.5 8 8.5Z"></path><path d="M8 12.5c1.84 0 3.579-.37 4.914-1.037.366-.183.74-.41 1.086-.684V12c0 1.657-2.686 3-6 3s-6-1.343-6-3v-1.22c.346.273.72.5 1.087.683C4.42 12.131 6.16 12.5 8 12.5Z"></path></svg></div> <div class="self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Database"))}</div></button></div> <div class="flex-1 mt-3 lg:mt-0 px-[16px] lg:pr-[16px] lg:pl-0 overflow-y-scroll scrollbar-hidden">`);
    if (selectedTab === "general") {
      $$renderer2.push("<!--[-->");
      General($$renderer2, {
        saveHandler: async () => {
          toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
          await tick();
          await config.set(await getBackendConfig());
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      if (selectedTab === "connections") {
        $$renderer2.push("<!--[-->");
        Connections($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
        if (selectedTab === "models") {
          $$renderer2.push("<!--[-->");
          Models($$renderer2);
        } else {
          $$renderer2.push("<!--[!-->");
          if (selectedTab === "evaluations") {
            $$renderer2.push("<!--[-->");
            Evaluations($$renderer2);
          } else {
            $$renderer2.push("<!--[!-->");
            if (selectedTab === "tools") {
              $$renderer2.push("<!--[-->");
              Tools($$renderer2, {});
            } else {
              $$renderer2.push("<!--[!-->");
              if (selectedTab === "documents") {
                $$renderer2.push("<!--[-->");
                Documents($$renderer2);
              } else {
                $$renderer2.push("<!--[!-->");
                if (selectedTab === "web") {
                  $$renderer2.push("<!--[-->");
                  WebSearch($$renderer2, {
                    saveHandler: async () => {
                      toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
                      await tick();
                      await config.set(await getBackendConfig());
                    }
                  });
                } else {
                  $$renderer2.push("<!--[!-->");
                  if (selectedTab === "code-execution") {
                    $$renderer2.push("<!--[-->");
                    CodeExecution($$renderer2, {
                      saveHandler: async () => {
                        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
                        await tick();
                        await config.set(await getBackendConfig());
                      }
                    });
                  } else {
                    $$renderer2.push("<!--[!-->");
                    if (selectedTab === "interface") {
                      $$renderer2.push("<!--[-->");
                      Interface($$renderer2);
                    } else {
                      $$renderer2.push("<!--[!-->");
                      if (selectedTab === "audio") {
                        $$renderer2.push("<!--[-->");
                        Audio($$renderer2, {
                          saveHandler: () => {
                            toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
                          }
                        });
                      } else {
                        $$renderer2.push("<!--[!-->");
                        if (selectedTab === "images") {
                          $$renderer2.push("<!--[-->");
                          Images($$renderer2);
                        } else {
                          $$renderer2.push("<!--[!-->");
                          if (selectedTab === "db") {
                            $$renderer2.push("<!--[-->");
                            Database($$renderer2, {
                              saveHandler: () => {
                                toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
                              }
                            });
                          } else {
                            $$renderer2.push("<!--[!-->");
                            if (selectedTab === "pipelines") {
                              $$renderer2.push("<!--[-->");
                              Pipelines($$renderer2, {
                                saveHandler: () => {
                                  toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings saved successfully!"));
                                }
                              });
                            } else {
                              $$renderer2.push("<!--[!-->");
                            }
                            $$renderer2.push(`<!--]-->`);
                          }
                          $$renderer2.push(`<!--]-->`);
                        }
                        $$renderer2.push(`<!--]-->`);
                      }
                      $$renderer2.push(`<!--]-->`);
                    }
                    $$renderer2.push(`<!--]-->`);
                  }
                  $$renderer2.push(`<!--]-->`);
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  Settings as S
};
//# sourceMappingURL=Settings.js.map
