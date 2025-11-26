import { h as slot, s as store_get, u as unsubscribe_stores, b as bind_props, l as rest_props, m as attributes, k as sanitize_props, a as attr, c as attr_class, d as clsx, o as stringify, j as escape_html, f as attr_style, e as ensure_array_like, t as element } from "./index.js";
import { decode } from "html-entities";
import { v4 } from "uuid";
import { W as setContext, Z as getContext, Y as fallback } from "./context.js";
import dayjs from "dayjs";
import "dayjs/locale/af.js";
import "dayjs/locale/am.js";
import "dayjs/locale/ar.js";
import "dayjs/locale/az.js";
import "dayjs/locale/be.js";
import "dayjs/locale/bg.js";
import "dayjs/locale/bi.js";
import "dayjs/locale/bm.js";
import "dayjs/locale/bn.js";
import "dayjs/locale/bo.js";
import "dayjs/locale/br.js";
import "dayjs/locale/bs.js";
import "dayjs/locale/ca.js";
import "dayjs/locale/cs.js";
import "dayjs/locale/cv.js";
import "dayjs/locale/cy.js";
import "dayjs/locale/da.js";
import "dayjs/locale/de.js";
import "dayjs/locale/dv.js";
import "dayjs/locale/el.js";
import "dayjs/locale/en.js";
import "dayjs/locale/eo.js";
import "dayjs/locale/es.js";
import "dayjs/locale/eu.js";
import "dayjs/locale/fa.js";
import "dayjs/locale/fi.js";
import "dayjs/locale/fo.js";
import "dayjs/locale/fr.js";
import "dayjs/locale/fy.js";
import "dayjs/locale/ga.js";
import "dayjs/locale/gd.js";
import "dayjs/locale/gl.js";
import "dayjs/locale/gu.js";
import "dayjs/locale/he.js";
import "dayjs/locale/hi.js";
import "dayjs/locale/hr.js";
import "dayjs/locale/ht.js";
import "dayjs/locale/hu.js";
import "dayjs/locale/id.js";
import "dayjs/locale/is.js";
import "dayjs/locale/it.js";
import "dayjs/locale/ja.js";
import "dayjs/locale/jv.js";
import "dayjs/locale/ka.js";
import "dayjs/locale/kk.js";
import "dayjs/locale/km.js";
import "dayjs/locale/kn.js";
import "dayjs/locale/ko.js";
import "dayjs/locale/ku.js";
import "dayjs/locale/ky.js";
import "dayjs/locale/lb.js";
import "dayjs/locale/lo.js";
import "dayjs/locale/lt.js";
import "dayjs/locale/lv.js";
import "dayjs/locale/me.js";
import "dayjs/locale/mi.js";
import "dayjs/locale/mk.js";
import "dayjs/locale/ml.js";
import "dayjs/locale/mn.js";
import "dayjs/locale/mr.js";
import "dayjs/locale/ms.js";
import "dayjs/locale/mt.js";
import "dayjs/locale/my.js";
import "dayjs/locale/nb.js";
import "dayjs/locale/ne.js";
import "dayjs/locale/nl.js";
import "dayjs/locale/nn.js";
import "dayjs/locale/pl.js";
import "dayjs/locale/pt.js";
import "dayjs/locale/ro.js";
import "dayjs/locale/ru.js";
import "dayjs/locale/rw.js";
import "dayjs/locale/sd.js";
import "dayjs/locale/se.js";
import "dayjs/locale/si.js";
import "dayjs/locale/sk.js";
import "dayjs/locale/sl.js";
import "dayjs/locale/sq.js";
import "dayjs/locale/sr.js";
import "dayjs/locale/ss.js";
import "dayjs/locale/sv.js";
import "dayjs/locale/sw.js";
import "dayjs/locale/ta.js";
import "dayjs/locale/te.js";
import "dayjs/locale/tet.js";
import "dayjs/locale/tg.js";
import "dayjs/locale/th.js";
import "dayjs/locale/tk.js";
import "dayjs/locale/tlh.js";
import "dayjs/locale/tr.js";
import "dayjs/locale/tzl.js";
import "dayjs/locale/tzm.js";
import "dayjs/locale/uk.js";
import "dayjs/locale/ur.js";
import "dayjs/locale/uz.js";
import "dayjs/locale/vi.js";
import "dayjs/locale/yo.js";
import "dayjs/locale/zh.js";
import "dayjs/locale/zh-tw.js";
import "dayjs/locale/et.js";
import "dayjs/locale/en-gb.js";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { D as Download, C as ChevronUp } from "./Download.js";
import { o as overridable, t as toWritableStores, a as generateIds, b as derivedVisible, u as usePopper, e as getPortalDestination, s as sleep, c as createBitAttrs, r as removeUndefined, g as getOptionUpdater, h as getPositioningUpdater, C as ChevronDown } from "./helpers.js";
import { S as Spinner } from "./Spinner.js";
import "./Toaster.svelte_svelte_type_style_lang.js";
import { h as settings, n as config, o as channels, m as models, u as user } from "./index2.js";
import { W as WEBUI_BASE_URL } from "./constants.js";
import { A as renderVegaVisualization, B as initMermaid, C as renderMermaidDiagram, D as unescapeHtml, E as markedKatexExtension, F as markedExtension, G as replaceTokens, H as processResponseContent } from "./index4.js";
/* empty css                */
import "file-saver";
import "panzoom";
import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";
import { t as tick, o as onDestroy } from "./client.js";
import { basicSetup, EditorView } from "codemirror";
import { keymap, placeholder } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { acceptCompletion } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { LanguageDescription, indentUnit } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import "clsx";
import { T as Tooltip } from "./Tooltip.js";
import { h as html } from "./html.js";
import { X as XMark } from "./XMark.js";
import "dequal";
import { w as withGet, o as omit, m as makeElement, e as executeCallbacks, a as addMeltEventListener, s as styleToString, p as portalAttr, f as effect, h as safeOnMount, c as createElHelpers, q as isElement, r as isFocusVisible, t as isTouch, n as noop, i as isHTMLElement, b as isBrowser } from "./create.js";
import { w as writable, i as derived } from "./exports.js";
import { A as ArrowRightCircle } from "./ArrowRightCircle.js";
function getTabbableNodes(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  return nodes;
}
const { name } = createElHelpers("hover-card");
const defaults = {
  defaultOpen: false,
  openDelay: 1e3,
  closeDelay: 100,
  positioning: {
    placement: "bottom"
  },
  arrowSize: 8,
  closeOnOutsideClick: true,
  forceVisible: false,
  portal: void 0,
  closeOnEscape: true,
  onOutsideClick: void 0
};
const linkPreviewIdParts = ["trigger", "content"];
function createLinkPreview(props = {}) {
  const withDefaults = { ...defaults, ...props };
  const openWritable = withDefaults.open ?? writable(withDefaults.defaultOpen);
  const open = overridable(openWritable, withDefaults?.onOpenChange);
  const hasSelection = withGet.writable(false);
  const isPointerDownOnContent = withGet.writable(false);
  const containSelection = writable(false);
  const activeTrigger = writable(null);
  const options = toWritableStores(omit(withDefaults, "ids"));
  const { openDelay, closeDelay, positioning, arrowSize, closeOnOutsideClick, forceVisible, portal, closeOnEscape, onOutsideClick } = options;
  const ids = toWritableStores({ ...generateIds(linkPreviewIdParts), ...withDefaults.ids });
  let timeout = null;
  let originalBodyUserSelect;
  const handleOpen = withGet.derived(openDelay, ($openDelay) => {
    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      timeout = window.setTimeout(() => {
        open.set(true);
      }, $openDelay);
    };
  });
  const handleClose = withGet.derived([closeDelay, isPointerDownOnContent, hasSelection], ([$closeDelay, $isPointerDownOnContent, $hasSelection]) => {
    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      if (!$isPointerDownOnContent && !$hasSelection) {
        timeout = window.setTimeout(() => {
          open.set(false);
        }, $closeDelay);
      }
    };
  });
  const trigger = makeElement(name("trigger"), {
    stores: [open, ids.trigger, ids.content],
    returned: ([$open, $triggerId, $contentId]) => {
      return {
        role: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": $open,
        "data-state": $open ? "open" : "closed",
        "aria-controls": $contentId,
        id: $triggerId
      };
    },
    action: (node) => {
      const unsub = executeCallbacks(addMeltEventListener(node, "pointerenter", (e) => {
        if (isTouch(e))
          return;
        handleOpen.get()();
      }), addMeltEventListener(node, "pointerleave", (e) => {
        if (isTouch(e))
          return;
        handleClose.get()();
      }), addMeltEventListener(node, "focus", (e) => {
        if (!isElement(e.currentTarget) || !isFocusVisible(e.currentTarget))
          return;
        handleOpen.get()();
      }), addMeltEventListener(node, "blur", () => handleClose.get()()));
      return {
        destroy: unsub
      };
    }
  });
  const isVisible = derivedVisible({ open, forceVisible, activeTrigger });
  const content = makeElement(name("content"), {
    stores: [isVisible, portal, ids.content],
    returned: ([$isVisible, $portal, $contentId]) => {
      return {
        hidden: $isVisible ? void 0 : true,
        tabindex: -1,
        style: styleToString({
          "pointer-events": $isVisible ? void 0 : "none",
          opacity: $isVisible ? 1 : 0,
          userSelect: "text",
          WebkitUserSelect: "text"
        }),
        id: $contentId,
        "data-state": $isVisible ? "open" : "closed",
        "data-portal": portalAttr($portal)
      };
    },
    action: (node) => {
      let unsub = noop;
      const unsubTimers = () => {
        if (timeout) {
          window.clearTimeout(timeout);
        }
      };
      let unsubPopper = noop;
      const unsubDerived = effect([isVisible, activeTrigger, positioning, closeOnOutsideClick, portal, closeOnEscape], ([$isVisible, $activeTrigger, $positioning, $closeOnOutsideClick, $portal, $closeOnEscape]) => {
        unsubPopper();
        if (!$isVisible || !$activeTrigger)
          return;
        tick().then(() => {
          unsubPopper();
          unsubPopper = usePopper(node, {
            anchorElement: $activeTrigger,
            open,
            options: {
              floating: $positioning,
              modal: {
                closeOnInteractOutside: $closeOnOutsideClick,
                onClose: () => {
                  open.set(false);
                  $activeTrigger.focus();
                },
                shouldCloseOnInteractOutside: (e) => {
                  onOutsideClick.get()?.(e);
                  if (e.defaultPrevented)
                    return false;
                  if (isHTMLElement($activeTrigger) && $activeTrigger.contains(e.target))
                    return false;
                  return true;
                },
                open: $isVisible
              },
              portal: getPortalDestination(node, $portal),
              focusTrap: null,
              escapeKeydown: $closeOnEscape ? void 0 : null
            }
          }).destroy;
        });
      });
      unsub = executeCallbacks(addMeltEventListener(node, "pointerdown", (e) => {
        const currentTarget = e.currentTarget;
        const target = e.target;
        if (!isHTMLElement(currentTarget) || !isHTMLElement(target))
          return;
        if (currentTarget.contains(target)) {
          containSelection.set(true);
        }
        hasSelection.set(false);
        isPointerDownOnContent.set(true);
      }), addMeltEventListener(node, "pointerenter", (e) => {
        if (isTouch(e))
          return;
        handleOpen.get()();
      }), addMeltEventListener(node, "pointerleave", (e) => {
        if (isTouch(e))
          return;
        handleClose.get()();
      }), addMeltEventListener(node, "focusout", (e) => {
        e.preventDefault();
      }));
      return {
        destroy() {
          unsub();
          unsubPopper();
          unsubTimers();
          unsubDerived();
        }
      };
    }
  });
  const arrow = makeElement(name("arrow"), {
    stores: arrowSize,
    returned: ($arrowSize) => ({
      "data-arrow": true,
      style: styleToString({
        position: "absolute",
        width: `var(--arrow-size, ${$arrowSize}px)`,
        height: `var(--arrow-size, ${$arrowSize}px)`
      })
    })
  });
  effect([containSelection], ([$containSelection]) => {
    if (!isBrowser || !$containSelection)
      return;
    const body = document.body;
    const contentElement = document.getElementById(ids.content.get());
    if (!contentElement)
      return;
    originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;
    const originalContentUserSelect = contentElement.style.userSelect || contentElement.style.webkitUserSelect;
    body.style.userSelect = "none";
    body.style.webkitUserSelect = "none";
    contentElement.style.userSelect = "text";
    contentElement.style.webkitUserSelect = "text";
    return () => {
      body.style.userSelect = originalBodyUserSelect;
      body.style.webkitUserSelect = originalBodyUserSelect;
      contentElement.style.userSelect = originalContentUserSelect;
      contentElement.style.webkitUserSelect = originalContentUserSelect;
    };
  });
  safeOnMount(() => {
    const triggerEl = document.getElementById(ids.trigger.get());
    if (!triggerEl)
      return;
    activeTrigger.set(triggerEl);
  });
  effect([open], ([$open]) => {
    if (!isBrowser || !$open) {
      hasSelection.set(false);
      return;
    }
    const handlePointerUp = () => {
      containSelection.set(false);
      isPointerDownOnContent.set(false);
      sleep(1).then(() => {
        const isSelection = document.getSelection()?.toString() !== "";
        if (isSelection) {
          hasSelection.set(true);
        }
      });
    };
    document.addEventListener("pointerup", handlePointerUp);
    const contentElement = document.getElementById(ids.content.get());
    if (!contentElement)
      return;
    const tabbables = getTabbableNodes(contentElement);
    tabbables.forEach((tabbable) => tabbable.setAttribute("tabindex", "-1"));
    return () => {
      document.removeEventListener("pointerup", handlePointerUp);
      hasSelection.set(false);
      isPointerDownOnContent.set(false);
    };
  });
  return {
    ids,
    elements: {
      trigger,
      content,
      arrow
    },
    states: {
      open
    },
    options
  };
}
function getLinkPreviewData() {
  const NAME = "link-preview";
  const PARTS = ["arrow", "content", "trigger"];
  return {
    NAME,
    PARTS
  };
}
function setCtx(props) {
  const { NAME, PARTS } = getLinkPreviewData();
  const getAttrs = createBitAttrs(NAME, PARTS);
  const linkPreview = {
    ...createLinkPreview({
      ...removeUndefined(props),
      forceVisible: true
    }),
    getAttrs
  };
  setContext(NAME, linkPreview);
  return {
    ...linkPreview,
    updateOption: getOptionUpdater(linkPreview.options)
  };
}
function getCtx() {
  const { NAME } = getLinkPreviewData();
  return getContext(NAME);
}
function updatePositioning(props) {
  const defaultPlacement = {
    side: "bottom",
    align: "center"
  };
  const withDefaults = { ...defaultPlacement, ...props };
  const { options: { positioning } } = getCtx();
  const updater = getPositioningUpdater(positioning);
  updater(withDefaults);
}
function Link_preview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let open = fallback($$props["open"], () => void 0, true);
    let onOpenChange = fallback($$props["onOpenChange"], () => void 0, true);
    let openDelay = fallback($$props["openDelay"], 700);
    let closeDelay = fallback($$props["closeDelay"], 300);
    let closeOnOutsideClick = fallback($$props["closeOnOutsideClick"], () => void 0, true);
    let closeOnEscape = fallback($$props["closeOnEscape"], () => void 0, true);
    let portal = fallback($$props["portal"], () => void 0, true);
    let onOutsideClick = fallback($$props["onOutsideClick"], () => void 0, true);
    const { states: { open: localOpen }, updateOption, ids } = setCtx({
      defaultOpen: open,
      openDelay,
      closeDelay,
      closeOnOutsideClick,
      closeOnEscape,
      portal,
      onOutsideClick,
      onOpenChange: ({ next }) => {
        if (open !== next) {
          onOpenChange?.(next);
          open = next;
        }
        return next;
      }
    });
    const idValues = derived([ids.content, ids.trigger], ([$contentId, $triggerId]) => ({ content: $contentId, trigger: $triggerId }));
    open !== void 0 && localOpen.set(open);
    updateOption("openDelay", openDelay);
    updateOption("closeDelay", closeDelay);
    updateOption("closeOnOutsideClick", closeOnOutsideClick);
    updateOption("closeOnEscape", closeOnEscape);
    updateOption("portal", portal);
    updateOption("onOutsideClick", onOutsideClick);
    $$renderer2.push(`<!--[-->`);
    slot($$renderer2, $$props, "default", { ids: store_get($$store_subs ??= {}, "$idValues", idValues) }, null);
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      open,
      onOpenChange,
      openDelay,
      closeDelay,
      closeOnOutsideClick,
      closeOnEscape,
      portal,
      onOutsideClick
    });
  });
}
function Link_preview_content($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "transition",
    "transitionConfig",
    "inTransition",
    "inTransitionConfig",
    "outTransition",
    "outTransitionConfig",
    "asChild",
    "id",
    "side",
    "align",
    "sideOffset",
    "alignOffset",
    "collisionPadding",
    "avoidCollisions",
    "collisionBoundary",
    "sameWidth",
    "fitViewport",
    "strategy",
    "overlap",
    "el"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let builder;
    let transition = fallback($$props["transition"], () => void 0, true);
    let transitionConfig = fallback($$props["transitionConfig"], () => void 0, true);
    let inTransition = fallback($$props["inTransition"], () => void 0, true);
    let inTransitionConfig = fallback($$props["inTransitionConfig"], () => void 0, true);
    let outTransition = fallback($$props["outTransition"], () => void 0, true);
    let outTransitionConfig = fallback($$props["outTransitionConfig"], () => void 0, true);
    let asChild = fallback($$props["asChild"], false);
    let id = fallback($$props["id"], () => void 0, true);
    let side = fallback($$props["side"], "bottom");
    let align = fallback($$props["align"], "center");
    let sideOffset = fallback($$props["sideOffset"], 0);
    let alignOffset = fallback($$props["alignOffset"], 0);
    let collisionPadding = fallback($$props["collisionPadding"], 8);
    let avoidCollisions = fallback($$props["avoidCollisions"], true);
    let collisionBoundary = fallback($$props["collisionBoundary"], () => void 0, true);
    let sameWidth = fallback($$props["sameWidth"], false);
    let fitViewport = fallback($$props["fitViewport"], false);
    let strategy = fallback($$props["strategy"], "absolute");
    let overlap = fallback($$props["overlap"], false);
    let el = fallback($$props["el"], () => void 0, true);
    const { elements: { content }, states: { open }, ids, getAttrs } = getCtx();
    const attrs = getAttrs("content");
    if (id) {
      ids.content.set(id);
    }
    builder = store_get($$store_subs ??= {}, "$content", content);
    Object.assign(builder, attrs);
    if (store_get($$store_subs ??= {}, "$open", open)) {
      updatePositioning({
        side,
        align,
        sideOffset,
        alignOffset,
        collisionPadding,
        avoidCollisions,
        collisionBoundary,
        sameWidth,
        fitViewport,
        strategy,
        overlap
      });
    }
    if (asChild && store_get($$store_subs ??= {}, "$open", open)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (transition && store_get($$store_subs ??= {}, "$open", open)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
        slot($$renderer2, $$props, "default", { builder }, null);
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (inTransition && outTransition && store_get($$store_subs ??= {}, "$open", open)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
          slot($$renderer2, $$props, "default", { builder }, null);
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (inTransition && store_get($$store_subs ??= {}, "$open", open)) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
            slot($$renderer2, $$props, "default", { builder }, null);
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (outTransition && store_get($$store_subs ??= {}, "$open", open)) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
              slot($$renderer2, $$props, "default", { builder }, null);
              $$renderer2.push(`<!--]--></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (store_get($$store_subs ??= {}, "$open", open)) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
                slot($$renderer2, $$props, "default", { builder }, null);
                $$renderer2.push(`<!--]--></div>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      transition,
      transitionConfig,
      inTransition,
      inTransitionConfig,
      outTransition,
      outTransitionConfig,
      asChild,
      id,
      side,
      align,
      sideOffset,
      alignOffset,
      collisionPadding,
      avoidCollisions,
      collisionBoundary,
      sameWidth,
      fitViewport,
      strategy,
      overlap,
      el
    });
  });
}
function Link_preview_trigger($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["asChild", "id", "el"]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let builder;
    let asChild = fallback($$props["asChild"], false);
    let id = fallback($$props["id"], () => void 0, true);
    let el = fallback($$props["el"], () => void 0, true);
    const { elements: { trigger }, ids, getAttrs } = getCtx();
    const attrs = getAttrs("trigger");
    if (id) {
      ids.trigger.set(id);
    }
    builder = store_get($$store_subs ??= {}, "$trigger", trigger);
    Object.assign(builder, attrs);
    if (asChild) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<a${attributes({ ...builder, ...$$restProps, ...attrs })}><!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]--></a>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { asChild, id, el });
  });
}
function ImagePreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let show = fallback($$props["show"], false);
    let src = fallback($$props["src"], "");
    let alt = fallback($$props["alt"], "");
    getContext("i18n");
    let previewElement = null;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        /* @__PURE__ */ console.log("Escape");
        show = false;
      }
    };
    onDestroy(() => {
      show = false;
    });
    if (show && previewElement) {
      document.body.appendChild(previewElement);
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    if (show) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal fixed top-0 right-0 left-0 bottom-0 bg-black text-white w-full min-h-screen h-screen flex justify-center z-9999 overflow-hidden overscroll-contain"><div class="absolute left-0 w-full flex justify-between select-none z-20"><div><button class="p-5">`);
      XMark($$renderer2, { className: "size-6" });
      $$renderer2.push(`<!----></button></div> <div><button class="p-5 z-999"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"></path><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"></path></svg></button></div></div> <div class="flex h-full max-h-full justify-center items-center z-0"><img${attr("src", src)}${attr("alt", alt)} class="mx-auto h-full object-scale-down select-none" draggable="false"/></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { show, src, alt });
  });
}
function Image($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let src = fallback($$props["src"], "");
    let alt = fallback($$props["alt"], "");
    let className = fallback($$props["className"], () => ` w-full ${store_get($$store_subs ??= {}, "$settings", settings)?.highContrastMode ?? false ? "" : "outline-hidden focus:outline-hidden"}`, true);
    let imageClassName = fallback($$props["imageClassName"], "rounded-lg");
    let dismissible = fallback($$props["dismissible"], false);
    let onDismiss = fallback($$props["onDismiss"], () => {
    });
    const i18n = getContext("i18n");
    let _src = "";
    let showImagePreview = false;
    _src = src.startsWith("/") ? `${WEBUI_BASE_URL}${src}` : src;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ImagePreview($$renderer3, {
        src: _src,
        alt,
        get show() {
          return showImagePreview;
        },
        set show($$value) {
          showImagePreview = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="relative group w-fit flex items-center"><button${attr_class(clsx(className))}${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Show image preview"))} type="button"><img${attr("src", _src)}${attr("alt", alt)}${attr_class(clsx(imageClassName))} draggable="false" data-cy="image"/></button> `);
      if (dismissible) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="absolute -top-1 -right-1"><button${attr("aria-label", store_get($$store_subs ??= {}, "$i18n", i18n).t("Remove image"))} class="bg-white text-black border border-white rounded-full group-hover:visible invisible transition" type="button">`);
        XMark($$renderer3, { className: "size-4" });
        $$renderer3.push(`<!----></button></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { src, alt, className, imageClassName, dismissible, onDismiss });
  });
}
function CodeEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let boilerplate = fallback($$props["boilerplate"], "");
    let value = fallback($$props["value"], "");
    let onSave = fallback($$props["onSave"], () => {
    });
    let onChange = fallback($$props["onChange"], () => {
    });
    let _value = "";
    const updateValue = () => {
      if (_value !== value) {
        findChanges(_value, value);
        _value = value;
      }
    };
    function findChanges(oldStr, newStr) {
      let start = 0;
      while (start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start]) {
        start++;
      }
      if (oldStr === newStr) return [];
      let endOld = oldStr.length, endNew = newStr.length;
      while (endOld > start && endNew > start && oldStr[endOld - 1] === newStr[endNew - 1]) {
        endOld--;
        endNew--;
      }
      return [
        { from: start, to: endOld, insert: newStr.slice(start, endNew) }
      ];
    }
    let id = fallback($$props["id"], "");
    let lang = fallback($$props["lang"], "");
    let codeEditor;
    const focus = () => {
      codeEditor.focus();
    };
    let editorTheme = new Compartment();
    let editorLanguage = new Compartment();
    languages.push(LanguageDescription.of({
      name: "HCL",
      extensions: ["hcl", "tf"],
      load() {
        return import("codemirror-lang-hcl").then((m) => m.hcl());
      }
    }));
    languages.push(LanguageDescription.of({
      name: "Elixir",
      extensions: ["ex", "exs"],
      load() {
        return import("codemirror-lang-elixir").then((m) => m.elixir());
      }
    }));
    const getLang = async () => {
      const language = languages.find((l) => l.alias.includes(lang));
      return await language?.load();
    };
    const formatPythonCodeHandler = async () => {
      return false;
    };
    [
      basicSetup,
      keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
      indentUnit.of("    "),
      placeholder(store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter your code here...")),
      EditorView.updateListener.of((e) => {
        if (e.docChanged) {
          _value = e.state.doc.toString();
          onChange(_value);
        }
      }),
      editorTheme.of([]),
      editorLanguage.of([])
    ];
    const setLanguage = async () => {
      const language = await getLang();
      if (language && codeEditor) {
        codeEditor.dispatch({ effects: editorLanguage.reconfigure(language) });
      }
    };
    onDestroy(() => {
    });
    if (value) {
      updateValue();
    }
    if (lang) {
      setLanguage();
    }
    $$renderer2.push(`<div${attr("id", `code-textarea-${stringify(
      // Check if html class has dark mode
      // python code editor, highlight python code
      // listen to html class changes this should fire only when dark mode is toggled
      // Format code when Ctrl + Shift + F is pressed
      id
    )}`)} class="h-full w-full text-sm"></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      boilerplate,
      value,
      onSave,
      onChange,
      id,
      lang,
      focus,
      formatPythonCodeHandler
    });
  });
}
function Clipboard($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "2");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Reset($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "2");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function SVGPanZoom($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let className = fallback($$props["className"], "");
    let svg = fallback($$props["svg"], "");
    let content = fallback($$props["content"], "");
    $$renderer2.push(`<div${attr_class(`relative ${stringify(className)}`)}><div class="flex h-full max-h-full justify-center items-center">${html(DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      // allow <svg>, <defs>, <filter>, etc.
      WHOLE_DOCUMENT: false,
      ADD_TAGS: ["style", "foreignObject"],
      // include foreignObject if using HTML labels
      ADD_ATTR: [
        "class",
        "style",
        "id",
        "data-*",
        "viewBox",
        "preserveAspectRatio",
        // markers / arrows
        "markerWidth",
        "markerHeight",
        "markerUnits",
        "refX",
        "refY",
        "orient",
        // hrefs (for gradients, markers, etc.)
        "href",
        "xlink:href",
        // text positioning
        "dominant-baseline",
        "text-anchor",
        // pattern / clip / mask units
        "clipPathUnits",
        "filterUnits",
        "patternUnits",
        "patternContentUnits",
        "maskUnits",
        // a11y niceties
        "role",
        "aria-label",
        "aria-labelledby",
        "aria-hidden",
        "tabindex"
      ],
      SANITIZE_DOM: true
    }))}</div> `);
    if (content) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute top-2.5 right-2.5"><div class="flex gap-1">`);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Download as SVG"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="p-1.5 rounded-lg border border-gray-100 dark:border-none dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition">`);
          Download($$renderer3, { className: " size-4" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset view"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="p-1.5 rounded-lg border border-gray-100 dark:border-none dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition">`);
          Reset($$renderer3, { className: " size-4" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy to clipboard"),
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="p-1.5 rounded-lg border border-gray-100 dark:border-none dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 transition">`);
          Clipboard($$renderer3, { className: " size-4", strokeWidth: "1.5" });
          $$renderer3.push(`<!----></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { className, svg, content });
  });
}
function ChevronUpDown($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function CodeBlock($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = fallback($$props["id"], "");
    let edit = fallback($$props["edit"], true);
    let onSave = fallback($$props["onSave"], (e) => {
    });
    let onUpdate = fallback($$props["onUpdate"], (e) => {
    });
    let onPreview = fallback($$props["onPreview"], (e) => {
    });
    let save = fallback($$props["save"], false);
    let run = fallback($$props["run"], true);
    let preview = fallback($$props["preview"], false);
    let collapsed = fallback($$props["collapsed"], false);
    let token = $$props["token"];
    let lang = fallback($$props["lang"], "");
    let code = fallback($$props["code"], "");
    let attributes2 = fallback($$props["attributes"], () => ({}), true);
    let className = fallback($$props["className"], "mb-2");
    let editorClassName = fallback($$props["editorClassName"], "");
    let stickyButtonsClassName = fallback($$props["stickyButtonsClassName"], "top-0");
    let _code = "";
    const updateCode = () => {
      _code = code;
    };
    let _token = null;
    let renderHTML = null;
    let renderError = null;
    let stdout = null;
    let stderr = null;
    let result = null;
    let files = null;
    let saved = false;
    const saveCode = () => {
      saved = true;
      code = _code;
      onSave(code);
      setTimeout(
        () => {
          saved = false;
        },
        1e3
      );
    };
    const checkPythonCode = (str) => {
      const pythonSyntax = [
        "def ",
        "else:",
        "elif ",
        "try:",
        "except:",
        "finally:",
        "yield ",
        "lambda ",
        "assert ",
        "nonlocal ",
        "del ",
        "True",
        "False",
        "None",
        " and ",
        " or ",
        " not ",
        " in ",
        " is ",
        " with "
      ];
      for (let syntax of pythonSyntax) {
        if (str.includes(syntax)) {
          return true;
        }
      }
      return false;
    };
    let mermaid = null;
    const renderMermaid = async (code2) => {
      if (!mermaid) {
        mermaid = await initMermaid();
      }
      return await renderMermaidDiagram(mermaid, code2);
    };
    const render = async () => {
      onUpdate(token);
      if (lang === "mermaid" && (token?.raw ?? "").slice(-4).includes("```")) {
        try {
          renderHTML = await renderMermaid(code);
        } catch (error) {
          /* @__PURE__ */ console.error("Failed to render mermaid diagram:", error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          renderError = store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to render diagram") + `: ${errorMsg}`;
          renderHTML = null;
        }
      } else if ((lang === "vega" || lang === "vega-lite") && (token?.raw ?? "").slice(-4).includes("```")) {
        try {
          renderHTML = await renderVegaVisualization(code);
        } catch (error) {
          /* @__PURE__ */ console.error("Failed to render Vega visualization:", error);
          const errorMsg = error instanceof Error ? error.message : String(error);
          renderError = store_get($$store_subs ??= {}, "$i18n", i18n).t("Failed to render visualization") + `: ${errorMsg}`;
          renderHTML = null;
        }
      }
    };
    const onAttributesUpdate = () => {
      if (attributes2?.output) {
        const unescapeHtml2 = (html2) => {
          const textArea = document.createElement("textarea");
          textArea.innerHTML = html2;
          return textArea.value;
        };
        try {
          const unescapedOutput = unescapeHtml2(attributes2.output);
          const output = JSON.parse(unescapedOutput);
          stdout = output.stdout;
          stderr = output.stderr;
          result = output.result;
        } catch (error) {
          /* @__PURE__ */ console.error("Error:", error);
        }
      }
    };
    onDestroy(() => {
    });
    if (code) {
      updateCode();
    }
    if (token) {
      if (JSON.stringify(token) !== JSON.stringify(_token)) {
        _token = token;
      }
    }
    if (_token) {
      render();
    }
    if (attributes2) {
      onAttributesUpdate();
    }
    $$renderer2.push(`<div><div${attr_class(`relative ${stringify(
      // Create a helper function to unescape HTML entities
      // Unescape the HTML-encoded string
      // Parse the unescaped string into JSON
      // Assign the parsed values to variables
      className
    )} flex flex-col rounded-3xl border border-gray-100 dark:border-gray-850 my-0.5`)} dir="ltr">`);
    if (["mermaid", "vega", "vega-lite"].includes(lang)) {
      $$renderer2.push("<!--[-->");
      if (renderHTML) {
        $$renderer2.push("<!--[-->");
        SVGPanZoom($$renderer2, {
          className: " rounded-3xl max-h-fit overflow-hidden",
          svg: renderHTML,
          content: _token.text
        });
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="p-3">`);
        if (renderError) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex gap-2.5 border px-4 py-3 border-red-600/10 bg-red-600/10 rounded-2xl mb-2">${escape_html(renderError)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <pre>${escape_html(code)}</pre></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="absolute left-0 right-0 py-2.5 pr-3 text-text-300 pl-4.5 text-xs font-medium dark:text-white">${escape_html(lang)}</div> <div${attr_class(`sticky ${stringify(stickyButtonsClassName)} left-0 right-0 py-2 pr-3 flex items-center justify-end w-full z-10 text-xs text-black dark:text-white`)}><div class="flex items-center gap-0.5"><button class="flex gap-1 items-center bg-none border-none transition rounded-md px-1.5 py-0.5 bg-white dark:bg-black"><div class="-translate-y-[0.5px]">`);
      ChevronUpDown($$renderer2, { className: "size-3" });
      $$renderer2.push(`<!----></div> <div>${escape_html(collapsed ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Expand") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Collapse"))}</div></button> `);
      if ((store_get($$store_subs ??= {}, "$config", config)?.features?.enable_code_execution ?? true) && (lang.toLowerCase() === "python" || lang.toLowerCase() === "py" || lang === "" && checkPythonCode(code))) {
        $$renderer2.push("<!--[-->");
        {
          $$renderer2.push("<!--[!-->");
          if (run) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button class="flex gap-1 items-center run-code-button bg-none border-none transition rounded-md px-1.5 py-0.5 bg-white dark:bg-black"><div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Run"))}</div></button>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (save) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="save-code-button bg-none border-none transition rounded-md px-1.5 py-0.5 bg-white dark:bg-black">${escape_html(saved ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Saved") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))}</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <button class="copy-code-button bg-none border-none transition rounded-md px-1.5 py-0.5 bg-white dark:bg-black">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"))}</button> `);
      if (preview && ["html", "svg"].includes(lang)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="flex gap-1 items-center run-code-button bg-none border-none transition rounded-md px-1.5 py-0.5 bg-white dark:bg-black"><div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Preview"))}</div></button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div${attr_class(`language-${stringify(lang)} rounded-t-3xl -mt-9 ${stringify(editorClassName ? editorClassName : stdout || stderr || result ? "" : "rounded-b-3xl")} overflow-hidden`)}><div class="pt-8 bg-white dark:bg-black"></div> `);
      if (!collapsed) {
        $$renderer2.push("<!--[-->");
        if (edit) {
          $$renderer2.push("<!--[-->");
          CodeEditor($$renderer2, {
            value: code,
            id,
            lang,
            onSave: () => {
              saveCode();
            },
            onChange: (value) => {
              _code = value;
            }
          });
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<pre class="hljs p-4 px-5 overflow-x-auto"${attr_style(`border-top-left-radius: 0px; border-top-right-radius: 0px; ${stringify((stdout || stderr || result) && "border-bottom-left-radius: 0px; border-bottom-right-radius: 0px;")}`)}><code${attr_class(`language-${stringify(lang)} rounded-t-none whitespace-pre text-sm`)}>${html(hljs.highlightAuto(code, hljs.getLanguage(lang)?.aliases).value || code)}</code></pre>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="bg-white dark:bg-black dark:text-white rounded-b-3xl! pt-0.5 pb-3 px-4 flex flex-col gap-2 text-xs"><span class="text-gray-500 italic">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("{{COUNT}} hidden lines", { COUNT: code.split("\n").length }))}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (!collapsed) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", `plt-canvas-${stringify(id)}`)} class="bg-gray-50 dark:bg-black dark:text-white max-w-full overflow-x-auto scrollbar-hidden"></div> `);
        if (stdout || stderr || result || files) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="bg-gray-50 dark:bg-black dark:text-white rounded-b-3xl! py-4 px-4 flex flex-col gap-2">`);
          {
            $$renderer2.push("<!--[!-->");
            if (stdout || stderr) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div><div class="text-gray-500 text-sm mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("STDOUT/STDERR"))}</div> <div${attr_class(`text-sm font-mono whitespace-pre-wrap ${stringify(stdout?.split("\n")?.length > 100 ? `max-h-96` : "")} overflow-y-auto`)}>${escape_html(stdout || stderr)}</div></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> `);
            if (result || files) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div><div class="text-gray-500 text-sm mb-1">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("RESULT"))}</div> `);
              if (result) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<div class="text-sm">${escape_html(`${JSON.stringify(result)}`)}</div>`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]--> `);
              {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]--></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      edit,
      onSave,
      onUpdate,
      onPreview,
      save,
      run,
      preview,
      collapsed,
      token,
      lang,
      code,
      attributes: attributes2,
      className,
      editorClassName,
      stickyButtonsClassName
    });
  });
}
const disableSingleTilde = {
  tokenizer: {
    del(src) {
      const doubleMatch = /^~~(?=\S)([\s\S]*?\S)~~/.exec(src);
      if (doubleMatch) {
        return {
          type: "del",
          raw: doubleMatch[0],
          text: doubleMatch[1],
          tokens: this.lexer.inlineTokens(doubleMatch[1])
        };
      }
      const singleMatch = /^~(?=\S)([\s\S]*?\S)~/.exec(src);
      if (singleMatch) {
        return {
          type: "text",
          raw: singleMatch[0],
          text: singleMatch[0]
          // include both tildes as literal text
        };
      }
      return false;
    }
  }
};
function escapeHtml$1(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}
function mentionStart(src) {
  return src.indexOf("<");
}
function mentionTokenizer(src, options = {}) {
  const trigger = options.triggerChar ?? "@";
  const re = new RegExp(`^<\\${trigger}([\\w.\\-:/]+)(?:\\|([^>]*))?>`);
  const m = re.exec(src);
  if (!m) return;
  const [, id, label] = m;
  return {
    type: "mention",
    raw: m[0],
    triggerChar: trigger,
    id,
    label: label && label.length > 0 ? label : id
  };
}
function mentionRenderer(token, options = {}) {
  const trigger = options.triggerChar ?? "@";
  const cls = options.className ?? "mention";
  const extra = options.extraAttrs ?? {};
  const attrs = Object.entries({
    class: cls,
    "data-type": "mention",
    "data-id": token.id,
    "data-mention-suggestion-char": trigger,
    ...extra
  }).map(([k, v]) => `${k}="${escapeHtml$1(String(v))}"`).join(" ");
  return `<span ${attrs}>${escapeHtml$1(trigger + token.label)}</span>`;
}
function mentionExtension(opts = {}) {
  return {
    name: "mention",
    level: "inline",
    start: mentionStart,
    tokenizer(src) {
      return mentionTokenizer.call(this, src, opts);
    },
    renderer(token) {
      return mentionRenderer(token, opts);
    }
  };
}
function KatexRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let content = $$props["content"];
    let displayMode = fallback($$props["displayMode"], false);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { content, displayMode });
  });
}
function Source($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let id = $$props["id"];
    let title = fallback($$props["title"], "N/A");
    let onClick = fallback($$props["onClick"], () => {
    });
    function getDomain(url) {
      const domain = url.replace("http://", "").replace("https://", "").split(/[/?#]/)[0];
      if (domain.startsWith("www.")) {
        return domain.slice(4);
      }
      return domain;
    }
    function formattedTitle(title2) {
      if (title2.startsWith("http")) {
        return getDomain(title2);
      }
      return title2;
    }
    const getDisplayTitle = (title2) => {
      if (!title2) return "N/A";
      if (title2.length > 30) {
        return title2.slice(0, 15) + "..." + title2.slice(-10);
      }
      return title2;
    };
    if (title !== "N/A") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="text-[10px] w-fit translate-y-[2px] px-2 py-0.5 dark:bg-white/5 dark:text-white/80 dark:hover:text-white bg-gray-50 text-black/80 hover:text-black transition rounded-xl"><span class="line-clamp-1">${escape_html(getDisplayTitle(formattedTitle(decodeURIComponent(title))))}</span></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { id, title, onClick });
  });
}
function HTMLToken($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let id = $$props["id"];
    let token = $$props["token"];
    let html2 = null;
    if (token.type === "html" && token?.text) {
      html2 = DOMPurify.sanitize(token.text);
    } else {
      html2 = null;
    }
    if (token.type === "html") {
      $$renderer2.push("<!--[-->");
      if (html2 && html2.includes("<video")) {
        $$renderer2.push("<!--[-->");
        const video = html2.match(/<video[^>]*>([\s\S]*?)<\/video>/);
        const videoSrc = video && video[1];
        if (videoSrc) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<video class="w-full my-2"${attr("src", videoSrc.replaceAll("&amp;", "&"))} title="Video player" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" controls allowfullscreen></video>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${escape_html(token.text)}`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (html2 && html2.includes("<audio")) {
          $$renderer2.push("<!--[-->");
          const audio = html2.match(/<audio[^>]*>([\s\S]*?)<\/audio>/);
          const audioSrc = audio && audio[1];
          if (audioSrc) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<audio class="w-full my-2"${attr("src", audioSrc.replaceAll("&amp;", "&"))} title="Audio player" controls></audio>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`${escape_html(token.text)}`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (token.text && token.text.match(/<iframe\s+[^>]*src="https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?[^"]*)?"[^>]*><\/iframe>/)) {
            $$renderer2.push("<!--[-->");
            const match = token.text.match(/<iframe\s+[^>]*src="https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?[^"]*)?"[^>]*><\/iframe>/);
            const ytId = match && match[1];
            if (ytId) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<iframe class="w-full aspect-video my-2"${attr("src", `https://www.youtube.com/embed/${ytId}`)} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (token.text && token.text.includes("<iframe")) {
              $$renderer2.push("<!--[-->");
              const match = token.text.match(/<iframe\s+[^>]*src="([^"]+)"[^>]*><\/iframe>/);
              const iframeSrc = match && match[1];
              if (iframeSrc) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<iframe class="w-full my-2"${attr("src", iframeSrc)} title="Embedded content" frameborder="0" sandbox=""></iframe>`);
              } else {
                $$renderer2.push("<!--[!-->");
                $$renderer2.push(`${escape_html(token.text)}`);
              }
              $$renderer2.push(`<!--]-->`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (token.text && token.text.includes("<status")) {
                $$renderer2.push("<!--[-->");
                const match = token.text.match(/<status title="([^"]+)" done="(true|false)" ?\/?>/);
                const statusTitle = match && match[1];
                const statusDone = match && match[2] === "true";
                if (statusTitle) {
                  $$renderer2.push("<!--[-->");
                  $$renderer2.push(`<div class="flex flex-col justify-center -space-y-0.5"><div${attr_class(`${stringify(statusDone === false ? "shimmer" : "")} text-gray-500 dark:text-gray-500 line-clamp-1 text-wrap`)}>${escape_html(statusTitle)}</div></div>`);
                } else {
                  $$renderer2.push("<!--[!-->");
                  $$renderer2.push(`${escape_html(token.text)}`);
                }
                $$renderer2.push(`<!--]-->`);
              } else {
                $$renderer2.push("<!--[!-->");
                if (token.text.includes(`<file type="html"`)) {
                  $$renderer2.push("<!--[-->");
                  const match = token.text.match(/<file type="html" id="([^"]+)"/);
                  const fileId = match && match[1];
                  if (fileId) {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<iframe class="w-full my-2"${attr("src", `${WEBUI_BASE_URL}/api/v1/files/${fileId}/content/html`)} title="Content" frameborder="0"${attr("sandbox", `allow-scripts allow-downloads${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowForms ?? false ? " allow-forms" : "")}${stringify(store_get($$store_subs ??= {}, "$settings", settings)?.iframeSandboxAllowSameOrigin ?? false ? " allow-same-origin" : "")}`)} referrerpolicy="strict-origin-when-cross-origin" allowfullscreen width="100%"></iframe>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                  }
                  $$renderer2.push(`<!--]-->`);
                } else {
                  $$renderer2.push("<!--[!-->");
                  if (token.text.trim().match(/^<br\s*\/?>$/i)) {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<br/>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                    $$renderer2.push(`${escape_html(token.text)}`);
                  }
                  $$renderer2.push(`<!--]-->`);
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { id, token });
  });
}
function TextToken($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let token = $$props["token"];
    let done = fallback($$props["done"], true);
    let texts = [];
    texts = (token?.raw ?? "").split(" ");
    if (done) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(token?.raw)}`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(texts);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let text = each_array[$$index];
        $$renderer2.push(`<span>${escape_html(text)} </span>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { token, done });
  });
}
function CodespanToken($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let token = $$props["token"];
    let done = fallback($$props["done"], true);
    if (done) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<code class="codespan cursor-pointer">${escape_html(unescapeHtml(token.text))}</code>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<code class="codespan cursor-pointer">${escape_html(unescapeHtml(token.text))}</code>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { token, done });
  });
}
function UserStatusLinkPreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let id = fallback($$props["id"], null);
    let side = fallback($$props["side"], "top");
    let align = fallback($$props["align"], "start");
    let sideOffset = fallback($$props["sideOffset"], 6);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { id, side, align, sideOffset });
  });
}
function MentionToken($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let token = $$props["token"];
    let triggerChar = "";
    let label = "";
    let idType = null;
    let id = "";
    const init = () => {
      const _id = token?.id;
      const parts = _id?.split(":");
      if (parts) {
        idType = parts[0];
        id = parts.slice(1).join(":");
      } else {
        idType = null;
        id = _id;
      }
      label = token?.label ?? id;
      triggerChar = token?.triggerChar ?? "@";
      if (triggerChar === "#") {
        if (idType === "C") {
          const channel = store_get($$store_subs ??= {}, "$channels", channels).find((c) => c.id === id);
          if (channel) {
            label = channel.name;
          } else {
            label = store_get($$store_subs ??= {}, "$i18n", i18n).t("Unknown");
          }
        }
      } else if (triggerChar === "@") {
        if (idType === "U") ;
        else if (idType === "M") {
          const model = store_get($$store_subs ??= {}, "$models", models).find((m) => m.id === id);
          if (model) {
            label = model.name;
          } else {
            label = store_get($$store_subs ??= {}, "$i18n", i18n).t("Unknown");
          }
        }
      }
    };
    if (token) {
      init();
    }
    Link_preview($$renderer2, {
      openDelay: (
        // split by : and take first part as idType and second part as id
        // in case id contains ':'
        // Channel
        // Thread
        // User
        // Model
        0
      ),
      closeDelay: 0,
      children: ($$renderer3) => {
        Link_preview_trigger($$renderer3, {
          class: " cursor-pointer no-underline! font-normal! ",
          children: ($$renderer4) => {
            $$renderer4.push(`<span class="mention">${escape_html(triggerChar)}${escape_html(label)}</span>`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        if (triggerChar === "@" && idType === "U") {
          $$renderer3.push("<!--[-->");
          UserStatusLinkPreview($$renderer3, { id });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { token });
  });
}
function SourceToken($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let id = $$props["id"];
    let token = $$props["token"];
    let sourceIds = fallback($$props["sourceIds"], () => [], true);
    let onClick = fallback($$props["onClick"], () => {
    });
    let containerElement;
    let openPreview = false;
    function getDomain(url) {
      const domain = url.replace("http://", "").replace("https://", "").split(/[/?#]/)[0];
      if (domain.startsWith("www.")) {
        return domain.slice(4);
      }
      return domain;
    }
    function formattedTitle(title) {
      if (title.startsWith("http")) {
        return getDomain(title);
      }
      return title;
    }
    const getDisplayTitle = (title) => {
      if (!title) return "N/A";
      if (title.length > 30) {
        return title.slice(0, 15) + "..." + title.slice(-10);
      }
      return title;
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if ((token?.ids ?? []).length == 1) {
        $$renderer3.push("<!--[-->");
        Source($$renderer3, {
          id: token.ids[0] - 1,
          title: sourceIds[token.ids[0] - 1],
          onClick
        });
      } else {
        $$renderer3.push("<!--[!-->");
        Link_preview($$renderer3, {
          openDelay: 0,
          get open() {
            return openPreview;
          },
          set open($$value) {
            openPreview = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            Link_preview_trigger($$renderer4, {
              children: ($$renderer5) => {
                $$renderer5.push(`<button class="text-[10px] w-fit translate-y-[2px] px-2 py-0.5 dark:bg-white/5 dark:text-white/80 dark:hover:text-white bg-gray-50 text-black/80 hover:text-black transition rounded-xl"><span class="line-clamp-1">${escape_html(getDisplayTitle(formattedTitle(decodeURIComponent(sourceIds[token.ids[0] - 1]))))} <span class="dark:text-white/50 text-black/50">+${escape_html((token?.ids ?? []).length - 1)}</span></span></button>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            Link_preview_content($$renderer4, {
              class: "z-[999]",
              align: "start",
              strategy: "fixed",
              sideOffset: 6,
              el: containerElement,
              children: ($$renderer5) => {
                $$renderer5.push(`<div class="bg-gray-50 dark:bg-gray-850 rounded-xl p-1 cursor-pointer"><!--[-->`);
                const each_array = ensure_array_like(token.ids);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let sourceId = each_array[$$index];
                  $$renderer5.push(`<div>`);
                  Source($$renderer5, { id: sourceId - 1, title: sourceIds[sourceId - 1], onClick });
                  $$renderer5.push(`<!----></div>`);
                }
                $$renderer5.push(`<!--]--></div>`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { id, token, sourceIds, onClick });
  });
}
function MarkdownInlineTokens($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let id = $$props["id"];
    let done = fallback($$props["done"], true);
    let tokens = $$props["tokens"];
    let sourceIds = fallback($$props["sourceIds"], () => [], true);
    let onSourceClick = fallback($$props["onSourceClick"], () => {
    });
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(tokens);
    for (let tokenIdx = 0, $$length = each_array.length; tokenIdx < $$length; tokenIdx++) {
      let token = each_array[tokenIdx];
      if (token.type === "escape") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`${escape_html(unescapeHtml(token.text))}`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (token.type === "html") {
          $$renderer2.push("<!--[-->");
          HTMLToken($$renderer2, { id, token, onSourceClick });
        } else {
          $$renderer2.push("<!--[!-->");
          if (token.type === "link") {
            $$renderer2.push("<!--[-->");
            if (token.tokens) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<a${attr("href", token.href)} target="_blank" rel="nofollow"${attr("title", token.title)}>`);
              MarkdownInlineTokens($$renderer2, { id: `${id}-a`, tokens: token.tokens, onSourceClick, done });
              $$renderer2.push(`<!----></a>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<a${attr("href", token.href)} target="_blank" rel="nofollow"${attr("title", token.title)}>${escape_html(token.text)}</a>`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (token.type === "image") {
              $$renderer2.push("<!--[-->");
              Image($$renderer2, { src: token.href, alt: token.text });
            } else {
              $$renderer2.push("<!--[!-->");
              if (token.type === "strong") {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<strong>`);
                MarkdownInlineTokens($$renderer2, { id: `${id}-strong`, tokens: token.tokens, onSourceClick });
                $$renderer2.push(`<!----></strong>`);
              } else {
                $$renderer2.push("<!--[!-->");
                if (token.type === "em") {
                  $$renderer2.push("<!--[-->");
                  $$renderer2.push(`<em>`);
                  MarkdownInlineTokens($$renderer2, { id: `${id}-em`, tokens: token.tokens, onSourceClick });
                  $$renderer2.push(`<!----></em>`);
                } else {
                  $$renderer2.push("<!--[!-->");
                  if (token.type === "codespan") {
                    $$renderer2.push("<!--[-->");
                    CodespanToken($$renderer2, { token, done });
                  } else {
                    $$renderer2.push("<!--[!-->");
                    if (token.type === "br") {
                      $$renderer2.push("<!--[-->");
                      $$renderer2.push(`<br/>`);
                    } else {
                      $$renderer2.push("<!--[!-->");
                      if (token.type === "del") {
                        $$renderer2.push("<!--[-->");
                        $$renderer2.push(`<del>`);
                        MarkdownInlineTokens($$renderer2, { id: `${id}-del`, tokens: token.tokens, onSourceClick });
                        $$renderer2.push(`<!----></del>`);
                      } else {
                        $$renderer2.push("<!--[!-->");
                        if (token.type === "inlineKatex") {
                          $$renderer2.push("<!--[-->");
                          if (token.text) {
                            $$renderer2.push("<!--[-->");
                            KatexRenderer($$renderer2, { content: token.text, displayMode: false });
                          } else {
                            $$renderer2.push("<!--[!-->");
                          }
                          $$renderer2.push(`<!--]-->`);
                        } else {
                          $$renderer2.push("<!--[!-->");
                          if (token.type === "iframe") {
                            $$renderer2.push("<!--[-->");
                            $$renderer2.push(`<iframe${attr("src", `${stringify(WEBUI_BASE_URL)}/api/v1/files/${stringify(token.fileId)}/content`)}${attr("title", token.fileId)} width="100%" frameborder="0"></iframe>`);
                          } else {
                            $$renderer2.push("<!--[!-->");
                            if (token.type === "mention") {
                              $$renderer2.push("<!--[-->");
                              MentionToken($$renderer2, { token });
                            } else {
                              $$renderer2.push("<!--[!-->");
                              if (token.type === "footnote") {
                                $$renderer2.push("<!--[-->");
                                $$renderer2.push(`${html(DOMPurify.sanitize(`<sup class="footnote-ref footnote-ref-text">${token.escapedText}</sup>`) || "")}`);
                              } else {
                                $$renderer2.push("<!--[!-->");
                                if (token.type === "citation") {
                                  $$renderer2.push("<!--[-->");
                                  SourceToken($$renderer2, { id, token, sourceIds, onClick: onSourceClick });
                                } else {
                                  $$renderer2.push("<!--[!-->");
                                  if (token.type === "text") {
                                    $$renderer2.push("<!--[-->");
                                    TextToken($$renderer2, { token, done });
                                  } else {
                                    $$renderer2.push("<!--[!-->");
                                  }
                                  $$renderer2.push(`<!--]-->`);
                                }
                                $$renderer2.push(`<!--]-->`);
                              }
                              $$renderer2.push(`<!--]-->`);
                            }
                            $$renderer2.push(`<!--]-->`);
                          }
                          $$renderer2.push(`<!--]-->`);
                        }
                        $$renderer2.push(`<!--]-->`);
                      }
                      $$renderer2.push(`<!--]-->`);
                    }
                    $$renderer2.push(`<!--]-->`);
                  }
                  $$renderer2.push(`<!--]-->`);
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { id, done, tokens, sourceIds, onSourceClick });
  });
}
function Info($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Star($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function LightBulb($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Bolt($$renderer, $$props) {
  let className = fallback($$props["className"], "size-3");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
const alertStyles = {
  NOTE: { border: "border-sky-500", text: "text-sky-500", icon: Info },
  TIP: {
    border: "border-emerald-500",
    text: "text-emerald-500",
    icon: LightBulb
  },
  IMPORTANT: {
    border: "border-purple-500",
    text: "text-purple-500",
    icon: Star
  },
  WARNING: {
    border: "border-yellow-500",
    text: "text-yellow-500",
    icon: ArrowRightCircle
  },
  CAUTION: { border: "border-rose-500", text: "text-rose-500", icon: Bolt }
};
function alertComponent(token) {
  const regExpStr = `^(?:\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\\])\\s*?
*`;
  const regExp = new RegExp(regExpStr);
  const matches = token.text?.match(regExp);
  if (matches && matches.length) {
    const alertType = matches[1];
    const newText = token.text.replace(regExp, "");
    const newTokens = marked.lexer(newText);
    return { type: alertType, text: newText, tokens: newTokens };
  }
  return false;
}
function AlertRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let token = $$props["token"];
    let alert = $$props["alert"];
    let id = fallback($$props["id"], "");
    let tokenIdx = fallback($$props["tokenIdx"], 0);
    let onTaskClick = fallback($$props["onTaskClick"], void 0);
    let onSourceClick = fallback($$props["onSourceClick"], void 0);
    $$renderer2.push(`<div${attr_class(`border-l-4 pl-2.5 ${alertStyles[alert.type].border} my-0.5`)}><div${attr_class(`${stringify(alertStyles[alert.type].text)} items-center flex gap-1 py-1.5`)}><!---->`);
    alertStyles[alert.type].icon?.($$renderer2, { className: "inline-block size-4" });
    $$renderer2.push(`<!----> <span class="font-medium">${escape_html(alert.type)}</span></div> <div class="pb-2">`);
    MarkdownTokens($$renderer2, {
      id: `${id}-${tokenIdx}`,
      tokens: alert.tokens,
      onTaskClick,
      onSourceClick
    });
    $$renderer2.push(`<!----></div></div>`);
    bind_props($$props, { token, alert, id, tokenIdx, onTaskClick, onSourceClick });
  });
}
function MarkdownTokens($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let id = $$props["id"];
    let tokens = $$props["tokens"];
    let top = fallback($$props["top"], true);
    let attributes2 = fallback($$props["attributes"], () => ({}), true);
    let sourceIds = fallback($$props["sourceIds"], () => [], true);
    let done = fallback($$props["done"], true);
    let save = fallback($$props["save"], false);
    let preview = fallback($$props["preview"], false);
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let topPadding = fallback($$props["topPadding"], false);
    let onSave = fallback($$props["onSave"], () => {
    });
    let onUpdate = fallback($$props["onUpdate"], () => {
    });
    let onPreview = fallback($$props["onPreview"], () => {
    });
    let onTaskClick = fallback($$props["onTaskClick"], () => {
    });
    let onSourceClick = fallback($$props["onSourceClick"], () => {
    });
    const headerComponent = (depth) => {
      return "h" + depth;
    };
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(tokens);
    for (let tokenIdx = 0, $$length = each_array.length; tokenIdx < $$length; tokenIdx++) {
      let token = each_array[tokenIdx];
      if (token.type === "hr") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<hr class="border-gray-100 dark:border-gray-850"/>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (token.type === "heading") {
          $$renderer2.push("<!--[-->");
          element(
            $$renderer2,
            headerComponent(token.depth),
            () => {
              $$renderer2.push(` dir="auto"`);
            },
            () => {
              MarkdownInlineTokens($$renderer2, {
                id: `${id}-${tokenIdx}-h`,
                tokens: token.tokens,
                done,
                sourceIds,
                onSourceClick
              });
            }
          );
        } else {
          $$renderer2.push("<!--[!-->");
          if (token.type === "code") {
            $$renderer2.push("<!--[-->");
            if (token.raw.includes("```")) {
              $$renderer2.push("<!--[-->");
              CodeBlock($$renderer2, {
                id: `${id}-${tokenIdx}`,
                collapsed: store_get($$store_subs ??= {}, "$settings", settings)?.collapseCodeBlocks ?? false,
                token,
                lang: token?.lang ?? "",
                code: token?.text ?? "",
                attributes: attributes2,
                save,
                preview,
                edit: editCodeBlock,
                stickyButtonsClassName: topPadding ? "top-7" : "top-0",
                onSave: (value) => {
                  onSave({ raw: token.raw, oldContent: token.text, newContent: value });
                },
                onUpdate,
                onPreview
              });
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`${escape_html(token.text)}`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (token.type === "table") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div class="relative w-full group mb-2"><div class="scrollbar-hidden relative overflow-x-auto max-w-full"><table class="w-full text-sm text-left text-gray-500 dark:text-gray-400 max-w-full rounded-xl"><thead class="text-xs text-gray-700 uppercase bg-white dark:bg-gray-900 dark:text-gray-400 border-none"><tr><!--[-->`);
              const each_array_1 = ensure_array_like(token.header);
              for (let headerIdx = 0, $$length2 = each_array_1.length; headerIdx < $$length2; headerIdx++) {
                let header = each_array_1[headerIdx];
                $$renderer2.push(`<th scope="col" class="px-2.5! py-2! cursor-pointer border-b border-gray-100! dark:border-gray-800!"${attr_style(token.align[headerIdx] ? "" : `text-align: ${token.align[headerIdx]}`)}><div class="gap-1.5 text-left"><div class="shrink-0 break-normal">`);
                MarkdownInlineTokens($$renderer2, {
                  id: `${id}-${tokenIdx}-header-${headerIdx}`,
                  tokens: header.tokens,
                  done,
                  sourceIds,
                  onSourceClick
                });
                $$renderer2.push(`<!----></div></div></th>`);
              }
              $$renderer2.push(`<!--]--></tr></thead><tbody><!--[-->`);
              const each_array_2 = ensure_array_like(token.rows);
              for (let rowIdx = 0, $$length2 = each_array_2.length; rowIdx < $$length2; rowIdx++) {
                let row = each_array_2[rowIdx];
                $$renderer2.push(`<tr class="bg-white dark:bg-gray-900 text-xs"><!--[-->`);
                const each_array_3 = ensure_array_like(row ?? []);
                for (let cellIdx = 0, $$length3 = each_array_3.length; cellIdx < $$length3; cellIdx++) {
                  let cell = each_array_3[cellIdx];
                  $$renderer2.push(`<td${attr_class(`px-3! py-2! text-gray-900 dark:text-white w-max ${stringify(token.rows.length - 1 === rowIdx ? "" : "border-b border-gray-50! dark:border-gray-850!")}`)}${attr_style(token.align[cellIdx] ? `text-align: ${token.align[cellIdx]}` : "")}><div class="break-normal">`);
                  MarkdownInlineTokens($$renderer2, {
                    id: `${id}-${tokenIdx}-row-${rowIdx}-${cellIdx}`,
                    tokens: cell.tokens,
                    done,
                    sourceIds,
                    onSourceClick
                  });
                  $$renderer2.push(`<!----></div></td>`);
                }
                $$renderer2.push(`<!--]--></tr>`);
              }
              $$renderer2.push(`<!--]--></tbody></table></div> <div class="absolute top-1 right-1.5 z-20 invisible group-hover:visible flex gap-0.5">`);
              Tooltip($$renderer2, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy"),
                children: ($$renderer3) => {
                  $$renderer3.push(`<button class="p-1 rounded-lg bg-transparent transition">`);
                  Clipboard($$renderer3, { className: " size-3.5", strokeWidth: "1.5" });
                  $$renderer3.push(`<!----></button>`);
                },
                $$slots: { default: true }
              });
              $$renderer2.push(`<!----> `);
              Tooltip($$renderer2, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Export to CSV"),
                children: ($$renderer3) => {
                  $$renderer3.push(`<button class="p-1 rounded-lg bg-transparent transition">`);
                  Download($$renderer3, { className: " size-3.5", strokeWidth: "1.5" });
                  $$renderer3.push(`<!----></button>`);
                },
                $$slots: { default: true }
              });
              $$renderer2.push(`<!----></div></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (token.type === "blockquote") {
                $$renderer2.push("<!--[-->");
                const alert = alertComponent(token);
                if (alert) {
                  $$renderer2.push("<!--[-->");
                  AlertRenderer($$renderer2, { token, alert });
                } else {
                  $$renderer2.push("<!--[!-->");
                  $$renderer2.push(`<blockquote dir="auto">`);
                  MarkdownTokens($$renderer2, {
                    id: `${id}-${tokenIdx}`,
                    tokens: token.tokens,
                    done,
                    editCodeBlock,
                    onTaskClick,
                    onSourceClick
                  });
                  $$renderer2.push(`<!----></blockquote>`);
                }
                $$renderer2.push(`<!--]-->`);
              } else {
                $$renderer2.push("<!--[!-->");
                if (token.type === "list") {
                  $$renderer2.push("<!--[-->");
                  if (token.ordered) {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<ol${attr("start", token.start || 1)} dir="auto"><!--[-->`);
                    const each_array_4 = ensure_array_like(token.items);
                    for (let itemIdx = 0, $$length2 = each_array_4.length; itemIdx < $$length2; itemIdx++) {
                      let item = each_array_4[itemIdx];
                      $$renderer2.push(`<li class="text-start">`);
                      if (item?.task) {
                        $$renderer2.push("<!--[-->");
                        $$renderer2.push(`<input class="translate-y-[1px] -translate-x-1" type="checkbox"${attr("checked", item.checked, true)}/>`);
                      } else {
                        $$renderer2.push("<!--[!-->");
                      }
                      $$renderer2.push(`<!--]--> `);
                      MarkdownTokens($$renderer2, {
                        id: `${id}-${tokenIdx}-${itemIdx}`,
                        tokens: item.tokens,
                        top: token.loose,
                        done,
                        editCodeBlock,
                        onTaskClick,
                        onSourceClick
                      });
                      $$renderer2.push(`<!----></li>`);
                    }
                    $$renderer2.push(`<!--]--></ol>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                    $$renderer2.push(`<ul dir="auto"><!--[-->`);
                    const each_array_5 = ensure_array_like(token.items);
                    for (let itemIdx = 0, $$length2 = each_array_5.length; itemIdx < $$length2; itemIdx++) {
                      let item = each_array_5[itemIdx];
                      $$renderer2.push(`<li${attr_class(`text-start ${stringify(item?.task ? "flex -translate-x-6.5 gap-3 " : "")}`)}>`);
                      if (item?.task) {
                        $$renderer2.push("<!--[-->");
                        $$renderer2.push(`<input type="checkbox"${attr("checked", item.checked, true)}/> <div>`);
                        MarkdownTokens($$renderer2, {
                          id: `${id}-${tokenIdx}-${itemIdx}`,
                          tokens: item.tokens,
                          top: token.loose,
                          done,
                          editCodeBlock,
                          onTaskClick,
                          onSourceClick
                        });
                        $$renderer2.push(`<!----></div>`);
                      } else {
                        $$renderer2.push("<!--[!-->");
                        MarkdownTokens($$renderer2, {
                          id: `${id}-${tokenIdx}-${itemIdx}`,
                          tokens: item.tokens,
                          top: token.loose,
                          done,
                          editCodeBlock,
                          onTaskClick,
                          onSourceClick
                        });
                        $$renderer2.push(`<!---->`);
                      }
                      $$renderer2.push(`<!--]--></li>`);
                    }
                    $$renderer2.push(`<!--]--></ul>`);
                  }
                  $$renderer2.push(`<!--]-->`);
                } else {
                  $$renderer2.push("<!--[!-->");
                  if (token.type === "details") {
                    $$renderer2.push("<!--[-->");
                    Collapsible($$renderer2, {
                      title: token.summary,
                      open: store_get($$store_subs ??= {}, "$settings", settings)?.expandDetails ?? false,
                      attributes: token?.attributes,
                      className: "w-full space-y-1",
                      dir: "auto",
                      $$slots: {
                        content: ($$renderer3) => {
                          $$renderer3.push(`<div class="mb-1.5" slot="content">`);
                          MarkdownTokens($$renderer3, {
                            id: `${id}-${tokenIdx}-d`,
                            tokens: marked.lexer(decode(token.text)),
                            attributes: token?.attributes,
                            done,
                            editCodeBlock,
                            onTaskClick,
                            onSourceClick
                          });
                          $$renderer3.push(`<!----></div>`);
                        }
                      }
                    });
                  } else {
                    $$renderer2.push("<!--[!-->");
                    if (token.type === "html") {
                      $$renderer2.push("<!--[-->");
                      HTMLToken($$renderer2, { id, token, onSourceClick });
                    } else {
                      $$renderer2.push("<!--[!-->");
                      if (token.type === "iframe") {
                        $$renderer2.push("<!--[-->");
                        $$renderer2.push(`<iframe${attr("src", `${stringify(WEBUI_BASE_URL)}/api/v1/files/${stringify(token.fileId)}/content`)}${attr("title", token.fileId)} width="100%" frameborder="0"></iframe>`);
                      } else {
                        $$renderer2.push("<!--[!-->");
                        if (token.type === "paragraph") {
                          $$renderer2.push("<!--[-->");
                          $$renderer2.push(`<p dir="auto">`);
                          MarkdownInlineTokens($$renderer2, {
                            id: `${id}-${tokenIdx}-p`,
                            tokens: token.tokens ?? [],
                            done,
                            sourceIds,
                            onSourceClick
                          });
                          $$renderer2.push(`<!----></p>`);
                        } else {
                          $$renderer2.push("<!--[!-->");
                          if (token.type === "text") {
                            $$renderer2.push("<!--[-->");
                            if (top) {
                              $$renderer2.push("<!--[-->");
                              $$renderer2.push(`<p>`);
                              if (token.tokens) {
                                $$renderer2.push("<!--[-->");
                                MarkdownInlineTokens($$renderer2, {
                                  id: `${id}-${tokenIdx}-t`,
                                  tokens: token.tokens,
                                  done,
                                  sourceIds,
                                  onSourceClick
                                });
                              } else {
                                $$renderer2.push("<!--[!-->");
                                $$renderer2.push(`${escape_html(unescapeHtml(token.text))}`);
                              }
                              $$renderer2.push(`<!--]--></p>`);
                            } else {
                              $$renderer2.push("<!--[!-->");
                              if (token.tokens) {
                                $$renderer2.push("<!--[-->");
                                MarkdownInlineTokens($$renderer2, {
                                  id: `${id}-${tokenIdx}-p`,
                                  tokens: token.tokens ?? [],
                                  done,
                                  sourceIds,
                                  onSourceClick
                                });
                              } else {
                                $$renderer2.push("<!--[!-->");
                                $$renderer2.push(`${escape_html(unescapeHtml(token.text))}`);
                              }
                              $$renderer2.push(`<!--]-->`);
                            }
                            $$renderer2.push(`<!--]-->`);
                          } else {
                            $$renderer2.push("<!--[!-->");
                            if (token.type === "inlineKatex") {
                              $$renderer2.push("<!--[-->");
                              if (token.text) {
                                $$renderer2.push("<!--[-->");
                                KatexRenderer($$renderer2, {
                                  content: token.text,
                                  displayMode: token?.displayMode ?? false
                                });
                              } else {
                                $$renderer2.push("<!--[!-->");
                              }
                              $$renderer2.push(`<!--]-->`);
                            } else {
                              $$renderer2.push("<!--[!-->");
                              if (token.type === "blockKatex") {
                                $$renderer2.push("<!--[-->");
                                if (token.text) {
                                  $$renderer2.push("<!--[-->");
                                  KatexRenderer($$renderer2, {
                                    content: token.text,
                                    displayMode: token?.displayMode ?? false
                                  });
                                } else {
                                  $$renderer2.push("<!--[!-->");
                                }
                                $$renderer2.push(`<!--]-->`);
                              } else {
                                $$renderer2.push("<!--[!-->");
                                if (token.type === "space") {
                                  $$renderer2.push("<!--[-->");
                                  $$renderer2.push(`<div class="my-2"></div>`);
                                } else {
                                  $$renderer2.push("<!--[!-->");
                                  $$renderer2.push(`${escape_html(/* @__PURE__ */ console.log("Unknown token", token))}`);
                                }
                                $$renderer2.push(`<!--]-->`);
                              }
                              $$renderer2.push(`<!--]-->`);
                            }
                            $$renderer2.push(`<!--]-->`);
                          }
                          $$renderer2.push(`<!--]-->`);
                        }
                        $$renderer2.push(`<!--]-->`);
                      }
                      $$renderer2.push(`<!--]-->`);
                    }
                    $$renderer2.push(`<!--]-->`);
                  }
                  $$renderer2.push(`<!--]-->`);
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      tokens,
      top,
      attributes: attributes2,
      sourceIds,
      done,
      save,
      preview,
      editCodeBlock,
      topPadding,
      onSave,
      onUpdate,
      onPreview,
      onTaskClick,
      onSourceClick
    });
  });
}
function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}
function footnoteExtension() {
  return {
    name: "footnote",
    level: "inline",
    start(src) {
      return src.search(/\[\^\s*[a-zA-Z0-9_-]+\s*\]/);
    },
    tokenizer(src) {
      const rule = /^\[\^\s*([a-zA-Z0-9_-]+)\s*\]/;
      const match = rule.exec(src);
      if (match) {
        const escapedText = escapeHtml(match[1]);
        return {
          type: "footnote",
          raw: match[0],
          text: match[1],
          escapedText
        };
      }
    }
  };
}
function footnoteExtension$1() {
  return {
    extensions: [footnoteExtension()]
  };
}
function citationExtension() {
  return {
    name: "citation",
    level: "inline",
    start(src) {
      return src.search(/\[(\d[\d,\s]*)\]/);
    },
    tokenizer(src) {
      if (/^\[\^/.test(src)) return;
      const rule = /^(\[(?:\d[\d,\s]*)\])+/;
      const match = rule.exec(src);
      if (!match) return;
      const raw = match[0];
      const groupRegex = /\[([\d,\s]+)\]/g;
      const ids = [];
      let m;
      while (m = groupRegex.exec(raw)) {
        const parsed = m[1].split(",").map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n));
        ids.push(...parsed);
      }
      return {
        type: "citation",
        raw,
        ids
        // merged list
      };
    },
    renderer(token) {
      return token.ids.join(",");
    }
  };
}
function citationExtension$1() {
  return {
    extensions: [citationExtension()]
  };
}
function Markdown($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let id = fallback($$props["id"], "");
    let content = $$props["content"];
    let done = fallback($$props["done"], true);
    let model = fallback($$props["model"], null);
    let save = fallback($$props["save"], false);
    let preview = fallback($$props["preview"], false);
    let editCodeBlock = fallback($$props["editCodeBlock"], true);
    let topPadding = fallback($$props["topPadding"], false);
    let sourceIds = fallback($$props["sourceIds"], () => [], true);
    let onSave = fallback($$props["onSave"], () => {
    });
    let onUpdate = fallback($$props["onUpdate"], () => {
    });
    let onPreview = fallback($$props["onPreview"], () => {
    });
    let onSourceClick = fallback($$props["onSourceClick"], () => {
    });
    let onTaskClick = fallback($$props["onTaskClick"], () => {
    });
    let tokens = [];
    const options = { throwOnError: false, breaks: true };
    marked.use(markedKatexExtension(options));
    marked.use(markedExtension(options));
    marked.use(citationExtension$1());
    marked.use(footnoteExtension$1());
    marked.use(disableSingleTilde);
    marked.use({
      extensions: [
        mentionExtension({ triggerChar: "@" }),
        mentionExtension({ triggerChar: "#" })
      ]
    });
    (async () => {
      if (content) {
        tokens = marked.lexer(replaceTokens(processResponseContent(content), model?.name, store_get($$store_subs ??= {}, "$user", user)?.name));
      }
    })();
    $$renderer2.push(`<!---->`);
    {
      MarkdownTokens($$renderer2, {
        tokens,
        id,
        done,
        save,
        preview,
        editCodeBlock,
        sourceIds,
        topPadding,
        onTaskClick,
        onSourceClick,
        onSave,
        onUpdate,
        onPreview
      });
    }
    $$renderer2.push(`<!---->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      content,
      done,
      model,
      save,
      preview,
      editCodeBlock,
      topPadding,
      sourceIds,
      onSave,
      onUpdate,
      onPreview,
      onSourceClick,
      onTaskClick
    });
  });
}
function FullHeightIframe($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let sandbox, isUrl;
    let src = fallback($$props["src"], null);
    let title = fallback($$props["title"], "Embedded Content");
    let initialHeight = fallback($$props["initialHeight"], null);
    let iframeClassName = fallback($$props["iframeClassName"], "w-full rounded-2xl");
    let args = fallback($$props["args"], null);
    let allowScripts = fallback($$props["allowScripts"], true);
    let allowForms = fallback($$props["allowForms"], false);
    let allowSameOrigin = fallback($$props["allowSameOrigin"], false);
    let allowPopups = fallback($$props["allowPopups"], false);
    let allowDownloads = fallback($$props["allowDownloads"], true);
    let referrerPolicy = fallback($$props["referrerPolicy"], "strict-origin-when-cross-origin");
    let allowFullscreen = fallback($$props["allowFullscreen"], true);
    let iframeSrc = null;
    let iframeDoc = null;
    const setIframeSrc = async () => {
      await tick();
      if (isUrl) {
        iframeSrc = src;
        iframeDoc = null;
      } else {
        iframeDoc = await processHtmlForDeps(src);
        iframeSrc = null;
      }
    };
    const alpineDirectives = [
      "x-data",
      "x-init",
      "x-show",
      "x-bind",
      "x-on",
      "x-text",
      "x-html",
      "x-model",
      "x-modelable",
      "x-ref",
      "x-for",
      "x-if",
      "x-effect",
      "x-transition",
      "x-cloak",
      "x-ignore",
      "x-teleport",
      "x-id"
    ];
    async function processHtmlForDeps(html2) {
      if (!allowSameOrigin) return html2;
      const scriptTags = [];
      const hasAlpineDirectives = alpineDirectives.some((dir) => html2.includes(dir));
      if (hasAlpineDirectives) {
        try {
          const { default: alpineCode } = await import("./cdn.min.js");
          const alpineBlob = new Blob([alpineCode], { type: "text/javascript" });
          const alpineUrl = URL.createObjectURL(alpineBlob);
          const alpineTag = `<script src="${alpineUrl}" defer><\/script>`;
          scriptTags.push(alpineTag);
        } catch (error) {
          /* @__PURE__ */ console.error("Error processing Alpine for iframe:", error);
        }
      }
      const chartJsDirectives = ["new Chart(", "Chart."];
      const hasChartJsDirectives = chartJsDirectives.some((dir) => html2.includes(dir));
      if (hasChartJsDirectives) {
        try {
          const { default: Chart } = await import("chart.js/auto");
          window.Chart = Chart;
          const chartTag = `<script>
window.Chart = parent.Chart; // Chart previously assigned on parent
<\/script>`;
          scriptTags.push(chartTag);
        } catch (error) {
          /* @__PURE__ */ console.error("Error processing Chart.js for iframe:", error);
        }
      }
      if (scriptTags.length === 0) return html2;
      const tags = scriptTags.join("\n");
      if (html2.includes("</head>")) {
        return html2.replace("</head>", `${tags}
</head>`);
      }
      if (html2.includes("</body>")) {
        return html2.replace("</body>", `${tags}
</body>`);
      }
      return `${tags}
${html2}`;
    }
    function onMessage(e) {
      return;
    }
    onDestroy(() => {
      window.removeEventListener("message", onMessage);
    });
    sandbox = [
      allowScripts && "allow-scripts",
      allowForms && "allow-forms",
      allowSameOrigin && "allow-same-origin",
      allowPopups && "allow-popups",
      allowDownloads && "allow-downloads"
    ].filter(Boolean).join(" ") || void 0;
    isUrl = typeof src === "string" && /^(https?:)?\/\//i.test(src);
    if (src) {
      setIframeSrc();
    }
    if (
      // Alpine directives detection
      // --- Alpine.js detection & injection ---
      // --- Chart.js detection & injection ---
      // import chartUrl from 'chart.js/auto?url';
      // If nothing to inject, return original HTML
      // Prefer injecting into <head>, then before </body>, otherwise prepend
      // Try to measure same-origin content safely
      // Cross-origin → rely on postMessage from inside the iframe
      // Handle height messages from the iframe (we also verify the sender)
      // When the iframe loads, try same-origin resize (cross-origin will noop)
      // if arguments are provided, inject them into the iframe window
      // Ensure event listener bound only while component lives
      iframeDoc
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<iframe${attr("srcdoc", iframeDoc)}${attr("title", title)}${attr_class(clsx(iframeClassName))}${attr_style(`${initialHeight ? `height:${initialHeight}px;` : ""}`)} width="100%" frameborder="0"${attr("sandbox", sandbox)}${attr("allowfullscreen", allowFullscreen, true)}></iframe>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (iframeSrc) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<iframe${attr("src", iframeSrc)}${attr("title", title)}${attr_class(clsx(iframeClassName))}${attr_style(`${initialHeight ? `height:${initialHeight}px;` : ""}`)} width="100%" frameborder="0"${attr("sandbox", sandbox)}${attr("referrerpolicy", referrerPolicy)}${attr("allowfullscreen", allowFullscreen, true)}></iframe>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      src,
      title,
      initialHeight,
      iframeClassName,
      args,
      allowScripts,
      allowForms,
      allowSameOrigin,
      allowPopups,
      allowDownloads,
      referrerPolicy,
      allowFullscreen
    });
  });
}
function Collapsible($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    dayjs.extend(duration);
    dayjs.extend(relativeTime);
    async function loadLocale(locales) {
      if (!locales || !Array.isArray(locales)) {
        return;
      }
      for (const locale of locales) {
        try {
          dayjs.locale(locale);
          break;
        } catch (error) {
          /* @__PURE__ */ console.error(`Could not load locale '${locale}':`, error);
        }
      }
    }
    let open = fallback($$props["open"], false);
    let className = fallback($$props["className"], "");
    let buttonClassName = fallback($$props["buttonClassName"], "w-fit text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition");
    let id = fallback($$props["id"], "");
    let title = fallback($$props["title"], null);
    let attributes2 = fallback($$props["attributes"], null);
    let chevron = fallback($$props["chevron"], false);
    let grow = fallback($$props["grow"], false);
    let disabled = fallback($$props["disabled"], false);
    let hide = fallback($$props["hide"], false);
    let onChange = fallback($$props["onChange"], () => {
    });
    const collapsibleId = v4();
    function parseJSONString(str) {
      try {
        return parseJSONString(JSON.parse(str));
      } catch (e) {
        return str;
      }
    }
    function formatJSONString(str) {
      try {
        const parsed = parseJSONString(str);
        if (typeof parsed === "object") {
          return JSON.stringify(parsed, null, 2);
        } else {
          return `${JSON.stringify(String(parsed))}`;
        }
      } catch (e) {
        return str;
      }
    }
    loadLocale(store_get($$store_subs ??= {}, "$i18n", i18n).languages);
    onChange(open);
    $$renderer2.push(`<div${attr("id", id)}${attr_class(clsx(className))}>`);
    if (attributes2?.type === "tool_calls") {
      $$renderer2.push("<!--[-->");
      const args = decode(attributes2?.arguments);
      const result = decode(attributes2?.result ?? "");
      const files = parseJSONString(decode(attributes2?.files ?? ""));
      const embeds = parseJSONString(decode(attributes2?.embeds ?? ""));
      if (embeds && Array.isArray(embeds) && embeds.length > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="py-1 w-full cursor-pointer"><div class="w-full text-xs text-gray-500"><div>${escape_html(attributes2.name)}</div></div> <!--[-->`);
        const each_array = ensure_array_like(embeds);
        for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
          let embed = each_array[idx];
          $$renderer2.push(`<div class="my-2"${attr("id", `${collapsibleId}-tool-calls-${attributes2?.id}-embed-${idx}`)}>`);
          FullHeightIframe($$renderer2, {
            src: embed,
            args,
            allowScripts: true,
            allowForms: true,
            allowSameOrigin: true,
            allowPopups: true
          });
          $$renderer2.push(`<!----></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div${attr_class(`${stringify(buttonClassName)} cursor-pointer`)}><div${attr_class(` w-full font-medium flex items-center justify-between gap-2 ${stringify(attributes2?.done && attributes2?.done !== "true" ? "shimmer" : "")} `)}>`);
        if (attributes2?.done && attributes2?.done !== "true") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div>`);
          Spinner($$renderer2, { className: "size-4" });
          $$renderer2.push(`<!----></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <div>`);
        if (attributes2?.done === "true") {
          $$renderer2.push("<!--[-->");
          Markdown($$renderer2, {
            id: `${collapsibleId}-tool-calls-${attributes2?.id}`,
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("View Result from **{{NAME}}**", { NAME: attributes2.name })
          });
        } else {
          $$renderer2.push("<!--[!-->");
          Markdown($$renderer2, {
            id: `${collapsibleId}-tool-calls-${attributes2?.id}-executing`,
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Executing **{{NAME}}**...", { NAME: attributes2.name })
          });
        }
        $$renderer2.push(`<!--]--></div> <div class="flex self-center translate-y-[1px]">`);
        if (open) {
          $$renderer2.push("<!--[-->");
          ChevronUp($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        } else {
          $$renderer2.push("<!--[!-->");
          ChevronDown($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        }
        $$renderer2.push(`<!--]--></div></div></div> `);
        if (!grow) {
          $$renderer2.push("<!--[-->");
          if (open && !hide) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div>`);
            if (attributes2?.type === "tool_calls") {
              $$renderer2.push("<!--[-->");
              if (attributes2?.done === "true") {
                $$renderer2.push("<!--[-->");
                Markdown($$renderer2, {
                  id: `${collapsibleId}-tool-calls-${attributes2?.id}-result`,
                  content: `> \`\`\`json
> ${formatJSONString(args)}
> ${formatJSONString(result)}
> \`\`\``
                });
              } else {
                $$renderer2.push("<!--[!-->");
                Markdown($$renderer2, {
                  id: `${collapsibleId}-tool-calls-${attributes2?.id}-result`,
                  content: `> \`\`\`json
> ${formatJSONString(args)}
> \`\`\``
                });
              }
              $$renderer2.push(`<!--]-->`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<!--[-->`);
              slot($$renderer2, $$props, "content", {}, null);
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      if (attributes2?.done === "true") {
        $$renderer2.push("<!--[-->");
        if (typeof files === "object") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(files ?? []);
          for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
            let file = each_array_1[idx];
            if (typeof file === "string") {
              $$renderer2.push("<!--[-->");
              if (file.startsWith("data:image/")) {
                $$renderer2.push("<!--[-->");
                Image($$renderer2, {
                  id: `${collapsibleId}-tool-calls-${attributes2?.id}-result-${idx}`,
                  src: file,
                  alt: "Image"
                });
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (typeof file === "object") {
                $$renderer2.push("<!--[-->");
                if (file.type === "image" && file.url) {
                  $$renderer2.push("<!--[-->");
                  Image($$renderer2, {
                    id: `${collapsibleId}-tool-calls-${attributes2?.id}-result-${idx}`,
                    src: file.url,
                    alt: "Image"
                  });
                } else {
                  $$renderer2.push("<!--[!-->");
                }
                $$renderer2.push(`<!--]-->`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (title !== null) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr_class(`${stringify(buttonClassName)} cursor-pointer`)}><div${attr_class(` w-full font-medium flex items-center justify-between gap-2 ${stringify(attributes2?.done && attributes2?.done !== "true" ? "shimmer" : "")} `)}>`);
        if (attributes2?.done && attributes2?.done !== "true") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div>`);
          Spinner($$renderer2, { className: "size-4" });
          $$renderer2.push(`<!----></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <div>`);
        if (attributes2?.type === "reasoning") {
          $$renderer2.push("<!--[-->");
          if (attributes2?.done === "true" && attributes2?.duration) {
            $$renderer2.push("<!--[-->");
            if (attributes2.duration < 1) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thought for less than a second"))}`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (attributes2.duration < 60) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thought for {{DURATION}} seconds", { DURATION: attributes2.duration }))}`);
              } else {
                $$renderer2.push("<!--[!-->");
                $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thought for {{DURATION}}", {
                  DURATION: dayjs.duration(attributes2.duration, "seconds").humanize()
                }))}`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Thinking..."))}`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (attributes2?.type === "code_interpreter") {
            $$renderer2.push("<!--[-->");
            if (attributes2?.done === "true") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Analyzed"))}`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Analyzing..."))}`);
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`${escape_html(title)}`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div> <div class="flex self-center translate-y-[1px]">`);
        if (open) {
          $$renderer2.push("<!--[-->");
          ChevronUp($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        } else {
          $$renderer2.push("<!--[!-->");
          ChevronDown($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div${attr_class(`${stringify(buttonClassName)} cursor-pointer`)}><div><div class="flex items-start justify-between"><!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]--> `);
        if (chevron) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex self-start translate-y-1">`);
          if (open) {
            $$renderer2.push("<!--[-->");
            ChevronUp($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
          } else {
            $$renderer2.push("<!--[!-->");
            ChevronDown($$renderer2, { strokeWidth: "3.5", className: "size-3.5" });
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> `);
        if (grow) {
          $$renderer2.push("<!--[-->");
          if (open && !hide) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div><!--[-->`);
            slot($$renderer2, $$props, "content", {}, null);
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (!grow) {
        $$renderer2.push("<!--[-->");
        if (open && !hide) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div><!--[-->`);
          slot($$renderer2, $$props, "content", {}, null);
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      open,
      className,
      buttonClassName,
      id,
      title,
      attributes: attributes2,
      chevron,
      grow,
      disabled,
      hide,
      onChange
    });
  });
}
export {
  Bolt as B,
  Collapsible as C,
  FullHeightIframe as F,
  Image as I,
  Link_preview as L,
  Markdown as M,
  SVGPanZoom as S,
  UserStatusLinkPreview as U,
  Clipboard as a,
  Link_preview_trigger as b,
  Info as c,
  CodeBlock as d,
  LightBulb as e
};
//# sourceMappingURL=Collapsible.js.map
