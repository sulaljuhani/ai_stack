import { b as bind_props, h as slot, j as escape_html, s as store_get, u as unsubscribe_stores, c as attr_class, a as attr, o as stringify, e as ensure_array_like } from "./index.js";
import "dequal";
import "./create.js";
import { Z as getContext, Y as fallback } from "./context.js";
import "clsx";
import { c as Menu, d as Menu_trigger, M as Menu_content, f as flyAndScale, a as Menu_item } from "./menu-trigger.js";
import "./index2.js";
import "./Toaster.svelte_svelte_type_style_lang.js";
import { c as createEventDispatcher } from "./client.js";
import { T as Tooltip } from "./Tooltip.js";
import { X as XMark } from "./XMark.js";
function Dropdown($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let side = fallback($$props["side"], "bottom");
    let align = fallback($$props["align"], "start");
    let closeOnOutsideClick = fallback($$props["closeOnOutsideClick"], true);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Menu($$renderer3, {
        closeFocus: false,
        closeOnOutsideClick,
        onOpenChange: (state) => {
        },
        typeahead: false,
        get open() {
          return show;
        },
        set open($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Menu_trigger($$renderer4, {
            children: ($$renderer5) => {
              $$renderer5.push(`<!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!--[-->`);
          slot($$renderer4, $$props, "content", {}, () => {
            Menu_content($$renderer4, {
              class: "w-full max-w-[130px] rounded-lg p-1 border border-gray-900 z-50 bg-gray-850 text-white",
              sideOffset: 8,
              side,
              align,
              transition: flyAndScale,
              children: ($$renderer5) => {
                Menu_item($$renderer5, {
                  class: "flex items-center px-3 py-2 text-sm  font-medium",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Profile"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex items-center px-3 py-2 text-sm  font-medium",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Profile"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex items-center px-3 py-2 text-sm  font-medium",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Profile"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
          });
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { show, side, align, closeOnOutsideClick });
  });
}
function TagInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let label = fallback($$props["label"], "");
    let suggestionTags = fallback($$props["suggestionTags"], () => [], true);
    let showTagInput = false;
    $$renderer2.push(`<div${attr_class(`px-0.5 flex ${stringify("")}`)}>`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <button class="cursor-pointer self-center p-0.5 flex h-fit items-center rounded-full transition border dark:border-gray-600 border-dashed" type="button"${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Tag"))}><div class="m-auto self-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"${attr_class(`size-2.5 ${stringify("")} transition-all transform`)}><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"></path></svg></div></button> `);
    if (label && !showTagInput) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="text-xs pl-2 self-center">${escape_html(label)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { label, suggestionTags });
  });
}
function TagItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let tag = $$props["tag"];
    let onDelete = fallback($$props["onDelete"], () => {
    });
    if (tag) {
      $$renderer2.push("<!--[-->");
      Tooltip($$renderer2, {
        content: tag.name,
        children: ($$renderer3) => {
          $$renderer3.push(`<button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Remove this tag from list"))} class="relative group/tags px-1.5 py-[0.5px] gap-0.5 flex justify-between h-fit max-h-fit w-fit items-center rounded-lg bg-gray-500/20 text-gray-700 dark:text-gray-200 transition cursor-pointer"><div class="text-[0.7rem] font-medium self-center line-clamp-1 w-fit">${escape_html(tag.name)}</div> <div class="hidden group-hover/tags:block transition"><div class="rounded-full pl-[1px] backdrop-blur-sm h-full flex self-center cursor-pointer">`);
          XMark($$renderer3, { className: "size-3", strokeWidth: "2.5" });
          $$renderer3.push(`<!----></div></div></button>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { tag, onDelete });
  });
}
function TagList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    const dispatch = createEventDispatcher();
    let tags = fallback($$props["tags"], () => [], true);
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(tags);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tag = each_array[$$index];
      TagItem($$renderer2, {
        tag,
        onDelete: () => {
          dispatch("delete", tag.name);
        }
      });
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { tags });
  });
}
function Tags($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let tags = fallback($$props["tags"], () => [], true);
    let suggestionTags = fallback($$props["suggestionTags"], () => [], true);
    $$renderer2.push(`<ul class="flex flex-row flex-wrap gap-[0.3rem] line-clamp-1">`);
    TagList($$renderer2, { tags });
    $$renderer2.push(`<!----> `);
    TagInput($$renderer2, {
      label: tags.length == 0 ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Add Tags") : "",
      suggestionTags
    });
    $$renderer2.push(`<!----></ul>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { tags, suggestionTags });
  });
}
export {
  Dropdown as D,
  Tags as T
};
//# sourceMappingURL=Tags.js.map
