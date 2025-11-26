import { b as bind_props } from "./index.js";
import { Z as getContext, Y as fallback } from "./context.js";
import "dompurify";
import "marked";
import "./constants.js";
function Banner($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let banner = fallback(
      $$props["banner"],
      () => ({
        id: "",
        type: "info",
        title: "",
        content: "",
        url: "",
        dismissible: true,
        timestamp: Math.floor(Date.now() / 1e3)
      }),
      true
    );
    let className = fallback($$props["className"], "mx-2 px-2 rounded-lg");
    let dismissed = fallback($$props["dismissed"], false);
    if (!dismissed) {
      $$renderer2.push("<!--[-->");
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { banner, className, dismissed });
  });
}
export {
  Banner as B
};
//# sourceMappingURL=Banner.js.map
