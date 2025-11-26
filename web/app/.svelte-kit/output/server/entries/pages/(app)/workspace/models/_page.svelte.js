import { n as head, j as escape_html, s as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import { W as WEBUI_NAME, m as models } from "../../../../../chunks/index2.js";
import "../../../../../chunks/constants.js";
import "../../../../../chunks/index4.js";
import "yaml";
import { a as toast } from "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "clsx";
import "marked";
import { Z as getContext } from "../../../../../chunks/context.js";
import "sortablejs";
import "file-saver";
import "../../../../../chunks/client.js";
import { a as getModelItems, b as getModelTags } from "../../../../../chunks/index9.js";
import "dequal";
import "../../../../../chunks/create.js";
import "dompurify";
/* empty css                                                                */
import { S as Spinner } from "../../../../../chunks/Spinner.js";
function Models($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let tags = [];
    let selectedTag = "";
    let query = "";
    let viewOption = "";
    let page = 1;
    let models$1 = null;
    let total = null;
    const getModelList = async () => {
      try {
        const res = await getModelItems(localStorage.token, query, viewOption, selectedTag, null, null, page).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        if (res) {
          models$1 = res.items;
          total = res.total;
          tags = await getModelTags(localStorage.token).catch((error) => {
            toast.error(`${error}`);
            return [];
          });
        }
      } catch (err) {
        /* @__PURE__ */ console.error(err);
      }
    };
    {
      getModelList();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head($$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>
		${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Models"))} • ${escape_html(store_get($$store_subs ??= {}, "$WEBUI_NAME", WEBUI_NAME))}
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
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    if (store_get($$store_subs ??= {}, "$models", models) !== null) {
      $$renderer2.push("<!--[-->");
      Models($$renderer2);
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
