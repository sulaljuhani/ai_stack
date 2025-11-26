import { c as attr_class, j as escape_html, b as bind_props, o as stringify } from "./index.js";
import { Y as fallback } from "./context.js";
function Badge($$renderer, $$props) {
  let type = fallback($$props["type"], "info");
  let content = fallback($$props["content"], "");
  const classNames = {
    info: "bg-blue-500/20 text-blue-700 dark:text-blue-200 ",
    success: "bg-green-500/20 text-green-700 dark:text-green-200",
    warning: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-200",
    error: "bg-red-500/20 text-red-700 dark:text-red-200",
    muted: "bg-gray-500/20 text-gray-700 dark:text-gray-200"
  };
  $$renderer.push(`<div${attr_class(` text-xs font-semibold ${stringify(classNames[type] ?? classNames["info"])} w-fit px-2 rounded-sm uppercase line-clamp-1 mr-0.5`)}>${escape_html(content)}</div>`);
  bind_props($$props, { type, content });
}
export {
  Badge as B
};
//# sourceMappingURL=Badge.js.map
