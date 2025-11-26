import { c as attr_class, d as clsx, a as attr, j as escape_html, s as store_get, u as unsubscribe_stores, b as bind_props } from "./index.js";
import { Z as getContext, Y as fallback } from "./context.js";
import { h as settings } from "./index2.js";
function SensitiveInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = fallback($$props["id"], "password-input");
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], "");
    let type = fallback($$props["type"], "text");
    let required = fallback($$props["required"], true);
    let readOnly = fallback($$props["readOnly"], false);
    let outerClassName = fallback($$props["outerClassName"], "flex flex-1 bg-transparent");
    let inputClassName = fallback($$props["inputClassName"], "w-full text-sm py-0.5 bg-transparent");
    let showButtonClassName = fallback($$props["showButtonClassName"], "pl-1.5  transition bg-transparent");
    let show = false;
    $$renderer2.push(`<div${attr_class(clsx(outerClassName))}><label class="sr-only"${attr("for", id)}>${escape_html(placeholder || store_get($$store_subs ??= {}, "$i18n", i18n).t("Password"))}</label> <input${attr("id", id)}${attr_class(`${inputClassName} ${"password"} ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "placeholder:text-gray-700 dark:placeholder:text-gray-100" : " outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-600"}`)}${attr("placeholder", placeholder)}${attr("type", type === "password" && !show ? "password" : "text")}${attr("value", value)}${attr("required", required && !readOnly, true)}${attr("disabled", readOnly, true)} autocomplete="off"/> <button${attr_class(clsx(showButtonClassName))} type="button"${attr("aria-pressed", show)}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Make password visible in the user interface"))}>`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4" aria-hidden="true"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path fill-rule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></button></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      value,
      placeholder,
      type,
      required,
      readOnly,
      outerClassName,
      inputClassName,
      showButtonClassName
    });
  });
}
export {
  SensitiveInput as S
};
//# sourceMappingURL=SensitiveInput.js.map
