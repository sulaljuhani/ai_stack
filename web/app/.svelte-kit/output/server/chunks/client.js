import { a4 as ssr_context, X as noop, ad as lifecycle_function_unavailable, ae as createContext, af as getAbortSignal, ag as getAllContexts, Z as getContext, $ as hasContext, W as setContext, ah as run } from "./context.js";
import "@sveltejs/kit/internal";
import { w as writable } from "./exports.js";
import "clsx";
function createRawSnippet(fn) {
  return (renderer, ...args) => {
    var getters = (
      /** @type {Getters<Params>} */
      args.map((value) => () => value)
    );
    renderer.push(
      fn(...getters).render().trim()
    );
  };
}
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function createEventDispatcher() {
  return noop;
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function hydrate() {
  lifecycle_function_unavailable("hydrate");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
function fork() {
  lifecycle_function_unavailable("fork");
}
async function tick$1() {
}
async function settled() {
}
const svelte = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  afterUpdate: noop,
  beforeUpdate: noop,
  createContext,
  createEventDispatcher,
  createRawSnippet,
  flushSync: noop,
  fork,
  getAbortSignal,
  getAllContexts,
  getContext,
  hasContext,
  hydrate,
  mount,
  onDestroy,
  onMount: noop,
  setContext,
  settled,
  tick: tick$1,
  unmount,
  untrack: run
}, Symbol.toStringTag, { value: "Module" }));
function get(key, parse = JSON.parse) {
  try {
    return parse(sessionStorage[key]);
  } catch {
  }
}
const SNAPSHOT_KEY = "sveltekit:snapshot";
const SCROLL_KEY = "sveltekit:scroll";
function notifiable_store(value) {
  const store = writable(value);
  let ready = true;
  function notify() {
    ready = true;
    store.update((val) => val);
  }
  function set(new_value) {
    ready = false;
    store.set(new_value);
  }
  function subscribe(run2) {
    let old_value;
    return store.subscribe((new_value) => {
      if (old_value === void 0 || ready && new_value !== old_value) {
        run2(old_value = new_value);
      }
    });
  }
  return { notify, set, subscribe };
}
function create_updated_store() {
  const { set, subscribe } = writable(false);
  {
    return {
      subscribe,
      // eslint-disable-next-line @typescript-eslint/require-await
      check: async () => false
    };
  }
}
let updated;
const is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
if (is_legacy) {
  ({
    data: {},
    form: null,
    error: null,
    params: {},
    route: { id: null },
    state: {},
    status: -1,
    url: new URL("https://example.com")
  });
  updated = { current: false };
} else {
  updated = new class Updated {
    current = false;
  }();
}
const { onMount, tick } = svelte;
get(SCROLL_KEY) ?? {};
get(SNAPSHOT_KEY) ?? {};
const stores = {
  url: /* @__PURE__ */ notifiable_store({}),
  page: /* @__PURE__ */ notifiable_store({}),
  navigating: /* @__PURE__ */ writable(
    /** @type {import('@sveltejs/kit').Navigation | null} */
    null
  ),
  updated: /* @__PURE__ */ create_updated_store()
};
const before_navigate_callbacks = /* @__PURE__ */ new Set();
function add_navigation_callback(callbacks, callback) {
  onMount(() => {
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  });
}
function beforeNavigate(callback) {
  add_navigation_callback(before_navigate_callbacks, callback);
}
function goto(url, opts = {}) {
  {
    throw new Error("Cannot call goto(...) on the server");
  }
}
export {
  beforeNavigate as b,
  createEventDispatcher as c,
  goto as g,
  onDestroy as o,
  stores as s,
  tick$1 as t,
  updated as u
};
//# sourceMappingURL=client.js.map
