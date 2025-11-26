import { a as attr, c as attr_class, d as clsx, b as bind_props, s as store_get, j as escape_html, e as ensure_array_like, u as unsubscribe_stores, p as store_set, h as slot, o as stringify } from "./index.js";
import "dequal";
import "./create.js";
import { Y as fallback, Z as getContext } from "./context.js";
import "clsx";
import { c as Menu, d as Menu_trigger, M as Menu_content, a as Menu_item } from "./menu-trigger.js";
import "./client.js";
import { j as getUsage } from "./index7.js";
import { W as WEBUI_BASE_URL } from "./constants.js";
import { h as settings, L as showShortcuts, u as user, M as shortCodesToEmojis } from "./index2.js";
import { T as Tooltip } from "./Tooltip.js";
import { M as Modal } from "./Modal.js";
import { X as XMark } from "./XMark.js";
/* empty css                                             */
const linear = (x) => x;
function fade(node, { delay = 0, duration = 400, easing = linear } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function ArchiveBox($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "2.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor" aria-hidden="true"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function QuestionMarkCircle($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor" aria-hidden="true"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Map$1($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Keyboard($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", strokeWidth)}${attr_class(clsx(className))}><path d="M3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19Z"></path><path d="M8 14L12 10L16 14" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
const shortcuts = {
  //Chat
  [
    "newChat"
    /* NEW_CHAT */
  ]: {
    name: "New Chat",
    keys: ["mod", "shift", "O"],
    category: "Chat"
  },
  [
    "newTemporaryChat"
    /* NEW_TEMPORARY_CHAT */
  ]: {
    name: "New Temporary Chat",
    keys: ["mod", "shift", `'`],
    category: "Chat"
  },
  [
    "deleteChat"
    /* DELETE_CHAT */
  ]: {
    name: "Delete Chat",
    keys: ["mod", "shift", "Backspace", "Delete"],
    category: "Chat"
  },
  //Global
  [
    "search"
    /* SEARCH */
  ]: {
    name: "Search",
    keys: ["mod", "K"],
    category: "Global"
  },
  [
    "openSettings"
    /* OPEN_SETTINGS */
  ]: {
    name: "Open Settings",
    keys: ["mod", "."],
    category: "Global"
  },
  [
    "showShortcuts"
    /* SHOW_SHORTCUTS */
  ]: {
    name: "Show Shortcuts",
    keys: ["mod", "/"],
    category: "Global"
  },
  [
    "toggleSidebar"
    /* TOGGLE_SIDEBAR */
  ]: {
    name: "Toggle Sidebar",
    keys: ["mod", "shift", "S"],
    category: "Global"
  },
  [
    "closeModal"
    /* CLOSE_MODAL */
  ]: {
    name: "Close Modal",
    keys: ["Escape"],
    category: "Global"
  },
  //Input
  [
    "focusInput"
    /* FOCUS_INPUT */
  ]: {
    name: "Focus Chat Input",
    keys: ["shift", "Escape"],
    category: "Input"
  },
  [
    "acceptAutocomplete"
    /* ACCEPT_AUTOCOMPLETE */
  ]: {
    name: "Accept Autocomplete Generation\nJump to Prompt Variable",
    keys: ["Tab"],
    category: "Input"
  },
  [
    "preventFileCreation"
    /* PREVENT_FILE_CREATION */
  ]: {
    name: "Prevent File Creation",
    keys: ["mod", "shift", "V"],
    category: "Input",
    tooltip: 'Only active when "Paste Large Text as File" setting is toggled on.'
  },
  [
    "attachFile"
    /* ATTACH_FILE */
  ]: {
    name: "Attach File From Knowledge",
    keys: ["#"],
    category: "Input"
  },
  [
    "addPrompt"
    /* ADD_PROMPT */
  ]: {
    name: "Add Custom Prompt",
    keys: ["/"],
    category: "Input"
  },
  [
    "talkToModel"
    /* TALK_TO_MODEL */
  ]: {
    name: "Talk to Model",
    keys: ["@"],
    category: "Input"
  },
  //Message
  [
    "generateMessagePair"
    /* GENERATE_MESSAGE_PAIR */
  ]: {
    name: "Generate Message Pair",
    keys: ["mod", "shift", "Enter"],
    category: "Message",
    tooltip: "Only active when the chat input is in focus."
  },
  [
    "regenerateResponse"
    /* REGENERATE_RESPONSE */
  ]: {
    name: "Regenerate Response",
    keys: ["mod", "R"],
    category: "Message"
  },
  [
    "stopGenerating"
    /* STOP_GENERATING */
  ]: {
    name: "Stop Generating",
    keys: ["Escape"],
    category: "Message",
    tooltip: "Only active when the chat input is in focus and an LLM is generating a response."
  },
  [
    "navigatePromptHistoryUp"
    /* NAVIGATE_PROMPT_HISTORY_UP */
  ]: {
    name: "Edit Last Message",
    keys: ["ArrowUp"],
    category: "Message",
    tooltip: "Only can be triggered when the chat input is in focus."
  },
  [
    "copyLastResponse"
    /* COPY_LAST_RESPONSE */
  ]: {
    name: "Copy Last Response",
    keys: ["mod", "shift", "C"],
    category: "Message"
  },
  [
    "copyLastCodeBlock"
    /* COPY_LAST_CODE_BLOCK */
  ]: {
    name: "Copy Last Code Block",
    keys: ["mod", "shift", ";"],
    category: "Message"
  }
};
function ShortcutItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let shortcut = $$props["shortcut"];
    let isMac = $$props["isMac"];
    const i18n = getContext("i18n");
    function formatKey(key) {
      switch (key) {
        case "mod":
          return isMac ? "⌘" : "Ctrl";
        case "shift":
          return isMac ? "⇧" : "Shift";
        case "alt":
          return isMac ? "⌥" : "Alt";
      }
      const lowerKey = key.toLowerCase();
      switch (lowerKey) {
        case "backspace":
        case "delete":
          return isMac ? "⌫" : "Delete";
        case "escape":
          return "Esc";
        case "enter":
          return isMac ? "↩" : "Enter";
        case "tab":
          return isMac ? "⇥" : "Tab";
        case "arrowup":
          return "↑";
        case "arrowdown":
          return "↓";
        case "quote":
          return "'";
        case "period":
          return ".";
        case "slash":
          return "/";
        case "semicolon":
          return ";";
        default:
          if (lowerKey.startsWith("key") || lowerKey.startsWith("digit")) {
            return key.slice(-1).toUpperCase();
          }
          return key.toUpperCase();
      }
    }
    $$renderer2.push(`<div class="w-full flex justify-between"><div class="text-sm whitespace-pre-line">`);
    if (shortcut.tooltip) {
      $$renderer2.push("<!--[-->");
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t(shortcut.tooltip),
        children: ($$renderer3) => {
          $$renderer3.push(`<span class="whitespace-nowrap">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(shortcut.name))}<span class="text-xs"> *</span></span>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(shortcut.name))}`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex-shrink-0 flex justify-end self-start h-full space-x-1 text-xs"><!--[-->`);
    const each_array = ensure_array_like(shortcut.keys.filter((key) => !(key.toLowerCase() === "delete" && shortcut.keys.includes("Backspace"))));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let key = each_array[$$index];
      $$renderer2.push(`<div class="h-fit px-1 py-0.5 flex items-start justify-center rounded-sm border border-black/10 capitalize text-gray-600 dark:border-white/10 dark:text-gray-300">${escape_html(formatKey(key))}</div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { shortcut, isMac });
  });
}
function ShortcutsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let categorizedShortcuts = {};
    let isMac = false;
    {
      const allShortcuts = Object.values(shortcuts).filter((shortcut) => {
        if (!shortcut.setting) {
          return true;
        }
        return store_get($$store_subs ??= {}, "$settings", settings)[shortcut.setting.id] === shortcut.setting.value;
      });
      categorizedShortcuts = allShortcuts.reduce(
        (acc, shortcut) => {
          const category = shortcut.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(shortcut);
          return acc;
        },
        {}
      );
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="text-gray-700 dark:text-gray-100 px-5 py-4"><div class="flex justify-between dark:text-gray-300 pb-2"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Keyboard Shortcuts"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <!--[-->`);
          const each_array = ensure_array_like(Object.entries(categorizedShortcuts));
          for (let categoryIndex = 0, $$length = each_array.length; categoryIndex < $$length; categoryIndex++) {
            let [category, items] = each_array[categoryIndex];
            if (categoryIndex > 0) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div class="py-3"><div class="w-full border-t dark:border-gray-850 border-gray-50"></div></div>`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--> <div class="flex justify-between dark:text-gray-300 pb-2"><div class="text-base self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t(category))}</div></div> <div class="flex flex-col md:flex-row w-full md:space-x-2 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><div class="grid grid-cols-1 sm:grid-cols-2 gap-2 gap-x-4 w-full"><!--[-->`);
            const each_array_1 = ensure_array_like(items);
            for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
              let shortcut = each_array_1[$$index];
              $$renderer4.push(`<div class="col-span-1 flex items-start">`);
              ShortcutItem($$renderer4, { shortcut, isMac });
              $$renderer4.push(`<!----></div>`);
            }
            $$renderer4.push(`<!--]--></div></div></div>`);
          }
          $$renderer4.push(`<!--]--></div>`);
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
function Settings($$renderer, $$props) {
  let className = fallback($$props["className"], "w-5 h-5");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor" aria-hidden="true"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Code($$renderer, $$props) {
  let className = fallback($$props["className"], "w-5 h-5");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function UserGroup($$renderer, $$props) {
  let className = fallback($$props["className"], "w-5 h-5");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function SignOut($$renderer, $$props) {
  let className = fallback($$props["className"], "w-5 h-5");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(clsx(className))}><path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clip-rule="evenodd" aria-hidden="true"></path><path fill-rule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clip-rule="evenodd"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function UserMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let role = fallback($$props["role"], "");
    let help = fallback($$props["help"], false);
    let className = fallback($$props["className"], "max-w-[240px]");
    let usage = null;
    const getUsageInfo = async () => {
      const res = await getUsage(localStorage.token).catch((error) => {
        /* @__PURE__ */ console.error("Error fetching usage info:", error);
      });
      if (res) {
        usage = res;
      } else {
        usage = null;
      }
    };
    if (show) {
      getUsageInfo();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ShortcutsModal($$renderer3, {
        get show() {
          return store_get($$store_subs ??= {}, "$showShortcuts", showShortcuts);
        },
        set show($$value) {
          store_set(showShortcuts, $$value);
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      Menu($$renderer3, {
        onOpenChange: (state) => {
        },
        get open() {
          return show;
        },
        set open($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Menu_trigger($$renderer4, {
            children: ($$renderer5) => {
              $$renderer5.push(`<!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!--[-->`);
          slot($$renderer4, $$props, "content", {}, () => {
            Menu_content($$renderer4, {
              class: `w-full ${stringify(className)}  rounded-2xl px-1 py-1  border border-gray-100  dark:border-gray-800 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg text-sm`,
              sideOffset: 4,
              side: "top",
              align: "end",
              transition: (e) => fade(e, { duration: 100 }),
              children: ($$renderer5) => {
                Menu_item($$renderer5, {
                  class: "flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="self-center mr-3">`);
                    Settings($$renderer6, { className: "w-5 h-5", strokeWidth: "1.5" });
                    $$renderer6.push(`<!----></div> <div class="self-center truncate">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Settings"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="self-center mr-3">`);
                    ArchiveBox($$renderer6, { className: "size-5", strokeWidth: "1.5" });
                    $$renderer6.push(`<!----></div> <div class="self-center truncate">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Archived Chats"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                if (role === "admin") {
                  $$renderer5.push("<!--[-->");
                  Menu_item($$renderer5, {
                    as: "a",
                    href: "/playground",
                    class: "flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition select-none",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<div class="self-center mr-3">`);
                      Code($$renderer6, { className: "size-5", strokeWidth: "1.5" });
                      $$renderer6.push(`<!----></div> <div class="self-center truncate">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Playground"))}</div>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> `);
                  Menu_item($$renderer5, {
                    as: "a",
                    href: "/admin",
                    class: "flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition select-none",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<div class="self-center mr-3">`);
                      UserGroup($$renderer6, { className: "w-5 h-5", strokeWidth: "1.5" });
                      $$renderer6.push(`<!----></div> <div class="self-center truncate">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Admin Panel"))}</div>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!---->`);
                } else {
                  $$renderer5.push("<!--[!-->");
                }
                $$renderer5.push(`<!--]--> `);
                if (help) {
                  $$renderer5.push("<!--[-->");
                  $$renderer5.push(`<hr class="border-gray-50 dark:border-gray-800 my-1 p-0"/> `);
                  if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
                    $$renderer5.push("<!--[-->");
                    Menu_item($$renderer5, {
                      as: "a",
                      target: "_blank",
                      class: "flex gap-3 items-center py-1.5 px-3 text-sm select-none w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition",
                      id: "chat-share-button",
                      href: "https://docs.openwebui.com",
                      children: ($$renderer6) => {
                        QuestionMarkCircle($$renderer6, { className: "size-5" });
                        $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Documentation"))}</div>`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!----> `);
                    Menu_item($$renderer5, {
                      as: "a",
                      target: "_blank",
                      class: "flex gap-3 items-center py-1.5 px-3 text-sm select-none w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition",
                      id: "chat-share-button",
                      href: "https://github.com/open-webui/open-webui/releases",
                      children: ($$renderer6) => {
                        Map$1($$renderer6, { className: "size-5" });
                        $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Releases"))}</div>`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!---->`);
                  } else {
                    $$renderer5.push("<!--[!-->");
                  }
                  $$renderer5.push(`<!--]--> `);
                  Menu_item($$renderer5, {
                    class: "flex gap-3 items-center py-1.5 px-3 text-sm select-none w-full  hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer",
                    id: "chat-share-button",
                    children: ($$renderer6) => {
                      Keyboard($$renderer6, { className: "size-5" });
                      $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Keyboard shortcuts"))}</div>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!---->`);
                } else {
                  $$renderer5.push("<!--[!-->");
                }
                $$renderer5.push(`<!--]--> <hr class="border-gray-50 dark:border-gray-800 my-1 p-0"/> `);
                Menu_item($$renderer5, {
                  class: "flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="self-center mr-3">`);
                    SignOut($$renderer6, { className: "w-5 h-5", strokeWidth: "1.5" });
                    $$renderer6.push(`<!----></div> <div class="self-center truncate">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Sign Out"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                if (usage) {
                  $$renderer5.push("<!--[-->");
                  if (usage?.user_ids?.length > 0) {
                    $$renderer5.push("<!--[-->");
                    $$renderer5.push(`<hr class="border-gray-50 dark:border-gray-800 my-1 p-0"/> `);
                    Tooltip($$renderer5, {
                      content: usage?.model_ids && usage?.model_ids.length > 0 ? `${store_get($$store_subs ??= {}, "$i18n", i18n).t("Running")}: ${usage.model_ids.join(", ")} ✨` : "",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<div class="flex rounded-xl py-1 px-3 text-xs gap-2.5 items-center"><div class="flex items-center"><span class="relative flex size-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span> <span class="relative inline-flex rounded-full size-2 bg-green-500"></span></span></div> <div><span>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Active Users"))}:</span> <span class="font-semibold">${escape_html(usage?.user_ids?.length)}</span></div></div>`);
                      },
                      $$slots: { default: true }
                    });
                    $$renderer5.push(`<!---->`);
                  } else {
                    $$renderer5.push("<!--[!-->");
                  }
                  $$renderer5.push(`<!--]-->`);
                } else {
                  $$renderer5.push("<!--[!-->");
                }
                $$renderer5.push(`<!--]-->`);
              },
              $$slots: { default: true }
            });
          });
          $$renderer4.push(`<!--]-->`);
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
    bind_props($$props, { show, role, help, className });
  });
}
function GarbageBin($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Emoji($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let shortCode = $$props["shortCode"];
    let className = fallback($$props["className"], "size-4");
    if (store_get($$store_subs ??= {}, "$shortCodesToEmojis", shortCodesToEmojis)[shortCode]) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<img${attr("src", `${stringify(WEBUI_BASE_URL)}/assets/emojis/${stringify(store_get($$store_subs ??= {}, "$shortCodesToEmojis", shortCodesToEmojis)[shortCode].toLowerCase())}.svg`)}${attr("alt", shortCode)}${attr_class(clsx(className))} loading="lazy"/>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div>${escape_html(shortCode)}</div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { shortCode, className });
  });
}
export {
  ArchiveBox as A,
  Emoji as E,
  GarbageBin as G,
  Map$1 as M,
  UserMenu as U
};
//# sourceMappingURL=Emoji.js.map
