import "clsx";
import { a as attr, c as attr_class, d as clsx, b as bind_props, s as store_get, o as stringify, u as unsubscribe_stores, j as escape_html } from "../../../../../../chunks/index.js";
import Fuse from "fuse.js";
import { o as onDestroy, t as tick } from "../../../../../../chunks/client.js";
import { a as toast } from "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { v4 } from "uuid";
import { n as config, h as settings } from "../../../../../../chunks/index2.js";
import { u as uploadFile, b as addFileToKnowledgeById } from "../../../../../../chunks/index11.js";
import "../../../../../../chunks/index4.js";
import { S as Spinner } from "../../../../../../chunks/Spinner.js";
import "../../../../../../chunks/constants.js";
/* empty css                                                           */
import "dequal";
import "../../../../../../chunks/create.js";
import DOMPurify from "dompurify";
import "dayjs";
import { Y as fallback, Z as getContext } from "../../../../../../chunks/context.js";
import { M as Modal } from "../../../../../../chunks/Modal.js";
import { marked } from "marked";
import TurndownService from "turndown";
import { gfm } from "@joplin/turndown-plugin-gfm";
import { DOMParser, Fragment } from "prosemirror-model";
import { Plugin, PluginKey, Selection, TextSelection } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";
import { Extension } from "@tiptap/core";
import { l as listDragHandlePlugin } from "../../../../../../chunks/listDragHandlePlugin.js";
import "@tiptap/starter-kit";
import "@tiptap/extension-table";
import "@tiptap/extension-list";
import "@tiptap/extensions";
import "@tiptap/extension-file-handler";
import "@tiptap/extension-typography";
import "@tiptap/extension-highlight";
import "@tiptap/extension-code-block-lowlight";
import "@tiptap/extension-mention";
import { T as Tooltip } from "../../../../../../chunks/Tooltip.js";
import { createLowlight } from "lowlight";
import hljs from "highlight.js";
import { X as XMark } from "../../../../../../chunks/XMark.js";
import "dayjs/plugin/localizedFormat.js";
import { C as ConfirmDialog } from "../../../../../../chunks/ConfirmDialog.js";
/* empty css                                                            */
import { F as FilesOverlay } from "../../../../../../chunks/FilesOverlay.js";
function Bold($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function CodeBracket($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function H1($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501m4.501-8.627 2.25-1.5v10.126m0 0h-2.25m2.25 0h2.25"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function H2($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 19.5H16.5v-1.609a2.25 2.25 0 0 1 1.244-2.012l2.89-1.445c.651-.326 1.116-.955 1.116-1.683 0-.498-.04-.987-.118-1.463-.135-.825-.835-1.422-1.668-1.489a15.202 15.202 0 0 0-3.464.12M2.243 4.492v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function H3($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M20.905 14.626a4.52 4.52 0 0 1 .738 3.603c-.154.695-.794 1.143-1.504 1.208a15.194 15.194 0 0 1-3.639-.104m4.405-4.707a4.52 4.52 0 0 0 .738-3.603c-.154-.696-.794-1.144-1.504-1.209a15.19 15.19 0 0 0-3.639.104m4.405 4.708H18M2.243 4.493v7.5m0 0v7.502m0-7.501h10.5m0-7.5v7.5m0 0v7.501"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Italic($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ListBullet($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function NumberedList($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Strikethrough($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M12 12a8.912 8.912 0 0 1-.318-.079c-1.585-.424-2.904-1.247-3.76-2.236-.873-1.009-1.265-2.19-.968-3.301.59-2.2 3.663-3.29 6.863-2.432A8.186 8.186 0 0 1 16.5 5.21M6.42 17.81c.857.99 2.176 1.812 3.761 2.237 3.2.858 6.274-.23 6.863-2.431.233-.868.044-1.779-.465-2.617M3.75 12h16.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Underline($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M17.995 3.744v7.5a6 6 0 1 1-12 0v-7.5m-2.25 16.502h16.5"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function CheckBox($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke-width="1.5"></path><path d="M7 12.5L10 15.5L17 8.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ArrowLeftTag($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M16.75 12H6.75M6.75 12L9.5 14.75M6.75 12L9.5 9.25" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 15V9C2 6.79086 3.79086 5 6 5H18C20.2091 5 22 6.79086 22 9V15C22 17.2091 20.2091 19 18 19H6C3.79086 19 2 17.2091 2 15Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ArrowRightTag($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path d="M6.75 12H16.75M16.75 12L14 14.75M16.75 12L14 9.25" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2 15V9C2 6.79086 3.79086 5 6 5H18C20.2091 5 22 6.79086 22 9V15C22 17.2091 20.2091 19 18 19H6C3.79086 19 2 17.2091 2 15Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function FormattingButtons($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let editor = fallback($$props["editor"], null);
    $$renderer2.push(`<div class="flex gap-0.5 p-0.5 rounded-xl shadow-lg bg-white text-gray-800 dark:text-white dark:bg-gray-850 min-w-fit border border-gray-100 dark:border-gray-800">`);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("H1"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("heading", { level: 1 }) ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        H1($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("H2"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("heading", { level: 2 }) ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        H2($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("H3"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("heading", { level: 3 }) ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        H3($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (editor?.isActive("bulletList") || editor?.isActive("orderedList") || editor?.isActive("taskList")) {
      $$renderer2.push("<!--[-->");
      Tooltip($$renderer2, {
        placement: "top",
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Lift List"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all" type="button">`);
          ArrowLeftTag($$renderer3, {});
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        placement: "top",
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Sink List"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all" type="button">`);
          ArrowRightTag($$renderer3, {});
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Bullet List"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("bulletList") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        ListBullet($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Ordered List"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("orderedList") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        NumberedList($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Task List"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("taskList") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        CheckBox($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Bold"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("bold") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Bold($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Italic"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("italic") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Italic($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Underline"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("underline") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Underline($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Strikethrough"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("strike") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        Strikethrough($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Tooltip($$renderer2, {
      placement: "top",
      content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Code Block"),
      children: ($$renderer3) => {
        $$renderer3.push(`<button${attr_class(`${stringify(editor?.isActive("codeBlock") ? "bg-gray-50 dark:bg-gray-700" : "")} hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all`)} type="button">`);
        CodeBracket($$renderer3, {});
        $$renderer3.push(`<!----></button>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { editor });
  });
}
function RichTextInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    marked.use({
      breaks: true,
      gfm: true,
      renderer: {
        list(body, ordered, start) {
          const isTaskList = body.includes("data-checked=");
          if (isTaskList) {
            return `<ul data-type="taskList">${body}</ul>`;
          }
          const type = ordered ? "ol" : "ul";
          const startatt = ordered && start !== 1 ? ` start="${start}"` : "";
          return `<${type}${startatt}>${body}</${type}>`;
        },
        listitem(text, task, checked) {
          if (task) {
            const checkedAttr = checked ? "true" : "false";
            return `<li data-type="taskItem" data-checked="${checkedAttr}">${text}</li>`;
          }
          return `<li>${text}</li>`;
        }
      }
    });
    const turndownService = new TurndownService({ codeBlockStyle: "fenced", headingStyle: "atx" });
    turndownService.escape = (string) => string;
    turndownService.use(gfm);
    turndownService.addRule("tableHeaders", {
      filter: "th",
      replacement(content, node) {
        return content;
      }
    });
    turndownService.addRule("tables", {
      filter: "table",
      replacement(content, node) {
        const rows = Array.from(node.querySelectorAll("tr"));
        if (rows.length === 0) return content;
        let markdown = "\n";
        rows.forEach((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll("th, td"));
          const cellContents = cells.map((cell) => {
            let cellContent = turndownService.turndown(cell.innerHTML).trim();
            cellContent = cellContent.replace(/^\n+|\n+$/g, "");
            return cellContent;
          });
          markdown += "| " + cellContents.join(" | ") + " |\n";
          if (rowIndex === 0) {
            const separator = cells.map(() => "---").join(" | ");
            markdown += "| " + separator + " |\n";
          }
        });
        return markdown + "\n";
      }
    });
    turndownService.addRule("taskListItems", {
      filter: (node) => node.nodeName === "LI" && (node.getAttribute("data-checked") === "true" || node.getAttribute("data-checked") === "false"),
      replacement(content, node) {
        const checked = node.getAttribute("data-checked") === "true";
        content = content.replace(/^\s+/, "");
        return `- [${checked ? "x" : " "}] ${content}
`;
      }
    });
    turndownService.addRule("mentions", {
      filter: (node) => node.nodeName === "SPAN" && node.getAttribute("data-type") === "mention",
      replacement: (_content, node) => {
        const id2 = node.getAttribute("data-id") || "";
        const ch = node.getAttribute("data-mention-suggestion-char") || "@";
        return `<${ch}${id2}>`;
      }
    });
    const i18n = getContext("i18n");
    let oncompositionstart = fallback($$props["oncompositionstart"], (e) => {
    });
    let oncompositionend = fallback($$props["oncompositionend"], (e) => {
    });
    let onChange = fallback($$props["onChange"], (e) => {
    });
    createLowlight(hljs.listLanguages().reduce(
      (obj, lang) => {
        obj[lang] = () => hljs.getLanguage(lang);
        return obj;
      },
      {}
    ));
    let editor = fallback($$props["editor"], null);
    let socket = fallback($$props["socket"], null);
    let user = fallback($$props["user"], null);
    let files = fallback($$props["files"], () => [], true);
    let documentId = fallback($$props["documentId"], "");
    let className = fallback($$props["className"], "input-prose");
    let placeholder = fallback($$props["placeholder"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Type here..."), true);
    let _placeholder = placeholder;
    const setPlaceholder = () => {
      _placeholder = placeholder;
      if (editor) {
        editor?.view.dispatch(editor.state.tr);
      }
    };
    let richText = fallback($$props["richText"], true);
    let dragHandle = fallback($$props["dragHandle"], false);
    let link = fallback($$props["link"], false);
    let image = fallback($$props["image"], false);
    let fileHandler = fallback($$props["fileHandler"], false);
    let suggestions = fallback($$props["suggestions"], null);
    let onFileDrop = fallback($$props["onFileDrop"], (currentEditor, files2, pos) => {
      files2.forEach((file) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          currentEditor.chain().insertContentAt(pos, { type: "image", attrs: { src: fileReader.result } }).focus().run();
        };
      });
    });
    let onFilePaste = fallback($$props["onFilePaste"], (currentEditor, files2, htmlContent) => {
      files2.forEach((file) => {
        if (htmlContent) {
          /* @__PURE__ */ console.log(htmlContent);
          return false;
        }
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
          currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, { type: "image", attrs: { src: fileReader.result } }).focus().run();
        };
      });
    });
    let onSelectionUpdate = fallback($$props["onSelectionUpdate"], (e) => {
    });
    let id = fallback($$props["id"], "");
    let value = fallback($$props["value"], "");
    let html = fallback($$props["html"], "");
    let json = fallback($$props["json"], false);
    let raw = fallback($$props["raw"], false);
    let editable = fallback($$props["editable"], true);
    let collaboration = fallback($$props["collaboration"], false);
    let showFormattingToolbar = fallback($$props["showFormattingToolbar"], true);
    let preserveBreaks = fallback($$props["preserveBreaks"], false);
    let generateAutoCompletion = fallback($$props["generateAutoCompletion"], async () => null);
    let autocomplete = fallback($$props["autocomplete"], false);
    let messageInput = fallback($$props["messageInput"], false);
    let shiftEnter = fallback($$props["shiftEnter"], false);
    let largeTextAsFile = fallback($$props["largeTextAsFile"], false);
    let insertPromptAsRichText = fallback($$props["insertPromptAsRichText"], false);
    let floatingMenuPlacement = fallback($$props["floatingMenuPlacement"], "bottom-start");
    const getWordAtDocPos = () => {
      if (!editor) return "";
      const { state } = editor.view;
      const pos = state.selection.from;
      const doc = state.doc;
      const resolvedPos = doc.resolve(pos);
      const textBlock = resolvedPos.parent;
      resolvedPos.start();
      const text = textBlock.textContent;
      const offset = resolvedPos.parentOffset;
      let wordStart = offset, wordEnd = offset;
      while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) wordStart--;
      while (wordEnd < text.length && !/\s/.test(text[wordEnd])) wordEnd++;
      const word = text.slice(wordStart, wordEnd);
      return word;
    };
    function getWordBoundsAtPos(doc, pos) {
      const resolvedPos = doc.resolve(pos);
      const textBlock = resolvedPos.parent;
      const paraStart = resolvedPos.start();
      const text = textBlock.textContent;
      const offset = resolvedPos.parentOffset;
      let wordStart = offset, wordEnd = offset;
      while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) wordStart--;
      while (wordEnd < text.length && !/\s/.test(text[wordEnd])) wordEnd++;
      return { start: paraStart + wordStart, end: paraStart + wordEnd };
    }
    const replaceCommandWithText = async (text) => {
      const { state, dispatch } = editor.view;
      const { selection } = state;
      const pos = selection.from;
      const { start, end } = getWordBoundsAtPos(state.doc, pos);
      let tr = state.tr;
      if (insertPromptAsRichText) {
        const htmlContent = DOMPurify.sanitize(marked.parse(text, { breaks: true, gfm: true }).trim());
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;
        const fragment = DOMParser.fromSchema(state.schema).parse(tempDiv);
        const content = fragment.content;
        let nodesToInsert = [];
        content.forEach((node) => {
          if (node.type.name === "paragraph") {
            nodesToInsert.push(...node.content.content);
          } else {
            nodesToInsert.push(node);
          }
        });
        tr = tr.replaceWith(start, end, nodesToInsert);
        const newPos = start + nodesToInsert.reduce((sum, node) => sum + node.nodeSize, 0);
        tr = tr.setSelection(Selection.near(tr.doc.resolve(newPos)));
      } else {
        if (text.includes("\n")) {
          const lines = text.split("\n");
          const nodes = lines.map(
            (line, index) => index === 0 ? state.schema.text(line ? line : []) : (
              // First line is plain text
              state.schema.nodes.paragraph.create({}, line ? state.schema.text(line) : void 0)
            )
            // Subsequent lines are paragraphs
          );
          tr = tr.replaceWith(start, end, nodes);
          let newSelectionPos;
          let lastPos = start;
          for (let i = 0; i < nodes.length; i++) {
            lastPos += nodes[i].nodeSize;
          }
          newSelectionPos = lastPos;
          tr = tr.setSelection(TextSelection.near(tr.doc.resolve(newSelectionPos)));
        } else {
          tr = tr.replaceWith(
            start,
            end,
            // replace this range
            text !== "" ? state.schema.text(text) : []
          );
          tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(start + text.length + 1)));
        }
      }
      dispatch(tr);
      await tick();
    };
    const setText = (text) => {
      if (!editor) return;
      text = text.replaceAll("\n\n", "\n");
      editor.commands.clearContent();
      const { state, view } = editor;
      const { schema, tr } = state;
      if (text.includes("\n")) {
        const lines = text.split("\n");
        const nodes = lines.map((line) => schema.nodes.paragraph.create({}, line ? schema.text(line) : void 0));
        const fragment = Fragment.fromArray(nodes);
        tr.replaceSelectionWith(
          fragment,
          false
          /* don't select new */
        );
        view.dispatch(tr);
      } else if (text === "") {
        editor.commands.clearContent();
      } else {
        const paragraph = schema.nodes.paragraph.create({}, schema.text(text));
        tr.replaceSelectionWith(paragraph, false);
        view.dispatch(tr);
      }
      selectNextTemplate(editor.view.state, editor.view.dispatch);
      focus();
    };
    const insertContent = (content) => {
      if (!editor) return;
      const htmlContent = marked.parse(content);
      editor.commands.insertContent(htmlContent);
      focus();
    };
    const replaceVariables = (variables) => {
      if (!editor) return;
      const { state, view } = editor;
      const { doc } = state;
      let tr = state.tr;
      const replacements = [];
      doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const text = node.text;
          const replacedText = text.replace(/{{\s*([^|}]+)(?:\|[^}]*)?\s*}}/g, (match, varName) => {
            const trimmedVarName = varName.trim();
            return variables.hasOwnProperty(trimmedVarName) ? String(variables[trimmedVarName]) : match;
          });
          if (replacedText !== text) {
            replacements.push({ from: pos, to: pos + text.length, text: replacedText });
          }
        }
      });
      replacements.reverse().forEach(({ from, to, text }) => {
        tr = tr.replaceWith(from, to, text !== "" ? state.schema.text(text) : []);
      });
      if (replacements.length > 0) {
        view.dispatch(tr);
      }
    };
    const focus = () => {
      if (editor) {
        try {
          editor.view?.focus();
          editor.view?.dispatch(editor.view.state.tr.scrollIntoView());
        } catch (e) {
          console.warn("Error focusing editor", e);
        }
      }
    };
    function findNextTemplate(doc, from = 0) {
      const patterns = [{ start: "{{", end: "}}" }];
      let result = null;
      doc.nodesBetween(from, doc.content.size, (node, pos) => {
        if (result) return false;
        if (node.isText) {
          const text = node.text;
          let index = Math.max(0, from - pos);
          while (index < text.length) {
            for (const pattern of patterns) {
              if (text.startsWith(pattern.start, index)) {
                const endIndex = text.indexOf(pattern.end, index + pattern.start.length);
                if (endIndex !== -1) {
                  result = { from: pos + index, to: pos + endIndex + pattern.end.length };
                  return false;
                }
              }
            }
            index++;
          }
        }
      });
      return result;
    }
    function selectNextTemplate(state, dispatch) {
      const { doc, selection } = state;
      const from = selection.to;
      let template = findNextTemplate(doc, from);
      if (!template) {
        template = findNextTemplate(doc, 0);
      }
      if (template) {
        if (dispatch) {
          const tr = state.tr.setSelection(TextSelection.create(doc, template.from, template.to));
          dispatch(tr);
          dispatch(
            tr.scrollIntoView().setMeta("preventScroll", true)
            // Prevent default scrolling behavior
          );
        }
        return true;
      }
      return false;
    }
    const setContent = (content) => {
      editor.commands.setContent(content);
    };
    const selectTemplate = () => {
      if (value !== "") {
        setTimeout(
          () => {
            const templateFound = selectNextTemplate(editor.view.state, editor.view.dispatch);
            if (!templateFound) {
              editor.commands.focus("end");
            }
          },
          0
        );
      }
    };
    Extension.create({
      name: "selectionDecoration",
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key: new PluginKey("selection"),
            props: {
              decorations: (state) => {
                const { selection } = state;
                const { focused } = this.editor;
                if (focused || selection.empty) {
                  return null;
                }
                return DecorationSet.create(state.doc, [
                  Decoration.inline(selection.from, selection.to, { class: "editor-selection" })
                ]);
              }
            }
          })
        ];
      }
    });
    Extension.create({
      name: "listItemDragHandle",
      addProseMirrorPlugins() {
        return [
          listDragHandlePlugin({
            itemTypeNames: ["listItem", "taskItem"],
            getEditor: () => this.editor
          })
        ];
      }
    });
    onDestroy(() => {
      if (editor) {
        editor.destroy();
      }
    });
    const onValueChange = () => {
      if (!editor) return;
      const jsonValue = editor.getJSON();
      const htmlValue = editor.getHTML();
      let mdValue = turndownService.turndown((preserveBreaks ? htmlValue.replace(/<p><\/p>/g, "<br/>") : htmlValue).replace(/ {2,}/g, (m) => m.replace(/ /g, " "))).replace(/\u00a0/g, " ");
      if (value === "") {
        editor.commands.clearContent();
        selectTemplate();
        return;
      }
      if (json) {
        if (JSON.stringify(value) !== JSON.stringify(jsonValue)) {
          editor.commands.setContent(value);
          selectTemplate();
        }
      } else {
        if (raw) {
          if (value !== htmlValue) {
            editor.commands.setContent(value);
            selectTemplate();
          }
        } else {
          if (value !== mdValue) {
            editor.commands.setContent(preserveBreaks ? value : marked.parse(value.replaceAll(`
<br/>`, `<br/>`), { breaks: false }));
            selectTemplate();
          }
        }
      }
    };
    if (placeholder !== _placeholder) {
      setPlaceholder();
    }
    if (editor) {
      editor.setOptions({ editable });
    }
    if (value === null && html !== null && editor) {
      editor.commands.setContent(html);
    }
    if (value !== null && editor && !collaboration) {
      onValueChange();
    }
    if (
      // Clear content if value is empty
      richText && showFormattingToolbar
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div id="bubble-menu"${attr_class(`p-0 ${stringify(editor ? "" : "hidden")}`)}>`);
      FormattingButtons($$renderer2, { editor });
      $$renderer2.push(`<!----></div> <div id="floating-menu"${attr_class(`p-0 ${stringify(editor ? "" : "hidden")}`)}>`);
      FormattingButtons($$renderer2, { editor });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class(`relative w-full min-w-full h-full min-h-fit ${stringify(className)} ${stringify(!editable ? "cursor-not-allowed" : "")}`)}></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      oncompositionstart,
      oncompositionend,
      onChange,
      editor,
      socket,
      user,
      files,
      documentId,
      className,
      placeholder,
      richText,
      dragHandle,
      link,
      image,
      fileHandler,
      suggestions,
      onFileDrop,
      onFilePaste,
      onSelectionUpdate,
      id,
      value,
      html,
      json,
      raw,
      editable,
      collaboration,
      showFormattingToolbar,
      preserveBreaks,
      generateAutoCompletion,
      autocomplete,
      messageInput,
      shiftEnter,
      largeTextAsFile,
      insertPromptAsRichText,
      floatingMenuPlacement,
      getWordAtDocPos,
      replaceCommandWithText,
      setText,
      insertContent,
      replaceVariables,
      focus,
      setContent
    });
  });
}
function MicSolid($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${attr_class(clsx(className))}><path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z"></path><path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z"></path></svg>`);
  bind_props($$props, { className });
}
function AddTextContentModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let name = store_get($$store_subs ??= {}, "$i18n", i18n).t("Untitled");
    let content = "";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "full",
        containerClassName: "",
        className: "h-full bg-white dark:bg-gray-900",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="absolute top-0 right-0 p-5"><button class="self-center dark:text-white" type="button">`);
          XMark($$renderer4, { className: "size-3.5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full h-full md:space-x-4 dark:text-gray-200"><form class="flex flex-col w-full h-full"><div class="flex-1 w-full h-full flex justify-center overflow-auto px-5 py-4"><div class="max-w-3xl py-2 md:py-10 w-full flex flex-col gap-2"><div class="shrink-0 w-full flex justify-between items-center"><div class="w-full"><input class="w-full text-3xl font-medium bg-transparent outline-hidden svelte-1bctwft" type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Title"))} required/></div></div> <div class="flex-1 w-full h-full">`);
          RichTextInput($$renderer4, {
            placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write something..."),
            preserveBreaks: true,
            get value() {
              return content;
            },
            set value($$value) {
              content = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div></div> <div class="flex flex-row items-center justify-end text-sm font-medium shrink-0 mt-1 p-4 gap-1.5"><div>`);
          {
            $$renderer4.push("<!--[!-->");
            Tooltip($$renderer4, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Voice Input"),
              children: ($$renderer5) => {
                $$renderer5.push(`<button class="p-2 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-white transition rounded-full" type="button">`);
                MicSolid($$renderer5, { className: "size-5" });
                $$renderer5.push(`<!----></button>`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer4.push(`<!--]--></div> <div class="shrink-0">`);
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"),
            children: ($$renderer5) => {
              $$renderer5.push(`<button class="px-3.5 py-2 bg-black text-white dark:bg-white dark:text-black transition rounded-full" type="submit">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></div></form></div>`);
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
function KnowledgeBase($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = null;
    let knowledge = null;
    let showAddTextContentModal = false;
    let showSyncConfirmModal = false;
    let fuse = null;
    let dragged = false;
    const uploadFileHandler = async (file) => {
      /* @__PURE__ */ console.log(file);
      const tempItemId = v4();
      const fileItem = {
        type: "file",
        file: "",
        id: null,
        url: "",
        name: file.name,
        size: file.size,
        status: "uploading",
        error: "",
        itemId: tempItemId
      };
      if (fileItem.size == 0) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("You cannot upload an empty file."));
        return null;
      }
      if ((store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? null) !== null && file.size > (store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? 0) * 1024 * 1024) {
        /* @__PURE__ */ console.log("File exceeds max size limit:", {
          fileSize: file.size,
          maxSize: (store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? 0) * 1024 * 1024
        });
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`File size should not exceed {{maxSize}} MB.`, {
          maxSize: store_get($$store_subs ??= {}, "$config", config)?.file?.max_size
        }));
        return;
      }
      knowledge.files = [...knowledge.files ?? [], fileItem];
      try {
        let metadata = null;
        if ((file.type.startsWith("audio/") || file.type.startsWith("video/")) && store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language) {
          metadata = {
            language: store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language
          };
        }
        const uploadedFile = await uploadFile(localStorage.token, file, metadata).catch((e) => {
          toast.error(`${e}`);
          return null;
        });
        if (uploadedFile) {
          /* @__PURE__ */ console.log(uploadedFile);
          knowledge.files = knowledge.files.map((item) => {
            if (item.itemId === tempItemId) {
              item.id = uploadedFile.id;
            }
            delete item.itemId;
            return item;
          });
          if (uploadedFile.error) {
            console.warn("File upload warning:", uploadedFile.error);
            toast.warning(uploadedFile.error);
            knowledge.files = knowledge.files.filter((file2) => file2.id !== uploadedFile.id);
          } else {
            await addFileHandler(uploadedFile.id);
          }
        } else {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to upload file."));
        }
      } catch (e) {
        toast.error(`${e}`);
      }
    };
    const addFileHandler = async (fileId) => {
      const updatedKnowledge = await addFileToKnowledgeById(localStorage.token, id, fileId).catch((e) => {
        toast.error(`${e}`);
        return null;
      });
      if (updatedKnowledge) {
        knowledge = updatedKnowledge;
        toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("File added successfully."));
      } else {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to add file."));
        knowledge.files = knowledge.files.filter((file) => file.id !== fileId);
      }
    };
    const onDragOver = (e) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes("Files")) {
        dragged = true;
      } else {
        dragged = false;
      }
    };
    const onDragLeave = () => {
      dragged = false;
    };
    const onDrop = async (e) => {
      e.preventDefault();
      dragged = false;
      const handleUploadingFileFolder = (items) => {
        for (const item of items) {
          if (item.isFile) {
            item.file((file) => {
              uploadFileHandler(file);
            });
            continue;
          }
          const wkentry = item.webkitGetAsEntry();
          const isDirectory = wkentry.isDirectory;
          if (isDirectory) {
            wkentry.createReader().readEntries(
              (entries) => {
                handleUploadingFileFolder(entries);
              },
              (error) => {
                /* @__PURE__ */ console.error("Error reading directory entries:", error);
              }
            );
          } else {
            toast.info(store_get($$store_subs ??= {}, "$i18n", i18n).t("Uploading file..."));
            uploadFileHandler(item.getAsFile());
            toast.success(store_get($$store_subs ??= {}, "$i18n", i18n).t("File uploaded!"));
          }
        }
      };
      if (e.dataTransfer?.types?.includes("Files")) {
        if (e.dataTransfer?.files) {
          const inputItems = e.dataTransfer?.items;
          if (inputItems && inputItems.length > 0) {
            handleUploadingFileFolder(inputItems);
          } else {
            toast.error(store_get($$store_subs ??= {}, "$i18n", i18n).t(`File not found.`));
          }
        }
      }
    };
    onDestroy(() => {
      const dropZone = document.querySelector("body");
      dropZone?.removeEventListener("dragover", onDragOver);
      dropZone?.removeEventListener("drop", onDrop);
      dropZone?.removeEventListener("dragleave", onDragLeave);
    });
    if (knowledge && knowledge.files) {
      fuse = new Fuse(knowledge.files, { keys: ["meta.name", "meta.description"] });
    }
    if (fuse) {
      knowledge?.files ?? [];
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      FilesOverlay($$renderer3, { show: dragged });
      $$renderer3.push(`<!----> `);
      ConfirmDialog($$renderer3, {
        message: store_get($$store_subs ??= {}, "$i18n", i18n).t("This will reset the knowledge base and sync all files. Do you wish to continue?"),
        get show() {
          return showSyncConfirmModal;
        },
        set show($$value) {
          showSyncConfirmModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      AddTextContentModal($$renderer3, {
        get show() {
          return showAddTextContentModal;
        },
        set show($$value) {
          showAddTextContentModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <input id="files-input" type="file" multiple hidden=""/> <div class="flex flex-col w-full h-full translate-y-1" id="collection-container">`);
      {
        $$renderer3.push("<!--[!-->");
        Spinner($$renderer3, { className: "size-5" });
      }
      $$renderer3.push(`<!--]--></div>`);
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
function _page($$renderer) {
  KnowledgeBase($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
