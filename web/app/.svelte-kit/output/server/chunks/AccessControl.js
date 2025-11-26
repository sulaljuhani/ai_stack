import { c as attr_class, d as clsx, b as bind_props, j as escape_html, s as store_get, o as stringify, e as ensure_array_like, u as unsubscribe_stores } from "./index.js";
import { Y as fallback, Z as getContext } from "./context.js";
import "./constants.js";
import "dompurify";
import { X as XMark } from "./XMark.js";
import { B as Badge } from "./Badge.js";
function UserCircleSolid($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"${attr_class(clsx(className))}><path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 9c-1.825 0-3.422.977-4.295 2.437A5.49 5.49 0 0 0 8 13.5a5.49 5.49 0 0 0 4.294-2.063A4.997 4.997 0 0 0 8 9Z" clip-rule="evenodd"></path></svg>`);
  bind_props($$props, { className });
}
function AccessControl($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onChange = fallback($$props["onChange"], () => {
    });
    let accessRoles = fallback($$props["accessRoles"], () => ["read"], true);
    let accessControl = fallback($$props["accessControl"], () => ({}), true);
    let share = fallback($$props["share"], true);
    let sharePublic = fallback($$props["sharePublic"], true);
    let selectedGroupId = "";
    let groups = [];
    const initPublicAccess = () => {
      if (!sharePublic && accessControl === null) {
        accessControl = {
          read: { group_ids: [], user_ids: [] },
          write: { group_ids: [], user_ids: [] }
        };
        onChange(accessControl);
      }
    };
    if (!sharePublic && accessControl === null) {
      initPublicAccess();
    }
    $$renderer2.push(`<div class="rounded-lg flex flex-col gap-2"><div><div class="text-sm font-medium mb-1.5">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Visibility"))}</div> <div class="flex gap-2.5 items-center mb-1"><div><div class="p-2 bg-black/5 dark:bg-white/5 rounded-full">`);
    if (accessControl !== null) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"></path></svg>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64"></path></svg>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div>`);
    $$renderer2.select(
      {
        id: "models",
        class: "outline-hidden bg-transparent text-sm font-medium rounded-lg block w-fit pr-10 max-w-full placeholder-gray-400",
        value: accessControl !== null ? "private" : "public"
      },
      ($$renderer3) => {
        $$renderer3.option({ class: "text-gray-700", value: "private", selected: true }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Private"))}`);
        });
        if (share && sharePublic) {
          $$renderer3.push("<!--[-->");
          $$renderer3.option({ class: "text-gray-700", value: "public", selected: true }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Public"))}`);
          });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` <div class="text-xs text-gray-400 font-medium">`);
    if (accessControl !== null) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Only select users and groups with permission can access"))}`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Accessible to all users"))}`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div> `);
    if (share) {
      $$renderer2.push("<!--[-->");
      if (accessControl !== null) {
        $$renderer2.push("<!--[-->");
        const accessGroups = groups.filter((group) => (accessControl?.read?.group_ids ?? []).includes(group.id));
        $$renderer2.push(`<div><div><div class="flex justify-between mb-1.5"><div class="text-sm font-medium">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Groups"))}</div></div> <div class="mb-1"><div class="flex w-full"><div class="flex flex-1 items-center"><div class="w-full px-0.5">`);
        $$renderer2.select(
          {
            class: `outline-hidden bg-transparent text-sm rounded-lg block w-full pr-10 max-w-full ${stringify("text-gray-500")} dark:placeholder-gray-500`,
            value: selectedGroupId
          },
          ($$renderer3) => {
            $$renderer3.option(
              {
                class: "text-gray-700",
                value: "",
                disabled: true,
                selected: true
              },
              ($$renderer4) => {
                $$renderer4.push(`${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("Select a group"))}`);
              }
            );
            $$renderer3.push(`<!--[-->`);
            const each_array = ensure_array_like(groups.filter((group) => !(accessControl?.read?.group_ids ?? []).includes(group.id)));
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let group = each_array[$$index];
              $$renderer3.option({ class: "text-gray-700", value: group.id }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(group.name)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</div></div></div></div> <hr class="border-gray-100 dark:border-gray-700/10 mt-1.5 mb-2.5 w-full"/> <div class="flex flex-col gap-2 mb-1 px-0.5">`);
        if (accessGroups.length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(accessGroups);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let group = each_array_1[$$index_1];
            $$renderer2.push(`<div class="flex items-center gap-3 justify-between text-xs w-full transition"><div class="flex items-center gap-1.5 w-full font-medium"><div>`);
            UserCircleSolid($$renderer2, { className: "size-4" });
            $$renderer2.push(`<!----></div> <div>${escape_html(group.name)}</div></div> <div class="w-full flex justify-end items-center gap-0.5"><button type="button">`);
            if ((accessControl?.write?.group_ids ?? []).includes(group.id)) {
              $$renderer2.push("<!--[-->");
              Badge($$renderer2, {
                type: "success",
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Write")
              });
            } else {
              $$renderer2.push("<!--[!-->");
              Badge($$renderer2, {
                type: "info",
                content: store_get($$store_subs ??= {}, "$i18n", i18n).t("Read")
              });
            }
            $$renderer2.push(`<!--]--></button> <button class="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-850 transition" type="button">`);
            XMark($$renderer2, {});
            $$renderer2.push(`<!----></button></div></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="flex items-center justify-center"><div class="text-gray-500 text-xs text-center py-2 px-10">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No groups with access, add a group to grant access"))}</div></div>`);
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onChange, accessRoles, accessControl, share, sharePublic });
  });
}
export {
  AccessControl as A
};
//# sourceMappingURL=AccessControl.js.map
