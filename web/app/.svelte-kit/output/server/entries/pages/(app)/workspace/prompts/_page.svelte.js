import "clsx";
import { n as head, j as escape_html, s as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import { Z as getContext } from "../../../../../chunks/context.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "file-saver";
import "../../../../../chunks/client.js";
import { W as WEBUI_NAME } from "../../../../../chunks/index2.js";
import "../../../../../chunks/constants.js";
import "../../../../../chunks/index4.js";
import "dequal";
import "../../../../../chunks/create.js";
import "dompurify";
import "marked";
/* empty css                                                                */
import { S as Spinner } from "../../../../../chunks/Spinner.js";
function Prompts($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head($$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Prompts"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
	</title>`);
        });
      });
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
function _page($$renderer) {
  Prompts($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
