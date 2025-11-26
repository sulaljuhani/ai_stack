import { a as attr, c as attr_class, d as clsx, b as bind_props } from "./index.js";
import { Y as fallback } from "./context.js";
function Sidebar($$renderer, $$props) {
  let className = fallback($$props["className"], "size-5");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><rect x="3" y="3" width="18" height="18" rx="5" ry="5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"></rect><path d="M9.5 21V3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  Sidebar as S
};
//# sourceMappingURL=Sidebar.js.map
