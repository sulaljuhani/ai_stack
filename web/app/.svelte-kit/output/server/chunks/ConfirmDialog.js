import { s as store_get, j as escape_html, h as slot, a as attr, u as unsubscribe_stores, b as bind_props } from "./index.js";
import DOMPurify from "dompurify";
import { o as onDestroy } from "./client.js";
import { marked } from "marked";
/* empty css                                            */
import { Z as getContext, Y as fallback } from "./context.js";
import { h as html } from "./html.js";
function ConfirmDialog($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let title = fallback($$props["title"], "");
    let message = fallback($$props["message"], "");
    let cancelLabel = fallback($$props["cancelLabel"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Cancel"), true);
    let confirmLabel = fallback($$props["confirmLabel"], () => store_get($$store_subs ??= {}, "$i18n", i18n).t("Confirm"), true);
    let onConfirm = fallback($$props["onConfirm"], () => {
    });
    let input = fallback($$props["input"], false);
    let inputPlaceholder = fallback($$props["inputPlaceholder"], "");
    let inputValue = fallback($$props["inputValue"], "");
    let show = fallback($$props["show"], false);
    const init = () => {
      inputValue = "";
    };
    onDestroy(() => {
      show = false;
    });
    if (show) {
      init();
    }
    if (show) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed top-0 right-0 left-0 bottom-0 bg-black/60 w-full h-screen max-h-[100dvh] flex justify-center z-99999999 overflow-hidden overscroll-contain"><div class="m-auto max-w-full w-[32rem] mx-2 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm rounded-4xl max-h-[100dvh] shadow-3xl border border-white dark:border-gray-900"><div class="px-[1.75rem] py-6 flex flex-col"><div class="text-lg font-medium dark:text-gray-200 mb-2.5">`);
      if (title !== "") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`${escape_html(title)}`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Confirm your action"))}`);
      }
      $$renderer2.push(`<!--]--></div> <!--[-->`);
      slot($$renderer2, $$props, "default", {}, () => {
        $$renderer2.push(`<div class="text-sm text-gray-500 flex-1">`);
        if (message !== "") {
          $$renderer2.push("<!--[-->");
          const html$1 = DOMPurify.sanitize(marked.parse(message));
          $$renderer2.push(`${html(html$1)}`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("This action cannot be undone. Do you wish to continue?"))}`);
        }
        $$renderer2.push(`<!--]--> `);
        if (input) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<textarea${attr("placeholder", inputPlaceholder ? inputPlaceholder : store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter your message"))} class="w-full mt-2 rounded-lg px-4 py-2 text-sm dark:text-gray-300 dark:bg-gray-900 outline-hidden resize-none" rows="3" required>`);
          const $$body = escape_html(inputValue);
          if ($$body) {
            $$renderer2.push(`${$$body}`);
          }
          $$renderer2.push(`</textarea>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      });
      $$renderer2.push(`<!--]--> <div class="mt-6 flex justify-between gap-1.5"><button class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-white font-medium w-full py-2 rounded-3xl transition" type="button">${escape_html(cancelLabel)}</button> <button class="text-sm bg-gray-900 hover:bg-gray-850 text-gray-100 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-800 font-medium w-full py-2 rounded-3xl transition" type="button">${escape_html(confirmLabel)}</button></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      title,
      message,
      cancelLabel,
      confirmLabel,
      onConfirm,
      input,
      inputPlaceholder,
      inputValue,
      show
    });
  });
}
export {
  ConfirmDialog as C
};
//# sourceMappingURL=ConfirmDialog.js.map
