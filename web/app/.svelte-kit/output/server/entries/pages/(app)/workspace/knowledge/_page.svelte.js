import "clsx";
import { n as head, j as escape_html, s as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import Fuse from "fuse.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { t as tick } from "../../../../../chunks/client.js";
import "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { W as WEBUI_NAME } from "../../../../../chunks/index2.js";
import "../../../../../chunks/constants.js";
import "../../../../../chunks/index4.js";
import "dompurify";
import "marked";
/* empty css                                                                */
import "dequal";
import "../../../../../chunks/create.js";
import { S as Spinner } from "../../../../../chunks/Spinner.js";
import { Z as getContext } from "../../../../../chunks/context.js";
function Knowledge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    const i18n = getContext("i18n");
    let viewOption = "";
    let knowledgeBases = [];
    let items = [];
    const setFuse = async () => {
      items = knowledgeBases.filter((item) => viewOption === "");
      new Fuse(items, {
        keys: [
          "name",
          "description",
          "user.name",
          // Ensures Fuse looks into item.user.name
          "user.email"
          // Ensures Fuse looks into item.user.email
        ],
        threshold: 0.3
      });
      await tick();
    };
    if (knowledgeBases.length > 0 && viewOption !== void 0) {
      setFuse();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head($$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Knowledge"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
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
  Knowledge($$renderer);
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
