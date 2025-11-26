import "clsx";
import { Z as getContext } from "../../../../../../chunks/context.js";
import "../../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import "../../../../../../chunks/client.js";
import "../../../../../../chunks/index2.js";
import "../../../../../../chunks/constants.js";
import "dompurify";
import "marked";
/* empty css                                                                   */
import { S as Spinner } from "../../../../../../chunks/Spinner.js";
import "../../../../../../chunks/index4.js";
import "yaml";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="flex items-center justify-center h-full"><div class="pb-16">`);
      Spinner($$renderer2, { className: "size-5" });
      $$renderer2.push(`<!----></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
