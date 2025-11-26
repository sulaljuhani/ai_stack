import { b as bind_props, j as escape_html, s as store_get, u as unsubscribe_stores, a as attr, c as attr_class, d as clsx, o as stringify } from "../../../../../../chunks/index.js";
import { Z as getContext, Y as fallback } from "../../../../../../chunks/context.js";
import { a as toast } from "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "clsx";
import { g as goto } from "../../../../../../chunks/client.js";
import { u as user, P as prompts } from "../../../../../../chunks/index2.js";
import { a as WEBUI_API_BASE_URL } from "../../../../../../chunks/constants.js";
import { T as Textarea } from "../../../../../../chunks/Textarea.js";
import { T as Tooltip } from "../../../../../../chunks/Tooltip.js";
import { M as Modal } from "../../../../../../chunks/Modal.js";
import { A as AccessControl } from "../../../../../../chunks/AccessControl.js";
import { X as XMark } from "../../../../../../chunks/XMark.js";
import "../../../../../../chunks/index4.js";
const createNewPrompt = async (token, prompt) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/prompts/create`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...prompt,
      command: `/${prompt.command}`
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
const getPrompts = async (token = "") => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/prompts/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
function AccessControlModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let accessControl = fallback($$props["accessControl"], () => ({}), true);
    let accessRoles = fallback($$props["accessRoles"], () => ["read"], true);
    let share = fallback($$props["share"], true);
    let sharePublic = fallback($$props["sharePublic"], true);
    let onChange = fallback($$props["onChange"], () => {
    });
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
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-100 px-5 pt-3 pb-1"><div class="text-lg font-medium self-center font-primary">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access Control"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="w-full px-5 pb-4 dark:text-white">`);
          AccessControl($$renderer4, {
            onChange,
            accessRoles,
            share,
            sharePublic,
            get accessControl() {
              return accessControl;
            },
            set accessControl($$value) {
              accessControl = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div>`);
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
    bind_props($$props, {
      show,
      accessControl,
      accessRoles,
      share,
      sharePublic,
      onChange
    });
  });
}
function LockClosed($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function PromptEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let onSubmit = $$props["onSubmit"];
    let edit = fallback($$props["edit"], false);
    let prompt = fallback($$props["prompt"], null);
    let clone = fallback($$props["clone"], false);
    const i18n = getContext("i18n");
    let loading = false;
    let title = "";
    let command = "";
    let content = "";
    let accessControl = {};
    let showAccessControlModal = false;
    let hasManualEdit = false;
    if (!edit && !hasManualEdit) {
      command = "";
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      AccessControlModal($$renderer3, {
        accessRoles: ["read", "write"],
        share: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.prompts || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        sharePublic: store_get($$store_subs ??= {}, "$user", user)?.permissions?.sharing?.public_prompts || store_get($$store_subs ??= {}, "$user", user)?.role === "admin",
        get show() {
          return showAccessControlModal;
        },
        set show($$value) {
          showAccessControlModal = $$value;
          $$settled = false;
        },
        get accessControl() {
          return accessControl;
        },
        set accessControl($$value) {
          accessControl = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="w-full max-h-full flex justify-center"><form class="flex flex-col w-full mb-10"><div class="my-2">`);
      Tooltip($$renderer3, {
        content: `${store_get($$store_subs ??= {}, "$i18n", i18n).t("Only alphanumeric characters and hyphens are allowed")} - ${store_get($$store_subs ??= {}, "$i18n", i18n).t('Activate this command by typing "/{{COMMAND}}" to chat input.', { COMMAND: command })}`,
        placement: "bottom-start",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex flex-col w-full"><div class="flex items-center"><input class="text-2xl font-medium w-full bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Title"))}${attr("value", title)} required/> <div class="self-center shrink-0"><button class="bg-gray-50 hover:bg-gray-100 text-black dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white transition px-2 py-1 rounded-full flex gap-1 items-center" type="button">`);
          LockClosed($$renderer4, { strokeWidth: "2.5", className: "size-3.5" });
          $$renderer4.push(`<!----> <div class="text-sm font-medium shrink-0">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Access"))}</div></button></div></div> <div class="flex gap-0.5 items-center text-xs text-gray-500"><div>/</div> <input class="w-full bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Command"))}${attr("value", command)} required${attr("disabled", edit, true)}/></div></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="my-2"><div class="flex w-full justify-between"><div class="self-center text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt Content"))}</div></div> <div class="mt-2"><div>`);
      Textarea($$renderer3, {
        className: "text-sm w-full bg-transparent outline-hidden overflow-y-hidden resize-none",
        placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write a summary in 50 words that summarizes {{topic}}."),
        rows: 6,
        required: true,
        get value() {
          return content;
        },
        set value($$value) {
          content = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="text-xs text-gray-400 dark:text-gray-500">ⓘ ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Format your variables using brackets like this:"))} <span class="text-gray-600 dark:text-gray-300 font-medium">{{${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("variable"))}}}</span>.
					${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Make sure to enclose them with"))} <span class="text-gray-600 dark:text-gray-300 font-medium">{{</span> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("and"))} <span class="text-gray-600 dark:text-gray-300 font-medium">}}</span>.</div> <div class="text-xs text-gray-400 dark:text-gray-500 underline"><a href="https://docs.openwebui.com/features/workspace/prompts" target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("To learn more about powerful prompt variables, click here"))}</a></div></div></div> <div class="my-4 flex justify-end pb-20"><button${attr_class(` text-sm w-full lg:w-fit px-4 py-2 transition rounded-xl ${stringify("bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black")} flex w-full justify-center`)} type="submit"${attr("disabled", loading, true)}><div class="self-center font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save & Create"))}</div> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></button></div></form></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onSubmit, edit, prompt, clone });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let prompt = null;
    let clone = false;
    const onSubmit = async (_prompt) => {
      const res = await createNewPrompt(localStorage.token, _prompt).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompt created successfully"));
        await prompts.set(await getPrompts(localStorage.token));
        await goto();
      }
    };
    $$renderer2.push(`<!---->`);
    {
      PromptEditor($$renderer2, { prompt, onSubmit, clone });
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
