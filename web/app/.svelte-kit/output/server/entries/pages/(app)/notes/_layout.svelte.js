import { n as head, j as escape_html, s as store_get, u as unsubscribe_stores } from "../../../../chunks/index.js";
import { Z as getContext } from "../../../../chunks/context.js";
import { W as WEBUI_NAME } from "../../../../chunks/index2.js";
import "../../../../chunks/client.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    head($$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Notes"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
	</title>`);
      });
    });
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
