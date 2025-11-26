import { a as attr, c as attr_class, d as clsx, j as escape_html, b as bind_props } from "./index.js";
import { Y as fallback } from "./context.js";
function Textarea($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], "");
    let rows = fallback($$props["rows"], 1);
    let minSize = fallback($$props["minSize"], null);
    let maxSize = fallback($$props["maxSize"], null);
    let required = fallback($$props["required"], false);
    let readonly = fallback($$props["readonly"], false);
    let className = fallback($$props["className"], "w-full rounded-lg px-3.5 py-2 text-sm bg-gray-50 dark:text-gray-300 dark:bg-gray-850 outline-hidden  h-full");
    let onInput = fallback($$props["onInput"], () => {
    });
    let onBlur = fallback($$props["onBlur"], () => {
    });
    $$renderer2.push(`<textarea${attr("placeholder", placeholder)}${attr_class(clsx(className))} style="field-sizing: content;"${attr("rows", rows)}${attr("required", required, true)}${attr("readonly", readonly, true)}>`);
    const $$body = escape_html(value);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea>`);
    bind_props($$props, {
      value,
      placeholder,
      rows,
      minSize,
      maxSize,
      required,
      readonly,
      className,
      onInput,
      onBlur
    });
  });
}
export {
  Textarea as T
};
//# sourceMappingURL=Textarea.js.map
