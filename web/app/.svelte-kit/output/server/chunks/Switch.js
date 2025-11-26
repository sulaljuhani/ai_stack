import { l as rest_props, s as store_get, m as attributes, u as unsubscribe_stores, b as bind_props, k as sanitize_props, h as slot, g as spread_props, o as stringify } from "./index.js";
import "dequal";
import { o as omit, m as makeElement, l as disabledAttr, e as executeCallbacks, a as addMeltEventListener, k as kbd, s as styleToString, c as createElHelpers } from "./create.js";
import { t as tick } from "./client.js";
import { W as setContext, Z as getContext, Y as fallback } from "./context.js";
import "clsx";
import { t as toWritableStores, o as overridable, c as createBitAttrs, r as removeUndefined, g as getOptionUpdater } from "./helpers.js";
import { w as writable } from "./exports.js";
import { h as settings } from "./index2.js";
import { T as Tooltip } from "./Tooltip.js";
const defaults = {
  defaultChecked: false,
  disabled: false,
  required: false,
  name: "",
  value: ""
};
const { name } = createElHelpers("switch");
function createSwitch(props) {
  const propsWithDefaults = { ...defaults, ...props };
  const options = toWritableStores(omit(propsWithDefaults, "checked"));
  const { disabled, required, name: nameStore, value } = options;
  const checkedWritable = propsWithDefaults.checked ?? writable(propsWithDefaults.defaultChecked);
  const checked = overridable(checkedWritable, propsWithDefaults?.onCheckedChange);
  function toggleSwitch() {
    if (disabled.get())
      return;
    checked.update((prev) => !prev);
  }
  const root = makeElement(name(), {
    stores: [checked, disabled, required],
    returned: ([$checked, $disabled, $required]) => {
      return {
        "data-disabled": disabledAttr($disabled),
        disabled: disabledAttr($disabled),
        "data-state": $checked ? "checked" : "unchecked",
        type: "button",
        role: "switch",
        "aria-checked": $checked ? "true" : "false",
        "aria-required": $required ? "true" : void 0
      };
    },
    action(node) {
      const unsub = executeCallbacks(addMeltEventListener(node, "click", () => {
        toggleSwitch();
      }), addMeltEventListener(node, "keydown", (e) => {
        if (e.key !== kbd.ENTER && e.key !== kbd.SPACE)
          return;
        e.preventDefault();
        toggleSwitch();
      }));
      return {
        destroy: unsub
      };
    }
  });
  const input = makeElement(name("input"), {
    stores: [checked, nameStore, required, disabled, value],
    returned: ([$checked, $name, $required, $disabled, $value]) => {
      return {
        type: "checkbox",
        "aria-hidden": true,
        hidden: true,
        tabindex: -1,
        name: $name,
        value: $value,
        checked: $checked,
        required: $required,
        disabled: disabledAttr($disabled),
        style: styleToString({
          position: "absolute",
          opacity: 0,
          "pointer-events": "none",
          margin: 0,
          transform: "translateX(-100%)"
        })
      };
    }
  });
  return {
    elements: {
      root,
      input
    },
    states: {
      checked
    },
    options
  };
}
function getSwitchData() {
  const NAME = "switch";
  const PARTS = ["root", "input", "thumb"];
  return {
    NAME,
    PARTS
  };
}
function setCtx(props) {
  const { NAME, PARTS } = getSwitchData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const Switch2 = { ...createSwitch(removeUndefined(props)), getAttrs };
  setContext(NAME, Switch2);
  return {
    ...Switch2,
    updateOption: getOptionUpdater(Switch2.options)
  };
}
function getCtx() {
  const { NAME } = getSwitchData();
  return getContext(NAME);
}
function Switch_input($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["el"]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let inputValue;
    let el = fallback($$props["el"], () => void 0, true);
    const {
      elements: { input },
      options: { value, name: name2, disabled, required }
    } = getCtx();
    inputValue = store_get($$store_subs ??= {}, "$value", value) === void 0 || store_get($$store_subs ??= {}, "$value", value) === "" ? "on" : store_get($$store_subs ??= {}, "$value", value);
    $$renderer2.push(`<input${attributes(
      {
        ...store_get($$store_subs ??= {}, "$input", input),
        name: store_get($$store_subs ??= {}, "$name", name2),
        disabled: store_get($$store_subs ??= {}, "$disabled", disabled),
        required: store_get($$store_subs ??= {}, "$required", required),
        value: inputValue,
        ...$$restProps
      },
      void 0,
      void 0,
      void 0,
      4
    )}/>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { el });
  });
}
function Switch($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "checked",
    "onCheckedChange",
    "disabled",
    "name",
    "value",
    "includeInput",
    "required",
    "asChild",
    "inputAttrs",
    "el"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let builder, attrs;
    let checked = fallback($$props["checked"], () => void 0, true);
    let onCheckedChange = fallback($$props["onCheckedChange"], () => void 0, true);
    let disabled = fallback($$props["disabled"], () => void 0, true);
    let name2 = fallback($$props["name"], () => void 0, true);
    let value = fallback($$props["value"], () => void 0, true);
    let includeInput = fallback($$props["includeInput"], true);
    let required = fallback($$props["required"], () => void 0, true);
    let asChild = fallback($$props["asChild"], false);
    let inputAttrs = fallback($$props["inputAttrs"], () => void 0, true);
    let el = fallback($$props["el"], () => void 0, true);
    const {
      elements: { root },
      states: { checked: localChecked },
      updateOption,
      getAttrs
    } = setCtx({
      disabled,
      name: name2,
      value,
      required,
      defaultChecked: checked,
      onCheckedChange: ({ next }) => {
        if (checked !== next) {
          onCheckedChange?.(next);
          checked = next;
        }
        return next;
      }
    });
    checked !== void 0 && localChecked.set(checked);
    updateOption("disabled", disabled);
    updateOption("name", name2);
    updateOption("value", value);
    updateOption("required", required);
    builder = store_get($$store_subs ??= {}, "$root", root);
    attrs = { ...getAttrs("root"), "data-checked": checked ? "" : void 0 };
    Object.assign(builder, attrs);
    if (asChild) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button${attributes({ ...builder, type: "button", ...$$restProps })}><!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (includeInput) {
      $$renderer2.push("<!--[-->");
      Switch_input($$renderer2, spread_props([inputAttrs]));
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      checked,
      onCheckedChange,
      disabled,
      name: name2,
      value,
      includeInput,
      required,
      asChild,
      inputAttrs,
      el
    });
  });
}
function Switch_thumb($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["asChild", "el"]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let attrs;
    let asChild = fallback($$props["asChild"], false);
    let el = fallback($$props["el"], () => void 0, true);
    const { states: { checked }, getAttrs } = getCtx();
    attrs = {
      ...getAttrs("thumb"),
      "data-state": store_get($$store_subs ??= {}, "$checked", checked) ? "checked" : "unchecked",
      "data-checked": store_get($$store_subs ??= {}, "$checked", checked) ? "" : void 0
    };
    if (asChild) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      slot(
        $$renderer2,
        $$props,
        "default",
        {
          attrs,
          checked: store_get($$store_subs ??= {}, "$checked", checked)
        },
        null
      );
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span${attributes({ ...$$restProps, ...attrs })}></span>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { asChild, el });
  });
}
function Switch_1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let state = fallback($$props["state"], true);
    let id = fallback($$props["id"], "");
    let ariaLabelledbyId = fallback($$props["ariaLabelledbyId"], "");
    let tooltip = fallback($$props["tooltip"], false);
    const i18n = getContext("i18n");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Tooltip($$renderer3, {
        content: typeof tooltip === "string" ? tooltip : typeof tooltip === "boolean" && tooltip ? state ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Enabled") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Disabled") : "",
        placement: "top",
        children: ($$renderer4) => {
          Switch($$renderer4, {
            id,
            "aria-labelledby": ariaLabelledbyId,
            class: `flex h-[1.125rem] min-h-[1.125rem] w-8 shrink-0 cursor-pointer items-center rounded-full px-1 mx-[1px] transition  ${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "focus:outline focus:outline-2 focus:outline-gray-800 focus:dark:outline-gray-200" : "outline outline-1 outline-gray-100 dark:outline-gray-800")} ${stringify(state ? " bg-emerald-500 dark:bg-emerald-700" : "bg-gray-200 dark:bg-transparent")}`,
            onCheckedChange: async () => {
              await tick();
            },
            get checked() {
              return state;
            },
            set checked($$value) {
              state = $$value;
              $$settled = false;
            },
            children: ($$renderer5) => {
              Switch_thumb($$renderer5, {
                class: "pointer-events-none block size-3 shrink-0 rounded-full bg-white transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:shadow-mini "
              });
            },
            $$slots: { default: true }
          });
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
    bind_props($$props, { state, id, ariaLabelledbyId, tooltip });
  });
}
export {
  Switch_1 as S
};
//# sourceMappingURL=Switch.js.map
