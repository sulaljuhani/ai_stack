import { a as attr, c as attr_class, d as clsx, b as bind_props } from "./index.js";
import { Y as fallback } from "./context.js";
function Plus($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "2");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))} aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
export {
  Plus as P
};
//# sourceMappingURL=Plus.js.map
