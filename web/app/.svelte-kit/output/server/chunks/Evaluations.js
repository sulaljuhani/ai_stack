import { s as store_get, u as unsubscribe_stores } from "./index.js";
import { Z as getContext } from "./context.js";
import "./client.js";
import { p as page } from "./stores.js";
import "./index2.js";
/* empty css                                    */
import "dompurify";
import "./constants.js";
import "./Toaster.svelte_svelte_type_style_lang.js";
import "clsx";
import "file-saver";
import "dayjs";
import "dayjs/plugin/relativeTime.js";
import "dequal";
import "./create.js";
function Evaluations($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    getContext("i18n");
    let selectedTab;
    const scrollToTab = (tabId) => {
      const tabElement = document.getElementById(tabId);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    };
    {
      const pathParts = store_get($$store_subs ??= {}, "$page", page).url.pathname.split("/");
      const tabFromPath = pathParts[pathParts.length - 1];
      selectedTab = ["leaderboard", "feedbacks"].includes(tabFromPath) ? tabFromPath : "leaderboard";
    }
    if (selectedTab) {
      scrollToTab(selectedTab);
    }
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  Evaluations as E
};
//# sourceMappingURL=Evaluations.js.map
