import { j as escape_html, s as store_get, h as slot, u as unsubscribe_stores, b as bind_props, c as attr_class, o as stringify } from "./index.js";
import { g as showSidebar } from "./index2.js";
import { Y as fallback, Z as getContext } from "./context.js";
function AddFilesPlaceholder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let title = fallback($$props["title"], "");
    let content = fallback($$props["content"], "");
    const i18n = getContext("i18n");
    $$renderer2.push(`<div class="px-3"><div class="text-center dark:text-white text-2xl font-medium z-50">`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(title)}`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Files"))}`);
    }
    $$renderer2.push(`<!--]--></div> <!--[-->`);
    slot($$renderer2, $$props, "default", {}, () => {
      $$renderer2.push(`<div class="px-2 mt-2 text-center text-gray-700 dark:text-gray-200 w-full">`);
      if (content) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`${escape_html(content)}`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Drop any files here to upload"))}`);
      }
      $$renderer2.push(`<!--]--></div>`);
    });
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { title, content });
  });
}
function FilesOverlay($$renderer, $$props) {
  var $$store_subs;
  let show = fallback($$props["show"], false);
  let overlayElement = null;
  if (show && overlayElement) {
    document.body.appendChild(overlayElement);
    document.body.style.overflow = "hidden";
  }
  if (show) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div${attr_class(`fixed ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "left-0 md:left-[260px] md:w-[calc(100%-260px)]" : "left-0")} fixed top-0 right-0 bottom-0 w-full h-full flex z-9999 touch-none pointer-events-none`)} id="dropzone" role="region" aria-label="Drag and Drop Container"><div class="absolute w-full h-full backdrop-blur-sm bg-gray-100/50 dark:bg-gray-900/80 flex justify-center"><div class="m-auto flex flex-col justify-center"><div class="max-w-md">`);
    AddFilesPlaceholder($$renderer, {});
    $$renderer.push(`<!----></div></div></div></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { show });
}
export {
  FilesOverlay as F
};
//# sourceMappingURL=FilesOverlay.js.map
