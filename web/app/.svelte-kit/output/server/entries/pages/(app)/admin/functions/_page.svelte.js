import { n as head, j as escape_html, s as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import { W as WEBUI_NAME, w as functions } from "../../../../../chunks/index2.js";
import "../../../../../chunks/constants.js";
import { Z as getContext } from "../../../../../chunks/context.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "clsx";
import "file-saver";
import { g as goto } from "../../../../../chunks/client.js";
import { l as loadFunctionByUrl } from "../../../../../chunks/index8.js";
import "dompurify";
import "marked";
/* empty css                                                                */
import "../../../../../chunks/index4.js";
import "yaml";
import "dequal";
import "../../../../../chunks/create.js";
/* empty css                                                        */
import { S as Spinner } from "../../../../../chunks/Spinner.js";
/* empty css                                                              */
import { I as ImportModal } from "../../../../../chunks/ImportModal.js";
function Functions($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let showImportModal = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head($$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Functions"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
	</title>`);
        });
      });
      ImportModal($$renderer3, {
        loadUrlHandler: async (url) => {
          return await loadFunctionByUrl(localStorage.token, url);
        },
        onImport: (func) => {
          sessionStorage.function = JSON.stringify({ ...func });
          goto();
        },
        get show() {
          return showImportModal;
        },
        set show($$value) {
          showImportModal = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="w-full h-full flex justify-center items-center">`);
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
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    if (store_get($$store_subs ??= {}, "$functions", functions) !== null) {
      $$renderer2.push("<!--[-->");
      Functions($$renderer2);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
