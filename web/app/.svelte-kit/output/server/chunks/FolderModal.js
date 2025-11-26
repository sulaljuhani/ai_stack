import { h as slot, s as store_get, u as unsubscribe_stores, b as bind_props, l as rest_props, m as attributes, k as sanitize_props, a as attr, c as attr_class, d as clsx, j as escape_html, o as stringify, e as ensure_array_like } from "./index.js";
import { i as derived } from "./exports.js";
import { s as setSubMenuCtx, g as getSubmenuCtx, u as updateSubPositioning, b as getSubTrigger, M as Menu_content, f as flyAndScale, a as Menu_item } from "./menu-trigger.js";
import { Y as fallback, Z as getContext } from "./context.js";
import "dequal";
import "./create.js";
import "clsx";
import { d as disabledAttrs } from "./helpers.js";
import { n as config, u as user } from "./index2.js";
import { a as toast } from "./Toaster.svelte_svelte_type_style_lang.js";
import { i as getChatById } from "./Messages.js";
import "./index4.js";
import { M as Modal } from "./Modal.js";
import { L as Link } from "./Link.js";
import { X as XMark } from "./XMark.js";
import { D as Dropdown } from "./Tags.js";
import { G as GarbageBin } from "./Emoji.js";
import { P as Pencil } from "./Pencil.js";
import { T as Tooltip } from "./Tooltip.js";
import { D as Download } from "./Download.js";
import { t as tick } from "./client.js";
import { T as Textarea } from "./Textarea.js";
import { a as WEBUI_API_BASE_URL } from "./constants.js";
import "dayjs";
import { a as FileItem } from "./FileItem.js";
const createNewFolder = async (token, folderForm) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(folderForm)
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getFolders = async (token = "") => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const getFolderById = async (token, id) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    }
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
const updateFolderById = async (token, id, folderForm) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/folders/${id}/update`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(folderForm)
  }).then(async (res2) => {
    if (!res2.ok) throw await res2.json();
    return res2.json();
  }).then((json) => {
    return json;
  }).catch((err) => {
    error = err.detail;
    return null;
  });
  if (error) {
    throw error;
  }
  return res;
};
function Menu_sub($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let disabled = fallback($$props["disabled"], () => void 0, true);
    let open = fallback($$props["open"], () => void 0, true);
    let onOpenChange = fallback($$props["onOpenChange"], () => void 0, true);
    const { updateOption, ids, states: { subOpen } } = setSubMenuCtx({
      disabled,
      onOpenChange: ({ next }) => {
        if (open !== next) {
          onOpenChange?.(next);
          open = next;
        }
        return next;
      }
    });
    const idValues = derived([ids.menu, ids.trigger], ([$menuId, $triggerId]) => ({ menu: $menuId, trigger: $triggerId }));
    open !== void 0 && subOpen.set(open);
    updateOption("disabled", disabled);
    $$renderer2.push(`<!--[-->`);
    slot(
      $$renderer2,
      $$props,
      "default",
      {
        subIds: store_get($$store_subs ??= {}, "$idValues", idValues)
      },
      null
    );
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { disabled, open, onOpenChange });
  });
}
function Menu_sub_content($$renderer, $$props) {
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
    let side = fallback($$props["side"], "right");
    let align = fallback($$props["align"], "start");
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
    const { elements: { subMenu }, states: { subOpen }, ids, getAttrs } = getSubmenuCtx();
    const attrs = getAttrs("sub-content");
    if (id) {
      ids.menu.set(id);
    }
    builder = store_get($$store_subs ??= {}, "$subMenu", subMenu);
    Object.assign(builder, attrs);
    updateSubPositioning({
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
    if (asChild && store_get($$store_subs ??= {}, "$subOpen", subOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (transition && store_get($$store_subs ??= {}, "$subOpen", subOpen)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
        slot($$renderer2, $$props, "default", { builder }, null);
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (inTransition && outTransition && store_get($$store_subs ??= {}, "$subOpen", subOpen)) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
          slot($$renderer2, $$props, "default", { builder }, null);
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (inTransition && store_get($$store_subs ??= {}, "$subOpen", subOpen)) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
            slot($$renderer2, $$props, "default", { builder }, null);
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (outTransition && store_get($$store_subs ??= {}, "$subOpen", subOpen)) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
              slot($$renderer2, $$props, "default", { builder }, null);
              $$renderer2.push(`<!--]--></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (store_get($$store_subs ??= {}, "$subOpen", subOpen)) {
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
function Menu_sub_trigger($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["disabled", "asChild", "id", "el"]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let builder, attrs;
    let disabled = fallback($$props["disabled"], false);
    let asChild = fallback($$props["asChild"], false);
    let id = fallback($$props["id"], () => void 0, true);
    let el = fallback($$props["el"], () => void 0, true);
    const { elements: { subTrigger }, ids, getAttrs, options } = getSubTrigger();
    const { disabled: disabledStore } = options;
    if (id) {
      ids.trigger.set(id);
    }
    builder = store_get($$store_subs ??= {}, "$subTrigger", subTrigger);
    attrs = {
      ...getAttrs("sub-trigger"),
      ...disabledAttrs(disabled || store_get($$store_subs ??= {}, "$disabledStore", disabledStore))
    };
    Object.assign(builder, attrs);
    if (asChild) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...builder, ...$$restProps })}><!--[-->`);
      slot($$renderer2, $$props, "default", { builder }, null);
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { disabled, asChild, id, el });
  });
}
function Share($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor" aria-hidden="true"${attr_class(clsx(className))}><path d="M20 13V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V13" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 15V3M12 3L8.5 6.5M12 3L15.5 6.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ShareChatModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let chatId = $$props["chatId"];
    let chat = null;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    const isDifferentChat = (_chat) => {
      if (!chat) {
        return true;
      }
      if (!_chat) {
        return false;
      }
      return chat.id !== _chat.id || chat.share_id !== _chat.share_id;
    };
    if (show) {
      (async () => {
        if (chatId) {
          const _chat = await getChatById(localStorage.token, chatId);
          if (isDifferentChat(_chat)) {
            chat = _chat;
          }
        } else {
          chat = null;
          /* @__PURE__ */ console.log(chat);
        }
      })();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "md",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-0.5"><div class="text-lg font-medium self-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Share Chat"))}</div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> `);
          if (chat) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="px-5 pt-4 pb-5 w-full flex flex-col justify-center"><div class="text-sm dark:text-gray-300 mb-1">`);
            if (chat.share_id) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<a${attr("href", `/s/${stringify(chat.share_id)}`)} target="_blank">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("You have shared this chat"))} <span class="underline">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("before"))}</span>.</a> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Click here to"))} <button class="underline">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("delete this link"))}</button> ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("and create a new shared link."))}`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Messages you send after creating your link won't be shared. Users with the URL will be able to view the shared chat."))}`);
            }
            $$renderer4.push(`<!--]--></div> <div class="flex justify-end"><div class="flex flex-col items-end space-x-1 mt-3"><div class="flex gap-1">`);
            if (store_get($$store_subs ??= {}, "$config", config)?.features.enable_community_sharing) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<button class="self-center flex items-center gap-1 px-3.5 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-850 dark:text-white dark:hover:bg-gray-800 transition rounded-full" type="button">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Share to Open WebUI Community"))}</button>`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]--> <button class="self-center flex items-center gap-1 px-3.5 py-2 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full" type="button" id="copy-and-share-chat-button">`);
            Link($$renderer4, {});
            $$renderer4.push(`<!----> `);
            if (chat.share_id) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Update and Copy Link"))}`);
            } else {
              $$renderer4.push("<!--[!-->");
              $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Copy Link"))}`);
            }
            $$renderer4.push(`<!--]--></button></div></div></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div>`);
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
    bind_props($$props, { chatId, show });
  });
}
function FolderMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let align = fallback($$props["align"], "start");
    let onEdit = fallback($$props["onEdit"], () => {
    });
    let onExport = fallback($$props["onExport"], () => {
    });
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let show = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Dropdown($$renderer3, {
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          Tooltip($$renderer4, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n).t("More"),
            children: ($$renderer5) => {
              $$renderer5.push(`<button><!--[-->`);
              slot($$renderer5, $$props, "default", {}, null);
              $$renderer5.push(`<!--]--></button>`);
            },
            $$slots: { default: true }
          });
        },
        $$slots: {
          default: true,
          content: ($$renderer4) => {
            $$renderer4.push(`<div slot="content">`);
            Menu_content($$renderer4, {
              class: "w-full max-w-[170px] rounded-2xl px-1 py-1 border border-gray-100  dark:border-gray-800   z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg",
              sideOffset: -2,
              side: "bottom",
              align,
              transition: flyAndScale,
              children: ($$renderer5) => {
                Menu_item($$renderer5, {
                  class: "flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl",
                  children: ($$renderer6) => {
                    Pencil($$renderer6, {});
                    $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex gap-2 items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl",
                  children: ($$renderer6) => {
                    Download($$renderer6, {});
                    $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Export"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Menu_item($$renderer5, {
                  class: "flex  gap-2  items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl",
                  children: ($$renderer6) => {
                    GarbageBin($$renderer6, {});
                    $$renderer6.push(`<!----> <div class="flex items-center">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Delete"))}</div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div>`);
          }
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { align, onEdit, onExport, onDelete });
  });
}
function Knowledge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let selectedItems = fallback($$props["selectedItems"], () => [], true);
    const i18n = getContext("i18n");
    $$renderer2.push(`<input type="file" hidden="" multiple/> <div><!--[-->`);
    slot($$renderer2, $$props, "label", {}, () => {
      $$renderer2.push(`<div class="mb-2"><div class="flex w-full justify-between mb-1"><div class="self-center text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Knowledge"))}</div></div> <div class="text-xs dark:text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t('To attach knowledge base here, add them to the "Knowledge" workspace first.'))}</div></div>`);
    });
    $$renderer2.push(`<!--]--> <div class="flex flex-col">`);
    if (selectedItems?.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex flex-wrap items-center gap-2 mb-2.5"><!--[-->`);
      const each_array = ensure_array_like(selectedItems);
      for (let fileIdx = 0, $$length = each_array.length; fileIdx < $$length; fileIdx++) {
        let file = each_array[fileIdx];
        FileItem($$renderer2, {
          file,
          item: file,
          name: file.name,
          modal: true,
          edit: true,
          loading: file.status === "uploading",
          type: file?.legacy ? `Legacy${file.type ? ` ${file.type}` : ""}` : file?.type ?? "collection",
          dismissible: true
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { selectedItems });
  });
}
function FolderModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let show = fallback($$props["show"], false);
    let onSubmit = fallback($$props["onSubmit"], (e) => {
    });
    let folderId = fallback($$props["folderId"], null);
    let edit = fallback($$props["edit"], false);
    let folder = null;
    let name = "";
    let meta = { background_image_url: null };
    let data = { system_prompt: "", files: [] };
    let loading = false;
    const init = async () => {
      if (folderId) {
        folder = await getFolderById(localStorage.token, folderId).catch((error) => {
          toast.error(`${error}`);
          return null;
        });
        name = folder.name;
        meta = folder.meta || { background_image_url: null };
        data = folder.data || { system_prompt: "", files: [] };
      }
      focusInput();
    };
    const focusInput = async () => {
      await tick();
      const input = document.getElementById("folder-name");
      if (input) {
        input.focus();
        input.select();
      }
    };
    if (show) {
      init();
    }
    if (!show && !edit) {
      name = "";
      meta = { background_image_url: null };
      data = { system_prompt: "", files: [] };
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Modal($$renderer3, {
        size: "md",
        get show() {
          return show;
        },
        set show($$value) {
          show = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div><div class="flex justify-between dark:text-gray-300 px-5 pt-4 pb-1"><div class="text-lg font-medium self-center">`);
          if (edit) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Edit Folder"))}`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Create Folder"))}`);
          }
          $$renderer4.push(`<!--]--></div> <button class="self-center">`);
          XMark($$renderer4, { className: "size-5" });
          $$renderer4.push(`<!----></button></div> <div class="flex flex-col md:flex-row w-full px-5 pb-4 md:space-x-4 dark:text-gray-200"><div class="flex flex-col w-full sm:flex-row sm:justify-center sm:space-x-6"><form class="flex flex-col w-full"><div class="flex flex-col w-full mt-1"><div class="mb-1 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder Name"))}</div> <div class="flex-1"><input id="folder-name" class="w-full text-sm bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-hidden" type="text"${attr("value", name)}${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Enter folder name"))} autocomplete="off"/></div></div> <input id="folder-background-image-input" type="file" hidden="" accept="image/*"/> <div class="flex justify-between w-full mt-1 items-center"><div class="text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Folder Background Image"))}</div> <div><button aria-labelledby="chat-background-label background-image-url-state" class="p-1 px-3 text-xs flex rounded-sm transition" type="button"><span class="ml-2 self-center" id="background-image-url-state">${escape_html((meta?.background_image_url ?? null) === null ? store_get($$store_subs ??= {}, "$i18n", i18n).t("Upload") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Reset"))}</span></button></div></div> <hr class="border-gray-50 dark:border-gray-850 my-2.5 w-full"/> `);
          if (store_get($$store_subs ??= {}, "$user", user)?.role === "admin" || (store_get($$store_subs ??= {}, "$user", user)?.permissions.chat?.system_prompt ?? true)) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="my-1"><div class="mb-2 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("System Prompt"))}</div> <div>`);
            Textarea($$renderer4, {
              className: " text-sm w-full bg-transparent outline-hidden ",
              placeholder: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write your model system prompt content here\ne.g.) You are Mario from Super Mario Bros, acting as an assistant."),
              maxSize: 200,
              get value() {
                return data.system_prompt;
              },
              set value($$value) {
                data.system_prompt = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> <div class="my-2">`);
          Knowledge($$renderer4, {
            get selectedItems() {
              return data.files;
            },
            set selectedItems($$value) {
              data.files = $$value;
              $$settled = false;
            },
            $$slots: {
              label: ($$renderer5) => {
                $$renderer5.push(`<div slot="label"><div class="flex w-full justify-between"><div class="mb-2 text-xs text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Knowledge"))}</div></div></div>`);
              }
            }
          });
          $$renderer4.push(`<!----></div> <div class="flex justify-end pt-3 text-sm font-medium gap-1.5"><button${attr_class(`px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-950 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full flex flex-row space-x-1 items-center ${stringify("")}`)} type="submit"${attr("disabled", loading, true)}>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Save"))} `);
          {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></button></div></form></div></div></div>`);
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
    bind_props($$props, { show, onSubmit, folderId, edit });
  });
}
export {
  FolderModal as F,
  Menu_sub as M,
  Share as S,
  Menu_sub_trigger as a,
  Menu_sub_content as b,
  ShareChatModal as c,
  FolderMenu as d,
  getFolders as e,
  createNewFolder as f,
  getFolderById as g,
  updateFolderById as u
};
//# sourceMappingURL=FolderModal.js.map
