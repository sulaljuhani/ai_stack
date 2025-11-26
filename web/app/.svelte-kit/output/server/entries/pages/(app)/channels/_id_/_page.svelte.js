import { h as slot, b as bind_props, a as attr, c as attr_class, d as clsx, u as unsubscribe_stores, s as store_get, o as stringify, j as escape_html, e as ensure_array_like, n as head } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/stores.js";
import { o as onDestroy, t as tick, g as goto } from "../../../../../chunks/client.js";
import { a as toast } from "../../../../../chunks/Toaster.svelte_svelte_type_style_lang.js";
import { Z as getContext, Y as fallback } from "../../../../../chunks/context.js";
import "clsx";
import { E as EmojiPicker, c as getSessionUser, d as Pane_group, P as Pane, D as Drawer } from "../../../../../chunks/EmojiPicker.js";
import { u as user, h as settings, n as config, e as mobile, g as showSidebar, j as socket } from "../../../../../chunks/index2.js";
import { d as deleteMessage, a as updateMessage, r as removeReaction, b as addReaction, e as getChannelThreadMessages, s as sendMessage, f as getChannelById, h as getChannelMessages } from "../../../../../chunks/index5.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import { x as formatDate, e as extractInputVariables, b as getUserPosition, d as getAge, f as getFormattedDate, h as getFormattedTime, i as getCurrentDateTime, j as getUserTimezone, k as getWeekday, l as convertHeicToJpeg, n as compressImage } from "../../../../../chunks/index4.js";
import { a as WEBUI_API_BASE_URL } from "../../../../../chunks/constants.js";
import { L as Link_preview, b as Link_preview_trigger, U as UserStatusLinkPreview, M as Markdown, I as Image } from "../../../../../chunks/Collapsible.js";
import { C as ChatBubble, P as ProfileImage, N as Name, a as FileItem, S as Skeleton, L as Loader } from "../../../../../chunks/FileItem.js";
import { C as ConfirmDialog } from "../../../../../chunks/ConfirmDialog.js";
import { G as GarbageBin, E as Emoji, U as UserMenu } from "../../../../../chunks/Emoji.js";
import { P as Pencil } from "../../../../../chunks/Pencil.js";
import { T as Tooltip } from "../../../../../chunks/Tooltip.js";
import "dequal";
import "../../../../../chunks/create.js";
import { C as ChevronRight } from "../../../../../chunks/ChevronRight.js";
import { S as Spinner } from "../../../../../chunks/Spinner.js";
import { v4 } from "uuid";
import { u as uploadFile } from "../../../../../chunks/index11.js";
import "dompurify";
import "marked";
import "turndown";
import "@joplin/turndown-plugin-gfm";
import "../../../../../chunks/listDragHandlePlugin.js";
import "@tiptap/starter-kit";
import "@tiptap/extension-table";
import "@tiptap/extension-list";
import "@tiptap/extensions";
import "@tiptap/extension-file-handler";
import "@tiptap/extension-typography";
import "@tiptap/extension-highlight";
import "@tiptap/extension-code-block-lowlight";
import "@tiptap/extension-mention";
/* empty css                                                        */
import "panzoom";
import "file-saver";
/* empty css                                                           */
import { S as Sidebar } from "../../../../../chunks/Sidebar.js";
import { X as XMark } from "../../../../../chunks/XMark.js";
import { i as i18n } from "../../../../../chunks/index3.js";
function ProfilePreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("i18n");
    let user2 = fallback($$props["user"], null);
    Link_preview($$renderer2, {
      openDelay: 0,
      closeDelay: 0,
      children: ($$renderer3) => {
        Link_preview_trigger($$renderer3, {
          class: " cursor-pointer no-underline! font-normal! ",
          children: ($$renderer4) => {
            $$renderer4.push(`<!--[-->`);
            slot($$renderer4, $$props, "default", {}, null);
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        UserStatusLinkPreview($$renderer3, { id: user2?.id, side: "right", align: "center", sideOffset: 8 });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    bind_props($$props, { user: user2 });
  });
}
function FaceSmile($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function ArrowUpLeftAlt($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.25 4.75L6.75 8.25L10.25 11.75" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6.75 8.25L12.75 8.25C14.9591 8.25 16.75 10.0409 16.75 12.25V19.25" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Message($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    dayjs.extend(isToday);
    dayjs.extend(isYesterday);
    dayjs.extend(localizedFormat);
    const i18n2 = getContext("i18n");
    let message = $$props["message"];
    let showUserProfile = fallback($$props["showUserProfile"], true);
    let thread = fallback($$props["thread"], false);
    let replyToMessage = fallback($$props["replyToMessage"], false);
    let disabled = fallback($$props["disabled"], false);
    let onDelete = fallback($$props["onDelete"], () => {
    });
    let onEdit = fallback($$props["onEdit"], () => {
    });
    let onReply = fallback($$props["onReply"], () => {
    });
    let onThread = fallback($$props["onThread"], () => {
    });
    let onReaction = fallback($$props["onReaction"], () => {
    });
    let showButtons = false;
    let showDeleteConfirmDialog = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      ConfirmDialog($$renderer3, {
        title: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Delete Message"),
        message: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Are you sure you want to delete this message?"),
        onConfirm: async () => {
          await onDelete();
        },
        get show() {
          return showDeleteConfirmDialog;
        },
        set show($$value) {
          showDeleteConfirmDialog = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (message) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div${attr("id", `message-${stringify(message.id)}`)}${attr_class(
          `flex flex-col justify-between px-5 ${stringify(showUserProfile ? "pt-1.5 pb-0.5" : "")} w-full max-w-full mx-auto group hover:bg-gray-300/5 dark:hover:bg-gray-700/5 transition relative ${stringify(replyToMessage ? "border-l-4 border-blue-500 bg-blue-100/10 dark:bg-blue-100/5 pl-4" : "")} ${stringify((message?.reply_to_message?.meta?.model_id ?? message?.reply_to_message?.user_id) === store_get($$store_subs ??= {}, "$user", user)?.id ? "border-l-4 border-orange-500 bg-orange-100/10 dark:bg-orange-100/5 pl-4" : "")}`,
          "svelte-s6wdik"
        )}>`);
        if (!disabled) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div${attr_class(` absolute ${stringify(showButtons ? "" : "invisible group-hover:visible")} right-1 -top-2 z-10`, "svelte-s6wdik")}><div class="flex gap-1 rounded-lg bg-white dark:bg-gray-850 shadow-md p-0.5 border border-gray-100 dark:border-gray-850 svelte-s6wdik">`);
          EmojiPicker($$renderer3, {
            onClose: () => showButtons = false,
            onSubmit: (name) => {
              showButtons = false;
              onReaction(name);
            },
            children: ($$renderer4) => {
              Tooltip($$renderer4, {
                content: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Add Reaction"),
                children: ($$renderer5) => {
                  $$renderer5.push(`<button class="hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-lg p-1 svelte-s6wdik">`);
                  FaceSmile($$renderer5, {});
                  $$renderer5.push(`<!----></button>`);
                },
                $$slots: { default: true }
              });
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          Tooltip($$renderer3, {
            content: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Reply"),
            children: ($$renderer4) => {
              $$renderer4.push(`<button class="hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-lg p-0.5 svelte-s6wdik">`);
              ArrowUpLeftAlt($$renderer4, { className: "size-5" });
              $$renderer4.push(`<!----></button>`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----> `);
          if (!thread) {
            $$renderer3.push("<!--[-->");
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Reply in Thread"),
              children: ($$renderer4) => {
                $$renderer4.push(`<button class="hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-lg p-1 svelte-s6wdik">`);
                ChatBubble($$renderer4, {});
                $$renderer4.push(`<!----></button>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> `);
          if (message.user_id === store_get($$store_subs ??= {}, "$user", user)?.id || store_get($$store_subs ??= {}, "$user", user)?.role === "admin") {
            $$renderer3.push("<!--[-->");
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Edit"),
              children: ($$renderer4) => {
                $$renderer4.push(`<button class="hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-lg p-1 svelte-s6wdik">`);
                Pencil($$renderer4, {});
                $$renderer4.push(`<!----></button>`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----> `);
            Tooltip($$renderer3, {
              content: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Delete"),
              children: ($$renderer4) => {
                $$renderer4.push(`<button class="hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-lg p-1 svelte-s6wdik">`);
                GarbageBin($$renderer4, {});
                $$renderer4.push(`<!----></button>`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (message?.reply_to_message?.user) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="relative text-xs mb-1 svelte-s6wdik"><div class="absolute h-3 w-7 left-[18px] top-2 rounded-tl-lg border-t-[1.5px] border-l-[1.5px] border-gray-200 dark:border-gray-700 z-0 svelte-s6wdik"></div> <button class="ml-12 flex items-center space-x-2 relative z-0 svelte-s6wdik">`);
          if (message?.reply_to_message?.meta?.model_id) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${message.reply_to_message.meta.model_id}`)}${attr("alt", message.reply_to_message.meta.model_name ?? message.reply_to_message.meta.model_id)} class="size-4 ml-0.5 rounded-full object-cover svelte-s6wdik"/>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<img${attr("src", `${WEBUI_API_BASE_URL}/users/${message.reply_to_message.user?.id}/profile/image`)}${attr("alt", message.reply_to_message.user?.name ?? store_get($$store_subs ??= {}, "$i18n", i18n2).t("Unknown User"))} class="size-4 ml-0.5 rounded-full object-cover svelte-s6wdik"/>`);
          }
          $$renderer3.push(`<!--]--> <div class="shrink-0 svelte-s6wdik">${escape_html(message?.reply_to_message.meta?.model_name ?? message?.reply_to_message.user?.name ?? store_get($$store_subs ??= {}, "$i18n", i18n2).t("Unknown User"))}</div> <div class="italic text-sm text-gray-500 dark:text-gray-400 line-clamp-1 w-full flex-1 svelte-s6wdik">`);
          Markdown($$renderer3, {
            id: `${message.id}-reply-to`,
            content: message?.reply_to_message?.content
          });
          $$renderer3.push(`<!----></div></button></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <div${attr_class(` flex w-full message-${stringify(message.id)}`, "svelte-s6wdik")}${attr("id", `message-${stringify(message.id)}`)}${attr("dir", store_get($$store_subs ??= {}, "$settings", settings).chatDirection)}><div${attr_class(`shrink-0 mr-3 w-9`, "svelte-s6wdik")}>`);
        if (showUserProfile) {
          $$renderer3.push("<!--[-->");
          if (message?.meta?.model_id) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<img${attr("src", `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${message.meta.model_id}`)}${attr("alt", message.meta.model_name ?? message.meta.model_id)} class="size-8 translate-y-1 ml-0.5 object-cover rounded-full svelte-s6wdik"/>`);
          } else {
            $$renderer3.push("<!--[!-->");
            ProfilePreview($$renderer3, {
              user: message.user,
              children: ($$renderer4) => {
                ProfileImage($$renderer4, {
                  src: `${WEBUI_API_BASE_URL}/users/${message.user.id}/profile/image`,
                  className: "size-8 ml-0.5"
                });
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[!-->");
          if (message.created_at) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="mt-1.5 flex shrink-0 items-center text-xs self-center invisible group-hover:visible text-gray-500 font-medium first-letter:capitalize svelte-s6wdik">`);
            Tooltip($$renderer3, {
              content: dayjs(message.created_at / 1e6).format("LLLL"),
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(dayjs(message.created_at / 1e6).format("HH:mm"))}`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div> <div class="flex-auto w-0 pl-1 svelte-s6wdik">`);
        if (showUserProfile) {
          $$renderer3.push("<!--[-->");
          Name($$renderer3, {
            children: ($$renderer4) => {
              $$renderer4.push(`<div class="self-end text-base shrink-0 font-medium truncate svelte-s6wdik">`);
              if (message?.meta?.model_id) {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`${escape_html(message?.meta?.model_name ?? message?.meta?.model_id)}`);
              } else {
                $$renderer4.push("<!--[!-->");
                $$renderer4.push(`${escape_html(message?.user?.name)}`);
              }
              $$renderer4.push(`<!--]--></div> `);
              if (message.created_at) {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<div class="self-center text-xs invisible group-hover:visible text-gray-400 font-medium first-letter:capitalize ml-0.5 translate-y-[1px] svelte-s6wdik">`);
                Tooltip($$renderer4, {
                  content: dayjs(message.created_at / 1e6).format("LLLL"),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<span class="line-clamp-1 svelte-s6wdik">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t(formatDate(message.created_at / 1e6), {
                      LOCALIZED_TIME: dayjs(message.created_at / 1e6).format("LT"),
                      LOCALIZED_DATE: dayjs(message.created_at / 1e6).format("L")
                    }))}</span>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer4.push(`<!----></div>`);
              } else {
                $$renderer4.push("<!--[!-->");
              }
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if ((message?.data?.files ?? []).length > 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="my-2.5 w-full flex overflow-x-auto gap-2 flex-wrap svelte-s6wdik"><!--[-->`);
          const each_array = ensure_array_like(message?.data?.files);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let file = each_array[$$index];
            $$renderer3.push(`<div class="svelte-s6wdik">`);
            if (file.type === "image") {
              $$renderer3.push("<!--[-->");
              Image($$renderer3, {
                src: file.url,
                alt: file.name,
                imageClassName: " max-h-96 rounded-lg"
              });
            } else {
              $$renderer3.push("<!--[!-->");
              FileItem($$renderer3, {
                item: file,
                url: file.url,
                name: file.name,
                type: file.type,
                size: file?.size,
                small: true
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="min-w-full markdown-prose svelte-s6wdik">`);
          if ((message?.content ?? "").trim() === "" && message?.meta?.model_id) {
            $$renderer3.push("<!--[-->");
            Skeleton($$renderer3, {});
          } else {
            $$renderer3.push("<!--[!-->");
            Markdown($$renderer3, { id: message.id, content: message.content });
            $$renderer3.push(`<!---->`);
            if (message.created_at !== message.updated_at && (message?.meta?.model_id ?? null) === null) {
              $$renderer3.push("<!--[-->");
              $$renderer3.push(`<span class="text-gray-500 text-[10px] svelte-s6wdik">(${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("edited"))})</span>`);
            } else {
              $$renderer3.push("<!--[!-->");
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></div> `);
          if ((message?.reactions ?? []).length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="svelte-s6wdik"><div class="flex items-center flex-wrap gap-y-1.5 gap-1 mt-1 mb-2 svelte-s6wdik"><!--[-->`);
            const each_array_1 = ensure_array_like(message.reactions);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let reaction = each_array_1[$$index_1];
              Tooltip($$renderer3, {
                content: `:${reaction.name}:`,
                children: ($$renderer4) => {
                  $$renderer4.push(`<button${attr_class(
                    `flex items-center gap-1.5 transition rounded-xl px-2 py-1 cursor-pointer ${stringify(reaction.user_ids.includes(store_get($$store_subs ??= {}, "$user", user)?.id) ? " bg-blue-300/10 outline outline-blue-500/50 outline-1" : "bg-gray-300/10 dark:bg-gray-500/10 hover:outline hover:outline-gray-700/30 dark:hover:outline-gray-300/30 hover:outline-1")}`,
                    "svelte-s6wdik"
                  )}>`);
                  Emoji($$renderer4, { shortCode: reaction.name });
                  $$renderer4.push(`<!----> `);
                  if (reaction.user_ids.length > 0) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<div class="text-xs font-medium text-gray-500 dark:text-gray-400 svelte-s6wdik">${escape_html(reaction.user_ids?.length)}</div>`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]--></button>`);
                },
                $$slots: { default: true }
              });
            }
            $$renderer3.push(`<!--]--> `);
            EmojiPicker($$renderer3, {
              onSubmit: (name) => {
                onReaction(name);
              },
              children: ($$renderer4) => {
                Tooltip($$renderer4, {
                  content: store_get($$store_subs ??= {}, "$i18n", i18n2).t("Add Reaction"),
                  children: ($$renderer5) => {
                    $$renderer5.push(`<div class="flex items-center gap-1.5 bg-gray-500/10 hover:outline hover:outline-gray-700/30 dark:hover:outline-gray-300/30 hover:outline-1 transition rounded-xl px-1 py-1 cursor-pointer text-gray-500 dark:text-gray-400 svelte-s6wdik">`);
                    FaceSmile($$renderer5, {});
                    $$renderer5.push(`<!----></div>`);
                  },
                  $$slots: { default: true }
                });
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> `);
          if (!thread && message.reply_count > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="flex items-center gap-1.5 -mt-0.5 mb-1.5 svelte-s6wdik"><button class="flex items-center text-xs py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition svelte-s6wdik"><span class="font-medium mr-1 svelte-s6wdik">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("{{COUNT}} Replies", { COUNT: message.reply_count }))}</span><span class="svelte-s6wdik"> - ${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Last reply"))}
									${escape_html(dayjs.unix(message.latest_reply_at / 1e9).fromNow())}</span> <span class="ml-1 svelte-s6wdik">`);
            ChevronRight($$renderer3, { className: "size-2.5", strokeWidth: "3" });
            $$renderer3.push(`<!----></span></button></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--></div></div></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      message,
      showUserProfile,
      thread,
      replyToMessage,
      disabled,
      onDelete,
      onEdit,
      onReply,
      onThread,
      onReaction
    });
  });
}
function Messages($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    dayjs.extend(relativeTime);
    dayjs.extend(isToday);
    dayjs.extend(isYesterday);
    const i18n2 = getContext("i18n");
    let id = fallback($$props["id"], null);
    let channel = fallback($$props["channel"], null);
    let messages = fallback($$props["messages"], () => [], true);
    let replyToMessage = fallback($$props["replyToMessage"], null);
    let top = fallback($$props["top"], false);
    let thread = fallback($$props["thread"], false);
    let onLoad = fallback($$props["onLoad"], () => {
    });
    let onReply = fallback($$props["onReply"], () => {
    });
    let onThread = fallback($$props["onThread"], () => {
    });
    if (messages) {
      $$renderer2.push("<!--[-->");
      const messageList = messages.slice().reverse();
      $$renderer2.push(`<div>`);
      if (!top) {
        $$renderer2.push("<!--[-->");
        Loader($$renderer2, {
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="w-full flex justify-center py-1 text-xs animate-pulse items-center gap-2">`);
            Spinner($$renderer3, { className: " size-4" });
            $$renderer3.push(`<!----> <div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Loading..."))}</div></div>`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer2.push("<!--[!-->");
        if (!thread) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="px-5 max-w-full mx-auto">`);
          if (channel) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="flex flex-col gap-1.5 pb-5 pt-10"><div class="text-2xl font-medium capitalize">${escape_html(channel.name)}</div> <div class="text-gray-500">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("This channel was created on {{createdAt}}. This is the very beginning of the {{channelName}} channel.", {
              createdAt: dayjs(channel.created_at / 1e6).format("MMMM D, YYYY"),
              channelName: channel.name
            }))}</div></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div class="flex justify-center text-xs items-center gap-2 py-5"><div>${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Start of the channel"))}</div></div>`);
          }
          $$renderer2.push(`<!--]--> `);
          if (messageList.length > 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<hr class="border-gray-50 dark:border-gray-700/20 py-2.5 w-full"/>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array = ensure_array_like(messageList);
      for (let messageIdx = 0, $$length = each_array.length; messageIdx < $$length; messageIdx++) {
        let message = each_array[messageIdx];
        Message($$renderer2, {
          message,
          thread,
          replyToMessage: replyToMessage?.id === message.id,
          disabled: !channel?.write_access,
          showUserProfile: messageIdx === 0 || messageList.at(messageIdx - 1)?.user_id !== message.user_id || messageList.at(messageIdx - 1)?.meta?.model_id !== message?.meta?.model_id || message?.reply_to_message,
          onDelete: () => {
            messages = messages.filter((m) => m.id !== message.id);
            deleteMessage(localStorage.token, message.channel_id, message.id).catch((error) => {
              toast.error(`${error}`);
              return null;
            });
          },
          onEdit: (content) => {
            messages = messages.map((m) => {
              if (m.id === message.id) {
                m.content = content;
              }
              return m;
            });
            updateMessage(localStorage.token, message.channel_id, message.id, { content }).catch((error) => {
              toast.error(`${error}`);
              return null;
            });
          },
          onReply: (message2) => {
            onReply(message2);
          },
          onThread: (id2) => {
            onThread(id2);
          },
          onReaction: (name) => {
            if ((message?.reactions ?? []).find((reaction) => reaction.name === name)?.user_ids?.includes(store_get($$store_subs ??= {}, "$user", user)?.id) ?? false) {
              messages = messages.map((m) => {
                if (m.id === message.id) {
                  const reaction = m.reactions.find((reaction2) => reaction2.name === name);
                  if (reaction) {
                    reaction.user_ids = reaction.user_ids.filter((id2) => id2 !== store_get($$store_subs ??= {}, "$user", user)?.id);
                    reaction.count = reaction.user_ids.length;
                    if (reaction.count === 0) {
                      m.reactions = m.reactions.filter((r) => r.name !== name);
                    }
                  }
                }
                return m;
              });
              removeReaction(localStorage.token, message.channel_id, message.id, name).catch((error) => {
                toast.error(`${error}`);
                return null;
              });
            } else {
              messages = messages.map((m) => {
                if (m.id === message.id) {
                  if (m.reactions) {
                    const reaction = m.reactions.find((reaction2) => reaction2.name === name);
                    if (reaction) {
                      reaction.user_ids.push(store_get($$store_subs ??= {}, "$user", user)?.id);
                      reaction.count = reaction.user_ids.length;
                    } else {
                      m.reactions.push({
                        name,
                        user_ids: [store_get($$store_subs ??= {}, "$user", user)?.id],
                        count: 1
                      });
                    }
                  }
                }
                return m;
              });
              addReaction(localStorage.token, message.channel_id, message.id, name).catch((error) => {
                toast.error(`${error}`);
                return null;
              });
            }
          }
        });
      }
      $$renderer2.push(`<!--]--> <div class="pb-6"></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      channel,
      messages,
      replyToMessage,
      top,
      thread,
      onLoad,
      onReply,
      onThread
    });
  });
}
function MessageInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n2 = getContext("i18n");
    let placeholder = fallback($$props["placeholder"], () => store_get($$store_subs ??= {}, "$i18n", i18n2).t("Type here..."), true);
    let id = fallback($$props["id"], null);
    let chatInputElement = $$props["chatInputElement"];
    let typingUsers = fallback($$props["typingUsers"], () => [], true);
    let inputLoading = fallback($$props["inputLoading"], false);
    let onSubmit = fallback($$props["onSubmit"], (e) => {
    });
    let onChange = fallback($$props["onChange"], (e) => {
    });
    let onStop = fallback($$props["onStop"], (e) => {
    });
    let scrollEnd = fallback($$props["scrollEnd"], true);
    let scrollToBottom = fallback($$props["scrollToBottom"], () => {
    });
    let disabled = fallback($$props["disabled"], false);
    let acceptFiles = fallback($$props["acceptFiles"], true);
    let showFormattingToolbar = fallback($$props["showFormattingToolbar"], true);
    let userSuggestions = fallback($$props["userSuggestions"], false);
    let channelSuggestions = fallback($$props["channelSuggestions"], false);
    let replyToMessage = fallback($$props["replyToMessage"], null);
    let typingUsersClassName = fallback($$props["typingUsersClassName"], "from-white dark:from-gray-900");
    let files = [];
    let inputVariables = {};
    const inputVariableHandler = async (text) => {
      inputVariables = extractInputVariables(text);
      if (Object.keys(inputVariables).length === 0) {
        return text;
      }
      return await new Promise((resolve) => {
      });
    };
    const textVariableHandler = async (text) => {
      if (text.includes("{{CLIPBOARD}}")) {
        const clipboardText = await navigator.clipboard.readText().catch((err) => {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Failed to read clipboard contents"));
          return "{{CLIPBOARD}}";
        });
        const clipboardItems = await navigator.clipboard.read();
        let imageUrl = null;
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              imageUrl = URL.createObjectURL(blob);
            }
          }
        }
        if (imageUrl) {
          files = [...files, { type: "image", url: imageUrl }];
        }
        text = text.replaceAll("{{CLIPBOARD}}", clipboardText);
      }
      if (text.includes("{{USER_LOCATION}}")) {
        let location;
        try {
          location = await getUserPosition();
        } catch (error) {
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Location access not allowed"));
          location = "LOCATION_UNKNOWN";
        }
        text = text.replaceAll("{{USER_LOCATION}}", String(location));
      }
      const sessionUser = await getSessionUser(localStorage.token);
      if (text.includes("{{USER_NAME}}")) {
        const name = sessionUser?.name || "User";
        text = text.replaceAll("{{USER_NAME}}", name);
      }
      if (text.includes("{{USER_BIO}}")) {
        const bio = sessionUser?.bio || "";
        if (bio) {
          text = text.replaceAll("{{USER_BIO}}", bio);
        }
      }
      if (text.includes("{{USER_GENDER}}")) {
        const gender = sessionUser?.gender || "";
        if (gender) {
          text = text.replaceAll("{{USER_GENDER}}", gender);
        }
      }
      if (text.includes("{{USER_BIRTH_DATE}}")) {
        const birthDate = sessionUser?.date_of_birth || "";
        if (birthDate) {
          text = text.replaceAll("{{USER_BIRTH_DATE}}", birthDate);
        }
      }
      if (text.includes("{{USER_AGE}}")) {
        const birthDate = sessionUser?.date_of_birth || "";
        if (birthDate) {
          const age = getAge(birthDate);
          text = text.replaceAll("{{USER_AGE}}", age);
        }
      }
      if (text.includes("{{USER_LANGUAGE}}")) {
        const language = localStorage.getItem("locale") || "en-US";
        text = text.replaceAll("{{USER_LANGUAGE}}", language);
      }
      if (text.includes("{{CURRENT_DATE}}")) {
        const date = getFormattedDate();
        text = text.replaceAll("{{CURRENT_DATE}}", date);
      }
      if (text.includes("{{CURRENT_TIME}}")) {
        const time = getFormattedTime();
        text = text.replaceAll("{{CURRENT_TIME}}", time);
      }
      if (text.includes("{{CURRENT_DATETIME}}")) {
        const dateTime = getCurrentDateTime();
        text = text.replaceAll("{{CURRENT_DATETIME}}", dateTime);
      }
      if (text.includes("{{CURRENT_TIMEZONE}}")) {
        const timezone = getUserTimezone();
        text = text.replaceAll("{{CURRENT_TIMEZONE}}", timezone);
      }
      if (text.includes("{{CURRENT_WEEKDAY}}")) {
        const weekday = getWeekday();
        text = text.replaceAll("{{CURRENT_WEEKDAY}}", weekday);
      }
      return text;
    };
    const setText = async (text, cb) => {
      const chatInput = document.getElementById("chat-input");
      if (chatInput) {
        if (text !== "") {
          text = await textVariableHandler(text || "");
        }
        chatInputElement?.setText(text);
        chatInputElement?.focus();
        if (text !== "") {
          text = await inputVariableHandler(text);
        }
        await tick();
        if (cb) await cb(text);
      }
    };
    let command = "";
    let showCommands = fallback($$props["showCommands"], false);
    const inputFilesHandler = async (inputFiles) => {
      inputFiles.forEach(async (file) => {
        console.info("Processing file:", {
          name: file.name,
          type: file.type,
          size: file.size,
          extension: file.name.split(".").at(-1)
        });
        if ((store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? null) !== null && file.size > (store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? 0) * 1024 * 1024) {
          /* @__PURE__ */ console.error("File exceeds max size limit:", {
            fileSize: file.size,
            maxSize: (store_get($$store_subs ??= {}, "$config", config)?.file?.max_size ?? 0) * 1024 * 1024
          });
          toast.error(store_get($$store_subs ??= {}, "$i18n", i18n2).t(`File size should not exceed {{maxSize}} MB.`, {
            maxSize: store_get($$store_subs ??= {}, "$config", config)?.file?.max_size
          }));
          return;
        }
        if (file["type"].startsWith("image/")) {
          const compressImageHandler = async (imageUrl, settings2 = {}, config2 = {}) => {
            const settingsCompression = settings2?.imageCompression ?? false;
            const configWidth = config2?.file?.image_compression?.width ?? null;
            const configHeight = config2?.file?.image_compression?.height ?? null;
            if (!settingsCompression && !configWidth && !configHeight) {
              return imageUrl;
            }
            let width = null;
            let height = null;
            if (settingsCompression) {
              width = settings2?.imageCompressionSize?.width ?? null;
              height = settings2?.imageCompressionSize?.height ?? null;
            }
            if (configWidth && (width === null || width > configWidth)) {
              width = configWidth;
            }
            if (configHeight && (height === null || height > configHeight)) {
              height = configHeight;
            }
            if (width || height) {
              return await compressImage(imageUrl, width, height);
            }
            return imageUrl;
          };
          let reader = new FileReader();
          reader.onload = async (event) => {
            let imageUrl = event.target.result;
            if (store_get($$store_subs ??= {}, "$settings", settings)?.imageCompression && store_get($$store_subs ??= {}, "$settings", settings)?.imageCompressionInChannels) {
              imageUrl = await compressImageHandler(imageUrl, store_get($$store_subs ??= {}, "$settings", settings), store_get($$store_subs ??= {}, "$config", config));
            }
            files = [...files, { type: "image", url: `${imageUrl}` }];
          };
          reader.readAsDataURL(file["type"] === "image/heic" ? await convertHeicToJpeg(file) : file);
        } else {
          uploadFileHandler(file);
        }
      });
    };
    const uploadFileHandler = async (file) => {
      const tempItemId = v4();
      const fileItem = {
        type: "file",
        file: "",
        id: null,
        url: "",
        name: file.name,
        collection_name: "",
        status: "uploading",
        size: file.size,
        error: "",
        itemId: tempItemId
      };
      if (fileItem.size == 0) {
        toast.error(store_get($$store_subs ??= {}, "$i18n", i18n2).t("You cannot upload an empty file."));
        return null;
      }
      files = [...files, fileItem];
      try {
        let metadata = null;
        if ((file.type.startsWith("audio/") || file.type.startsWith("video/")) && store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language) {
          metadata = {
            language: store_get($$store_subs ??= {}, "$settings", settings)?.audio?.stt?.language
          };
        }
        const uploadedFile = await uploadFile(localStorage.token, file, metadata);
        if (uploadedFile) {
          console.info("File upload completed:", {
            id: uploadedFile.id,
            name: fileItem.name,
            collection: uploadedFile?.meta?.collection_name
          });
          if (uploadedFile.error) {
            /* @__PURE__ */ console.error("File upload warning:", uploadedFile.error);
            toast.warning(uploadedFile.error);
          }
          fileItem.status = "uploaded";
          fileItem.file = uploadedFile;
          fileItem.id = uploadedFile.id;
          fileItem.collection_name = uploadedFile?.meta?.collection_name || uploadedFile?.collection_name;
          fileItem.url = `${WEBUI_API_BASE_URL}/files/${uploadedFile.id}`;
          files = files;
        } else {
          files = files.filter((item) => item?.itemId !== tempItemId);
        }
      } catch (e) {
        toast.error(`${e}`);
        files = files.filter((item) => item?.itemId !== tempItemId);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") ;
    };
    const onDragOver = (e) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes("Files")) ;
    };
    const onDragLeave = () => {
    };
    const onDrop = async (e) => {
      e.preventDefault();
      if (e.dataTransfer?.files && acceptFiles) {
        const inputFiles = Array.from(e.dataTransfer?.files);
        if (inputFiles && inputFiles.length > 0) {
          /* @__PURE__ */ console.log(inputFiles);
          inputFilesHandler(inputFiles);
        }
      }
    };
    onDestroy(() => {
      window.removeEventListener("keydown", handleKeyDown);
      const dropzoneElement = document.getElementById("channel-container");
      if (dropzoneElement) {
        dropzoneElement?.removeEventListener("dragover", onDragOver);
        dropzoneElement?.removeEventListener("drop", onDrop);
        dropzoneElement?.removeEventListener("dragleave", onDragLeave);
      }
    });
    showCommands = ["/"].includes(command?.charAt(0));
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      placeholder,
      id,
      chatInputElement,
      typingUsers,
      inputLoading,
      onSubmit,
      onChange,
      onStop,
      scrollEnd,
      scrollToBottom,
      disabled,
      acceptFiles,
      showFormattingToolbar,
      userSuggestions,
      channelSuggestions,
      replyToMessage,
      typingUsersClassName,
      showCommands,
      setText
    });
  });
}
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n2 = getContext("i18n");
    let channel = $$props["channel"];
    $$renderer2.push(`<nav class="sticky top-0 z-30 w-full px-1.5 py-1.5 -mb-8 flex items-center drag-region"><div id="navbar-bg-gradient-to-b" class="bg-linear-to-b via-50% from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pointer-events-none absolute inset-0 -bottom-7 z-[-1]"></div> <div class="flex max-w-full w-full mx-auto px-1 pt-0.5 bg-transparent"><div class="flex items-center w-full max-w-full">`);
    if (store_get($$store_subs ??= {}, "$mobile", mobile)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "md:hidden" : "")} mr-1.5 mt-0.5 self-start flex flex-none items-center text-gray-600 dark:text-gray-400`)}>`);
      Tooltip($$renderer2, {
        content: store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? store_get($$store_subs ??= {}, "$i18n", i18n2).t("Close Sidebar") : store_get($$store_subs ??= {}, "$i18n", i18n2).t("Open Sidebar"),
        interactive: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<button id="sidebar-toggle-button" class="cursor-pointer flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition cursor-"><div class="self-center p-1.5">`);
          Sidebar($$renderer3, {});
          $$renderer3.push(`<!----></div></button>`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class(`flex-1 overflow-hidden max-w-full py-0.5 ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "ml-1" : "")} `)}>`);
    if (channel) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="line-clamp-1 capitalize font-medium font-primary text-lg">${escape_html(channel.name)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="self-start flex flex-none items-center text-gray-600 dark:text-gray-400">`);
    if (store_get($$store_subs ??= {}, "$user", user) !== void 0) {
      $$renderer2.push("<!--[-->");
      UserMenu($$renderer2, {
        className: "max-w-[240px]",
        role: store_get($$store_subs ??= {}, "$user", user)?.role,
        help: true,
        children: ($$renderer3) => {
          $$renderer3.push(`<button class="select-none flex rounded-xl p-1.5 w-full hover:bg-gray-50 dark:hover:bg-gray-850 transition" aria-label="User Menu"><div class="self-center"><img${attr("src", `${WEBUI_API_BASE_URL}/users/${store_get($$store_subs ??= {}, "$user", user)?.id}/profile/image`)} class="size-6 object-cover rounded-full" alt="User profile" draggable="false"/></div></button>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { channel });
  });
}
function Thread($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n2 = getContext("i18n");
    let threadId = fallback($$props["threadId"], null);
    let channel = fallback($$props["channel"], null);
    let onClose = fallback($$props["onClose"], () => {
    });
    let messages = null;
    let top = false;
    let messagesContainerElement = null;
    let chatInputElement = null;
    let replyToMessage = null;
    let typingUsers = [];
    let typingUsersTimeout = {};
    const scrollToBottom = () => {
      messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight;
    };
    const initHandler = async () => {
      messages = null;
      top = false;
      typingUsers = [];
      typingUsersTimeout = {};
      if (channel) {
        messages = await getChannelThreadMessages(localStorage.token, channel.id, threadId);
        if (messages.length < 50) {
          top = true;
        }
        await tick();
        scrollToBottom();
      } else {
        goto();
      }
    };
    const channelEventHandler = async (event) => {
      /* @__PURE__ */ console.debug(event);
      if (event.channel_id === channel.id) {
        const type = event?.data?.type ?? null;
        const data = event?.data?.data ?? null;
        if (type === "message") {
          if ((data?.parent_id ?? null) === threadId) {
            if (messages) {
              messages = [data, ...messages];
              if (typingUsers.find((user2) => user2.id === event.user.id)) {
                typingUsers = typingUsers.filter((user2) => user2.id !== event.user.id);
              }
            }
          }
        } else if (type === "message:update") {
          if (messages) {
            const idx = messages.findIndex((message) => message.id === data.id);
            if (idx !== -1) {
              messages[idx] = data;
            }
          }
        } else if (type === "message:delete") {
          if (messages) {
            messages = messages.filter((message) => message.id !== data.id);
          }
        } else if (type.includes("message:reaction")) {
          if (messages) {
            const idx = messages.findIndex((message) => message.id === data.id);
            if (idx !== -1) {
              messages[idx] = data;
            }
          }
        } else if (type === "typing" && event.message_id === threadId) {
          if (event.user.id === store_get($$store_subs ??= {}, "$user", user)?.id) {
            return;
          }
          typingUsers = data.typing ? [
            ...typingUsers,
            ...typingUsers.find((user2) => user2.id === event.user.id) ? [] : [{ id: event.user.id, name: event.user.name }]
          ] : typingUsers.filter((user2) => user2.id !== event.user.id);
          if (typingUsersTimeout[event.user.id]) {
            clearTimeout(typingUsersTimeout[event.user.id]);
          }
          typingUsersTimeout[event.user.id] = setTimeout(
            () => {
              typingUsers = typingUsers.filter((user2) => user2.id !== event.user.id);
            },
            5e3
          );
        }
      }
    };
    const submitHandler = async ({ content, data }) => {
      if (!content && (data?.files ?? []).length === 0) {
        return;
      }
      await sendMessage(localStorage.token, channel.id, {
        parent_id: threadId,
        reply_to_id: replyToMessage?.id ?? null,
        content,
        data
      }).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      replyToMessage = null;
    };
    const onChange = async () => {
      store_get($$store_subs ??= {}, "$socket", socket)?.emit("events:channel", {
        channel_id: channel.id,
        message_id: threadId,
        data: { type: "typing", data: { typing: true } }
      });
    };
    onDestroy(() => {
      store_get($$store_subs ??= {}, "$socket", socket)?.off("events:channel", channelEventHandler);
    });
    if (threadId) {
      initHandler();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (channel) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="flex flex-col w-full h-full bg-gray-50 dark:bg-gray-850"><div class="sticky top-0 flex items-center justify-between px-3.5 py-3"><div class="font-medium text-lg">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n2).t("Thread"))}</div> <div><button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2">`);
        XMark($$renderer3, {});
        $$renderer3.push(`<!----></button></div></div> <div class="max-h-full w-full overflow-y-auto">`);
        if (messages !== null) {
          $$renderer3.push("<!--[-->");
          Messages($$renderer3, {
            id: threadId,
            channel,
            top,
            messages,
            replyToMessage,
            thread: true,
            onReply: async (message) => {
              replyToMessage = message;
              await tick();
              chatInputElement?.focus();
            },
            onLoad: async () => {
              const newMessages = await getChannelThreadMessages(localStorage.token, channel.id, threadId, messages.length);
              messages = [...messages, ...newMessages];
              if (newMessages.length < 50) {
                top = true;
                return;
              }
            }
          });
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="w-full flex justify-center pt-5 pb-10">`);
          Spinner($$renderer3, {});
          $$renderer3.push(`<!----></div>`);
        }
        $$renderer3.push(`<!--]--> <div class="pb-[1rem] px-2.5 w-full">`);
        MessageInput($$renderer3, {
          id: threadId,
          disabled: !channel?.write_access,
          placeholder: !channel?.write_access ? store_get($$store_subs ??= {}, "$i18n", i18n2).t("You do not have permission to send messages in this thread.") : store_get($$store_subs ??= {}, "$i18n", i18n2).t("Reply to thread..."),
          typingUsersClassName: "from-gray-50 dark:from-gray-850",
          typingUsers,
          userSuggestions: true,
          channelSuggestions: true,
          onChange,
          onSubmit: submitHandler,
          get replyToMessage() {
            return replyToMessage;
          },
          set replyToMessage($$value) {
            replyToMessage = $$value;
            $$settled = false;
          },
          get chatInputElement() {
            return chatInputElement;
          },
          set chatInputElement($$value) {
            chatInputElement = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div></div></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { threadId, channel, onClose });
  });
}
function Channel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let id = fallback($$props["id"], "");
    let scrollEnd = true;
    let messagesContainerElement = null;
    let chatInputElement = null;
    let top = false;
    let channel = null;
    let messages = null;
    let replyToMessage = null;
    let threadId = null;
    let typingUsers = [];
    let typingUsersTimeout = {};
    const scrollToBottom = () => {
    };
    const initHandler = async () => {
      top = false;
      messages = null;
      channel = null;
      threadId = null;
      typingUsers = [];
      typingUsersTimeout = {};
      channel = await getChannelById(localStorage.token, id).catch((error) => {
        return null;
      });
      if (channel) {
        messages = await getChannelMessages(localStorage.token, id, 0);
        if (messages) {
          if (messages.length < 50) {
            top = true;
          }
        }
      } else {
        goto();
      }
    };
    const channelEventHandler = async (event) => {
      if (event.channel_id === id) {
        const type = event?.data?.type ?? null;
        const data = event?.data?.data ?? null;
        if (type === "message") {
          if ((data?.parent_id ?? null) === null) {
            messages = [data, ...messages];
            if (typingUsers.find((user2) => user2.id === event.user.id)) {
              typingUsers = typingUsers.filter((user2) => user2.id !== event.user.id);
            }
            await tick();
          }
        } else if (type === "message:update") {
          const idx = messages.findIndex((message) => message.id === data.id);
          if (idx !== -1) {
            messages[idx] = data;
          }
        } else if (type === "message:delete") {
          messages = messages.filter((message) => message.id !== data.id);
        } else if (type === "message:reply") {
          const idx = messages.findIndex((message) => message.id === data.id);
          if (idx !== -1) {
            messages[idx] = data;
          }
        } else if (type.includes("message:reaction")) {
          const idx = messages.findIndex((message) => message.id === data.id);
          if (idx !== -1) {
            messages[idx] = data;
          }
        } else if (type === "typing" && event.message_id === null) {
          if (event.user.id === store_get($$store_subs ??= {}, "$user", user)?.id) {
            return;
          }
          typingUsers = data.typing ? [
            ...typingUsers,
            ...typingUsers.find((user2) => user2.id === event.user.id) ? [] : [{ id: event.user.id, name: event.user.name }]
          ] : typingUsers.filter((user2) => user2.id !== event.user.id);
          if (typingUsersTimeout[event.user.id]) {
            clearTimeout(typingUsersTimeout[event.user.id]);
          }
          typingUsersTimeout[event.user.id] = setTimeout(
            () => {
              typingUsers = typingUsers.filter((user2) => user2.id !== event.user.id);
            },
            5e3
          );
        }
      }
    };
    const submitHandler = async ({ content, data }) => {
      if (!content && (data?.files ?? []).length === 0) {
        return;
      }
      const res = await sendMessage(localStorage.token, id, { content, data, reply_to_id: replyToMessage?.id ?? null }).catch((error) => {
        toast.error(`${error}`);
        return null;
      });
      if (res) {
        messagesContainerElement.scrollTop = messagesContainerElement.scrollHeight;
      }
      replyToMessage = null;
    };
    const onChange = async () => {
      store_get($$store_subs ??= {}, "$socket", socket)?.emit("events:channel", {
        channel_id: id,
        message_id: null,
        data: { type: "typing", data: { typing: true } }
      });
    };
    onDestroy(() => {
      store_get($$store_subs ??= {}, "$socket", socket)?.off("events:channel", channelEventHandler);
    });
    if (id) {
      initHandler();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head($$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>#${escape_html(channel?.name ?? "Channel")} • Open WebUI</title>`);
        });
      });
      $$renderer3.push(`<div${attr_class(`h-screen max-h-[100dvh] transition-width duration-200 ease-in-out ${stringify(store_get($$store_subs ??= {}, "$showSidebar", showSidebar) ? "md:max-w-[calc(100%-260px)]" : "")} w-full max-w-full flex flex-col`)} id="channel-container">`);
      Pane_group($$renderer3, {
        direction: "horizontal",
        class: "w-full h-full",
        children: ($$renderer4) => {
          Pane($$renderer4, {
            defaultSize: 50,
            minSize: 50,
            class: "h-full flex flex-col w-full relative",
            children: ($$renderer5) => {
              Navbar($$renderer5, { channel });
              $$renderer5.push(`<!----> <div class="flex-1 overflow-y-auto">`);
              if (channel) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<div class="pb-2.5 max-w-full z-10 scrollbar-hidden w-full h-full pt-6 flex-1 flex flex-col-reverse overflow-auto" id="messages-container"><!---->`);
                {
                  Messages($$renderer5, {
                    channel,
                    top,
                    messages,
                    replyToMessage,
                    onReply: async (message) => {
                      replyToMessage = message;
                      await tick();
                      chatInputElement?.focus();
                    },
                    onThread: (id2) => {
                      threadId = id2;
                    },
                    onLoad: async () => {
                      const newMessages = await getChannelMessages(localStorage.token, id, messages.length);
                      messages = [...messages, ...newMessages];
                      if (newMessages.length < 50) {
                        top = true;
                        return;
                      }
                    }
                  });
                }
                $$renderer5.push(`<!----></div>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--></div> <div class="pb-[1rem] px-2.5">`);
              MessageInput($$renderer5, {
                id: "root",
                typingUsers,
                userSuggestions: true,
                channelSuggestions: true,
                disabled: !channel?.write_access,
                placeholder: !channel?.write_access ? store_get($$store_subs ??= {}, "$i18n", i18n).t("You do not have permission to send messages in this channel.") : store_get($$store_subs ??= {}, "$i18n", i18n).t("Type here..."),
                onChange,
                onSubmit: submitHandler,
                scrollToBottom,
                scrollEnd,
                get chatInputElement() {
                  return chatInputElement;
                },
                set chatInputElement($$value) {
                  chatInputElement = $$value;
                  $$settled = false;
                },
                get replyToMessage() {
                  return replyToMessage;
                },
                set replyToMessage($$value) {
                  replyToMessage = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          {
            $$renderer4.push("<!--[-->");
            if (threadId !== null) {
              $$renderer4.push("<!--[-->");
              Drawer($$renderer4, {
                show: threadId !== null,
                onClose: () => {
                  threadId = null;
                },
                children: ($$renderer5) => {
                  $$renderer5.push(`<div${attr_class(` ${stringify(threadId !== null ? " h-screen  w-full" : "px-6 py-4")} h-full`)}>`);
                  Thread($$renderer5, {
                    threadId,
                    channel,
                    onClose: () => {
                      threadId = null;
                    }
                  });
                  $$renderer5.push(`<!----></div>`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]-->`);
          }
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { id });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    Channel($$renderer2, {
      id: store_get($$store_subs ??= {}, "$page", page).params.id
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
