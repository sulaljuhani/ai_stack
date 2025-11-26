import { a as WEBUI_API_BASE_URL, W as WEBUI_BASE_URL } from "./constants.js";
import { l as rest_props, s as store_get, m as attributes, h as slot, u as unsubscribe_stores, b as bind_props, k as sanitize_props, c as attr_class, o as stringify, f as attr_style, e as ensure_array_like, a as attr, j as escape_html } from "./index.js";
import { W as setContext, $ as hasContext, Z as getContext, Y as fallback, _ as invalid_default_snippet } from "./context.js";
import "clsx";
import { nanoid } from "nanoid/non-secure";
import { o as onDestroy } from "./client.js";
import { w as writable, i as derived, k as get } from "./exports.js";
/* empty css                                     */
import "dequal";
import "./create.js";
import { c as Menu, d as Menu_trigger, M as Menu_content, f as flyAndScale } from "./menu-trigger.js";
import { T as Tooltip } from "./Tooltip.js";
import { K as emojiShortCodes } from "./index2.js";
const getSessionUser = async (token) => {
  let error = null;
  const res = await fetch(`${WEBUI_API_BASE_URL}/auths/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    credentials: "include"
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
function safeOnDestroy(fn) {
  try {
    onDestroy(fn);
  } catch {
    return fn();
  }
}
function derivedWithUnsubscribe(stores, fn) {
  let unsubscribers = [];
  const onUnsubscribe = (cb) => {
    unsubscribers.push(cb);
  };
  const unsubscribe = () => {
    unsubscribers.forEach((fn2) => fn2());
    unsubscribers = [];
  };
  const derivedStore = derived(stores, ($storeValues) => {
    unsubscribe();
    return fn($storeValues, onUnsubscribe);
  });
  safeOnDestroy(unsubscribe);
  const subscribe = (...args) => {
    const unsub = derivedStore.subscribe(...args);
    return () => {
      unsub();
      unsubscribe();
    };
  };
  return {
    ...derivedStore,
    subscribe
  };
}
function clientEffect(stores, fn) {
  if (!isBrowser)
    return () => {
    };
  const unsub = derivedWithUnsubscribe(stores, (stores2, onUnsubscribe) => {
    return {
      stores: stores2,
      onUnsubscribe
    };
  }).subscribe(({ stores: stores2, onUnsubscribe }) => {
    const returned = fn(stores2);
    if (returned) {
      onUnsubscribe(returned);
    }
  });
  safeOnDestroy(unsub);
  return unsub;
}
function toWritableStores(properties) {
  const result = {};
  Object.keys(properties).forEach((key) => {
    const propertyKey = key;
    const value = properties[propertyKey];
    result[propertyKey] = writable(value);
  });
  return result;
}
function getOptionUpdater(options) {
  return function(key, value) {
    if (value === void 0)
      return;
    const store = options[key];
    if (store) {
      store.set(value);
    }
  };
}
function styleToString(style) {
  return Object.keys(style).reduce((str, key) => {
    if (style[key] === void 0)
      return str;
    return str + `${key}:${style[key]};`;
  }, "");
}
let currentState = null;
let element = null;
function getCursorStyle(state) {
  switch (state) {
    case "horizontal":
      return "ew-resize";
    case "horizontal-max":
      return "w-resize";
    case "horizontal-min":
      return "e-resize";
    case "vertical":
      return "ns-resize";
    case "vertical-max":
      return "n-resize";
    case "vertical-min":
      return "s-resize";
  }
}
function resetGlobalCursorStyle() {
  if (element === null)
    return;
  document.head.removeChild(element);
  currentState = null;
  element = null;
}
function setGlobalCursorStyle(state) {
  if (currentState === state)
    return;
  currentState = state;
  const style = getCursorStyle(state);
  if (element === null) {
    element = document.createElement("style");
    document.head.appendChild(element);
  }
  element.innerHTML = `*{cursor: ${style}!important;}`;
}
function computePaneFlexBoxStyle({ defaultSize, dragState, layout, paneData, paneIndex, precision = 3 }) {
  const size = layout[paneIndex];
  let flexGrow;
  if (size == null) {
    flexGrow = defaultSize ?? "1";
  } else if (paneData.length === 1) {
    flexGrow = "1";
  } else {
    flexGrow = size.toPrecision(precision);
  }
  return styleToString({
    "flex-basis": 0,
    "flex-grow": flexGrow,
    "flex-shrink": 1,
    // Without this, pane sizes may be unintentionally overridden by their content
    overflow: "hidden",
    // Disable pointer events inside of a pane during resize
    // This avoid edge cases like nested iframes
    "pointer-events": dragState !== null ? "none" : void 0
  });
}
function calculateAriaValues({ layout, panesArray, pivotIndices }) {
  let currentMinSize = 0;
  let currentMaxSize = 100;
  let totalMinSize = 0;
  let totalMaxSize = 0;
  const firstIndex = pivotIndices[0];
  for (let i = 0; i < panesArray.length; i++) {
    const { constraints } = panesArray[i];
    const { maxSize = 100, minSize = 0 } = constraints;
    if (i === firstIndex) {
      currentMinSize = minSize;
      currentMaxSize = maxSize;
    } else {
      totalMinSize += minSize;
      totalMaxSize += maxSize;
    }
  }
  const valueMax = Math.min(currentMaxSize, 100 - totalMinSize);
  const valueMin = Math.max(currentMinSize, 100 - totalMaxSize);
  const valueNow = layout[firstIndex];
  return {
    valueMax,
    valueMin,
    valueNow
  };
}
function generateId(idFromProps = null) {
  if (idFromProps == null)
    return nanoid(10);
  return idFromProps;
}
const LOCAL_STORAGE_DEBOUNCE_INTERVAL = 100;
const PRECISION = 10;
function initializeStorage(storageObject) {
  try {
    if (typeof localStorage === "undefined") {
      throw new Error("localStorage is not supported in this environment");
    }
    storageObject.getItem = (name) => localStorage.getItem(name);
    storageObject.setItem = (name, value) => localStorage.setItem(name, value);
  } catch (err) {
    /* @__PURE__ */ console.error(err);
    storageObject.getItem = () => null;
    storageObject.setItem = () => {
    };
  }
}
function getPaneGroupKey(autoSaveId) {
  return `paneforge:${autoSaveId}`;
}
function getPaneKey(panes) {
  const sortedPaneIds = panes.map((pane) => {
    const { constraints, id, idIsFromProps, order } = pane;
    return idIsFromProps ? id : order ? `${order}:${JSON.stringify(constraints)}` : JSON.stringify(constraints);
  }).sort().join(",");
  return sortedPaneIds;
}
function loadSerializedPaneGroupState(autoSaveId, storage) {
  try {
    const paneGroupKey = getPaneGroupKey(autoSaveId);
    const serialized = storage.getItem(paneGroupKey);
    const parsed = JSON.parse(serialized || "");
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch {
  }
  return null;
}
function loadPaneGroupState(autoSaveId, panes, storage) {
  const state = loadSerializedPaneGroupState(autoSaveId, storage) || {};
  const paneKey = getPaneKey(panes);
  return state[paneKey] || null;
}
function savePaneGroupState(autoSaveId, panes, paneSizesBeforeCollapse, sizes, storage) {
  const paneGroupKey = getPaneGroupKey(autoSaveId);
  const paneKey = getPaneKey(panes);
  const state = loadSerializedPaneGroupState(autoSaveId, storage) || {};
  state[paneKey] = {
    expandToSizes: Object.fromEntries(paneSizesBeforeCollapse.entries()),
    layout: sizes
  };
  try {
    storage.setItem(paneGroupKey, JSON.stringify(state));
  } catch (error) {
    /* @__PURE__ */ console.error(error);
  }
}
const debounceMap = {};
function debounce(callback, durationMs = 10) {
  let timeoutId = null;
  const callable = (...args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, durationMs);
  };
  return callable;
}
function updateStorageValues({ autoSaveId, layout, storage, paneDataArrayStore, paneSizeBeforeCollapseStore }) {
  const $paneDataArray = get(paneDataArrayStore);
  if (layout.length === 0 || layout.length !== $paneDataArray.length)
    return;
  let debouncedSave = debounceMap[autoSaveId];
  if (debouncedSave == null) {
    debouncedSave = debounce(savePaneGroupState, LOCAL_STORAGE_DEBOUNCE_INTERVAL);
    debounceMap[autoSaveId] = debouncedSave;
  }
  const clonedPaneDataArray = [...$paneDataArray];
  const $paneSizeBeforeCollapse = get(paneSizeBeforeCollapseStore);
  const clonedPaneSizesBeforeCollapse = new Map($paneSizeBeforeCollapse);
  debouncedSave(autoSaveId, clonedPaneDataArray, clonedPaneSizesBeforeCollapse, layout, storage);
}
function removeUndefined(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function areNumbersAlmostEqual(actual, expected, fractionDigits = PRECISION) {
  return compareNumbersWithTolerance(actual, expected, fractionDigits) === 0;
}
function compareNumbersWithTolerance(actual, expected, fractionDigits = PRECISION) {
  const roundedActual = roundTo(actual, fractionDigits);
  const roundedExpected = roundTo(expected, fractionDigits);
  return Math.sign(roundedActual - roundedExpected);
}
function areArraysEqual(arrA, arrB) {
  if (arrA.length !== arrB.length)
    return false;
  for (let index = 0; index < arrA.length; index++) {
    if (arrA[index] !== arrB[index])
      return false;
  }
  return true;
}
function roundTo(value, decimals) {
  return parseFloat(value.toFixed(decimals));
}
function assert(expectedCondition, message = "Assertion failed!") {
  if (!expectedCondition) {
    /* @__PURE__ */ console.error(message);
    throw Error(message);
  }
}
function resizePane({ paneConstraints: paneConstraintsArray, paneIndex, initialSize }) {
  const paneConstraints = paneConstraintsArray[paneIndex];
  assert(paneConstraints != null, "Pane constraints should not be null.");
  const { collapsedSize = 0, collapsible, maxSize = 100, minSize = 0 } = paneConstraints;
  let newSize = initialSize;
  if (compareNumbersWithTolerance(newSize, minSize) < 0) {
    newSize = getAdjustedSizeForCollapsible(newSize, collapsible, collapsedSize, minSize);
  }
  newSize = Math.min(maxSize, newSize);
  return parseFloat(newSize.toFixed(PRECISION));
}
function getAdjustedSizeForCollapsible(size, collapsible, collapsedSize, minSize) {
  if (!collapsible)
    return minSize;
  const halfwayPoint = (collapsedSize + minSize) / 2;
  return compareNumbersWithTolerance(size, halfwayPoint) < 0 ? collapsedSize : minSize;
}
function adjustLayoutByDelta({ delta, layout: prevLayout, paneConstraints: paneConstraintsArray, pivotIndices, trigger }) {
  if (areNumbersAlmostEqual(delta, 0))
    return prevLayout;
  const nextLayout = [...prevLayout];
  const [firstPivotIndex, secondPivotIndex] = pivotIndices;
  let deltaApplied = 0;
  {
    if (trigger === "keyboard") {
      {
        const index = delta < 0 ? secondPivotIndex : firstPivotIndex;
        const paneConstraints = paneConstraintsArray[index];
        assert(paneConstraints);
        if (paneConstraints.collapsible) {
          const prevSize = prevLayout[index];
          assert(prevSize != null);
          const paneConstraints2 = paneConstraintsArray[index];
          assert(paneConstraints2);
          const { collapsedSize = 0, minSize = 0 } = paneConstraints2;
          if (areNumbersAlmostEqual(prevSize, collapsedSize)) {
            const localDelta = minSize - prevSize;
            if (compareNumbersWithTolerance(localDelta, Math.abs(delta)) > 0) {
              delta = delta < 0 ? 0 - localDelta : localDelta;
            }
          }
        }
      }
      {
        const index = delta < 0 ? firstPivotIndex : secondPivotIndex;
        const paneConstraints = paneConstraintsArray[index];
        assert(paneConstraints);
        const { collapsible } = paneConstraints;
        if (collapsible) {
          const prevSize = prevLayout[index];
          assert(prevSize != null);
          const paneConstraints2 = paneConstraintsArray[index];
          assert(paneConstraints2);
          const { collapsedSize = 0, minSize = 0 } = paneConstraints2;
          if (areNumbersAlmostEqual(prevSize, minSize)) {
            const localDelta = prevSize - collapsedSize;
            if (compareNumbersWithTolerance(localDelta, Math.abs(delta)) > 0) {
              delta = delta < 0 ? 0 - localDelta : localDelta;
            }
          }
        }
      }
    }
  }
  {
    const increment = delta < 0 ? 1 : -1;
    let index = delta < 0 ? secondPivotIndex : firstPivotIndex;
    let maxAvailableDelta = 0;
    while (true) {
      const prevSize = prevLayout[index];
      assert(prevSize != null);
      const maxSafeSize = resizePane({
        paneConstraints: paneConstraintsArray,
        paneIndex: index,
        initialSize: 100
      });
      const delta2 = maxSafeSize - prevSize;
      maxAvailableDelta += delta2;
      index += increment;
      if (index < 0 || index >= paneConstraintsArray.length) {
        break;
      }
    }
    const minAbsDelta = Math.min(Math.abs(delta), Math.abs(maxAvailableDelta));
    delta = delta < 0 ? 0 - minAbsDelta : minAbsDelta;
  }
  {
    const pivotIndex = delta < 0 ? firstPivotIndex : secondPivotIndex;
    let index = pivotIndex;
    while (index >= 0 && index < paneConstraintsArray.length) {
      const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied);
      const prevSize = prevLayout[index];
      assert(prevSize != null);
      const unsafeSize = prevSize - deltaRemaining;
      const safeSize = resizePane({
        paneConstraints: paneConstraintsArray,
        paneIndex: index,
        initialSize: unsafeSize
      });
      if (!areNumbersAlmostEqual(prevSize, safeSize)) {
        deltaApplied += prevSize - safeSize;
        nextLayout[index] = safeSize;
        if (deltaApplied.toPrecision(3).localeCompare(Math.abs(delta).toPrecision(3), void 0, {
          numeric: true
        }) >= 0) {
          break;
        }
      }
      if (delta < 0) {
        index--;
      } else {
        index++;
      }
    }
  }
  if (areNumbersAlmostEqual(deltaApplied, 0)) {
    return prevLayout;
  }
  {
    const pivotIndex = delta < 0 ? secondPivotIndex : firstPivotIndex;
    const prevSize = prevLayout[pivotIndex];
    assert(prevSize != null);
    const unsafeSize = prevSize + deltaApplied;
    const safeSize = resizePane({
      paneConstraints: paneConstraintsArray,
      paneIndex: pivotIndex,
      initialSize: unsafeSize
    });
    nextLayout[pivotIndex] = safeSize;
    if (!areNumbersAlmostEqual(safeSize, unsafeSize)) {
      let deltaRemaining = unsafeSize - safeSize;
      const pivotIndex2 = delta < 0 ? secondPivotIndex : firstPivotIndex;
      let index = pivotIndex2;
      while (index >= 0 && index < paneConstraintsArray.length) {
        const prevSize2 = nextLayout[index];
        assert(prevSize2 != null);
        const unsafeSize2 = prevSize2 + deltaRemaining;
        const safeSize2 = resizePane({
          paneConstraints: paneConstraintsArray,
          paneIndex: index,
          initialSize: unsafeSize2
        });
        if (!areNumbersAlmostEqual(prevSize2, safeSize2)) {
          deltaRemaining -= safeSize2 - prevSize2;
          nextLayout[index] = safeSize2;
        }
        if (areNumbersAlmostEqual(deltaRemaining, 0))
          break;
        delta > 0 ? index-- : index++;
      }
    }
  }
  const totalSize = nextLayout.reduce((total, size) => size + total, 0);
  if (!areNumbersAlmostEqual(totalSize, 100))
    return prevLayout;
  return nextLayout;
}
const isBrowser = typeof document !== "undefined";
function isHTMLElement(element2) {
  return element2 instanceof HTMLElement;
}
function isKeyDown(event) {
  return event.type === "keydown";
}
function isMouseEvent(event) {
  return event.type.startsWith("mouse");
}
function isTouchEvent(event) {
  return event.type.startsWith("touch");
}
const defaultStorage = {
  getItem: (name) => {
    initializeStorage(defaultStorage);
    return defaultStorage.getItem(name);
  },
  setItem: (name, value) => {
    initializeStorage(defaultStorage);
    defaultStorage.setItem(name, value);
  }
};
const defaultProps = {
  id: null,
  onLayout: null,
  keyboardResizeBy: null,
  autoSaveId: null,
  direction: "horizontal",
  storage: defaultStorage
};
function createPaneForge(props) {
  const withDefaults = {
    ...defaultProps,
    ...removeUndefined(props)
  };
  const options = toWritableStores(withDefaults);
  const { autoSaveId, direction, keyboardResizeBy, storage, onLayout } = options;
  const groupId = writable(generateId());
  const dragState = writable(null);
  const layout = writable([]);
  const paneDataArray = writable([]);
  const paneDataArrayChanged = writable(false);
  const paneIdToLastNotifiedSizeMap = writable({});
  const paneSizeBeforeCollapseMap = writable(/* @__PURE__ */ new Map());
  const prevDelta = writable(0);
  clientEffect([groupId, layout, paneDataArray], ([$groupId, $layout, $paneDataArray]) => {
    const unsub = updateResizeHandleAriaValues({
      groupId: $groupId,
      layout: $layout,
      paneDataArray: $paneDataArray
    });
    return unsub;
  });
  clientEffect([autoSaveId, layout, storage], ([$autoSaveId, $layout, $storage]) => {
    if (!$autoSaveId)
      return;
    updateStorageValues({
      autoSaveId: $autoSaveId,
      layout: $layout,
      storage: $storage,
      paneDataArrayStore: paneDataArray,
      paneSizeBeforeCollapseStore: paneSizeBeforeCollapseMap
    });
  });
  function collapsePane(paneData) {
    const $prevLayout = get(layout);
    const $paneDataArray = get(paneDataArray);
    if (!paneData.constraints.collapsible)
      return;
    const paneConstraintsArray = $paneDataArray.map((paneData2) => paneData2.constraints);
    const { collapsedSize = 0, paneSize, pivotIndices } = paneDataHelper($paneDataArray, paneData, $prevLayout);
    assert(paneSize != null);
    if (paneSize === collapsedSize)
      return;
    paneSizeBeforeCollapseMap.update((curr) => {
      curr.set(paneData.id, paneSize);
      return curr;
    });
    const isLastPane = findPaneDataIndex($paneDataArray, paneData) === $paneDataArray.length - 1;
    const delta = isLastPane ? paneSize - collapsedSize : collapsedSize - paneSize;
    const nextLayout = adjustLayoutByDelta({
      delta,
      layout: $prevLayout,
      paneConstraints: paneConstraintsArray,
      pivotIndices,
      trigger: "imperative-api"
    });
    if (areArraysEqual($prevLayout, nextLayout))
      return;
    layout.set(nextLayout);
    const $onLayout = get(onLayout);
    if ($onLayout) {
      $onLayout(nextLayout);
    }
    callPaneCallbacks($paneDataArray, nextLayout, get(paneIdToLastNotifiedSizeMap));
  }
  function getPaneSize(paneData) {
    const $layout = get(layout);
    const $paneDataArray = get(paneDataArray);
    const { paneSize } = paneDataHelper($paneDataArray, paneData, $layout);
    return paneSize;
  }
  const getPaneStyle = derived([paneDataArray, layout, dragState], ([$paneDataArray, $layout, $dragState]) => {
    return (paneData, defaultSize) => {
      const paneIndex = findPaneDataIndex($paneDataArray, paneData);
      return computePaneFlexBoxStyle({
        defaultSize,
        dragState: $dragState,
        layout: $layout,
        paneData: $paneDataArray,
        paneIndex
      });
    };
  });
  function isPaneExpanded(paneData) {
    const $paneDataArray = get(paneDataArray);
    const $layout = get(layout);
    const { collapsedSize = 0, collapsible, paneSize } = paneDataHelper($paneDataArray, paneData, $layout);
    return !collapsible || paneSize > collapsedSize;
  }
  function registerPane(paneData) {
    paneDataArray.update((curr) => {
      const newArr = [...curr, paneData];
      newArr.sort((paneA, paneB) => {
        const orderA = paneA.order;
        const orderB = paneB.order;
        if (orderA == null && orderB == null) {
          return 0;
        } else if (orderA == null) {
          return -1;
        } else if (orderB == null) {
          return 1;
        } else {
          return orderA - orderB;
        }
      });
      return newArr;
    });
    paneDataArrayChanged.set(true);
  }
  clientEffect([paneDataArrayChanged], ([$paneDataArrayChanged]) => {
    if (!$paneDataArrayChanged)
      return;
    paneDataArrayChanged.set(false);
    const $autoSaveId = get(autoSaveId);
    const $storage = get(storage);
    const $prevLayout = get(layout);
    const $paneDataArray = get(paneDataArray);
    let unsafeLayout = null;
    if ($autoSaveId) {
      const state = loadPaneGroupState($autoSaveId, $paneDataArray, $storage);
      if (state) {
        paneSizeBeforeCollapseMap.set(new Map(Object.entries(state.expandToSizes)));
        unsafeLayout = state.layout;
      }
    }
    if (unsafeLayout == null) {
      unsafeLayout = getUnsafeDefaultLayout({
        paneDataArray: $paneDataArray
      });
    }
    const nextLayout = validatePaneGroupLayout({
      layout: unsafeLayout,
      paneConstraints: $paneDataArray.map((paneData) => paneData.constraints)
    });
    if (areArraysEqual($prevLayout, nextLayout))
      return;
    layout.set(nextLayout);
    const $onLayout = get(onLayout);
    if ($onLayout) {
      $onLayout(nextLayout);
    }
    callPaneCallbacks($paneDataArray, nextLayout, get(paneIdToLastNotifiedSizeMap));
  });
  function registerResizeHandle(dragHandleId) {
    return function resizeHandler(event) {
      event.preventDefault();
      const $direction = get(direction);
      const $dragState = get(dragState);
      const $groupId = get(groupId);
      const $keyboardResizeBy = get(keyboardResizeBy);
      const $prevLayout = get(layout);
      const $paneDataArray = get(paneDataArray);
      const { initialLayout } = $dragState ?? {};
      const pivotIndices = getPivotIndices($groupId, dragHandleId);
      let delta = getDeltaPercentage(event, dragHandleId, $direction, $dragState, $keyboardResizeBy);
      if (delta === 0)
        return;
      const isHorizontal = $direction === "horizontal";
      if (document.dir === "rtl" && isHorizontal) {
        delta = -delta;
      }
      const paneConstraints = $paneDataArray.map((paneData) => paneData.constraints);
      const nextLayout = adjustLayoutByDelta({
        delta,
        layout: initialLayout ?? $prevLayout,
        paneConstraints,
        pivotIndices,
        trigger: isKeyDown(event) ? "keyboard" : "mouse-or-touch"
      });
      const layoutChanged = !areArraysEqual($prevLayout, nextLayout);
      if (isMouseEvent(event) || isTouchEvent(event)) {
        const $prevDelta = get(prevDelta);
        if ($prevDelta != delta) {
          prevDelta.set(delta);
          if (!layoutChanged) {
            if (isHorizontal) {
              setGlobalCursorStyle(delta < 0 ? "horizontal-min" : "horizontal-max");
            } else {
              setGlobalCursorStyle(delta < 0 ? "vertical-min" : "vertical-max");
            }
          } else {
            setGlobalCursorStyle(isHorizontal ? "horizontal" : "vertical");
          }
        }
      }
      if (layoutChanged) {
        layout.set(nextLayout);
        const $onLayout = get(onLayout);
        if ($onLayout) {
          $onLayout(nextLayout);
        }
        callPaneCallbacks($paneDataArray, nextLayout, get(paneIdToLastNotifiedSizeMap));
      }
    };
  }
  function resizePane2(paneData, unsafePaneSize) {
    const $prevLayout = get(layout);
    const $paneDataArray = get(paneDataArray);
    const paneConstraintsArr = $paneDataArray.map((paneData2) => paneData2.constraints);
    const { paneSize, pivotIndices } = paneDataHelper($paneDataArray, paneData, $prevLayout);
    assert(paneSize != null);
    const isLastPane = findPaneDataIndex($paneDataArray, paneData) === $paneDataArray.length - 1;
    const delta = isLastPane ? paneSize - unsafePaneSize : unsafePaneSize - paneSize;
    const nextLayout = adjustLayoutByDelta({
      delta,
      layout: $prevLayout,
      paneConstraints: paneConstraintsArr,
      pivotIndices,
      trigger: "imperative-api"
    });
    if (areArraysEqual($prevLayout, nextLayout))
      return;
    layout.set(nextLayout);
    const $onLayout = get(onLayout);
    $onLayout?.(nextLayout);
    callPaneCallbacks($paneDataArray, nextLayout, get(paneIdToLastNotifiedSizeMap));
  }
  function startDragging(dragHandleId, event) {
    const $direction = get(direction);
    const $layout = get(layout);
    const handleElement = getResizeHandleElement(dragHandleId);
    assert(handleElement);
    const initialCursorPosition = getResizeEventCursorPosition($direction, event);
    dragState.set({
      dragHandleId,
      dragHandleRect: handleElement.getBoundingClientRect(),
      initialCursorPosition,
      initialLayout: $layout
    });
  }
  function stopDragging() {
    resetGlobalCursorStyle();
    dragState.set(null);
  }
  function unregisterPane(paneData) {
    const $paneDataArray = get(paneDataArray);
    const index = findPaneDataIndex($paneDataArray, paneData);
    if (index < 0)
      return;
    paneDataArray.update((curr) => {
      curr.splice(index, 1);
      paneIdToLastNotifiedSizeMap.update((curr2) => {
        delete curr2[paneData.id];
        return curr2;
      });
      paneDataArrayChanged.set(true);
      return curr;
    });
  }
  function isPaneCollapsed(paneData) {
    const $paneDataArray = get(paneDataArray);
    const $layout = get(layout);
    const { collapsedSize = 0, collapsible, paneSize } = paneDataHelper($paneDataArray, paneData, $layout);
    return collapsible === true && paneSize === collapsedSize;
  }
  function expandPane(paneData) {
    const $prevLayout = get(layout);
    const $paneDataArray = get(paneDataArray);
    if (!paneData.constraints.collapsible)
      return;
    const paneConstraintsArray = $paneDataArray.map((paneData2) => paneData2.constraints);
    const { collapsedSize = 0, paneSize, minSize = 0, pivotIndices } = paneDataHelper($paneDataArray, paneData, $prevLayout);
    if (paneSize !== collapsedSize)
      return;
    const prevPaneSize = get(paneSizeBeforeCollapseMap).get(paneData.id);
    const baseSize = prevPaneSize != null && prevPaneSize >= minSize ? prevPaneSize : minSize;
    const isLastPane = findPaneDataIndex($paneDataArray, paneData) === $paneDataArray.length - 1;
    const delta = isLastPane ? paneSize - baseSize : baseSize - paneSize;
    const nextLayout = adjustLayoutByDelta({
      delta,
      layout: $prevLayout,
      paneConstraints: paneConstraintsArray,
      pivotIndices,
      trigger: "imperative-api"
    });
    if (areArraysEqual($prevLayout, nextLayout))
      return;
    layout.set(nextLayout);
    const $onLayout = get(onLayout);
    $onLayout?.(nextLayout);
    callPaneCallbacks($paneDataArray, nextLayout, get(paneIdToLastNotifiedSizeMap));
  }
  const paneGroupStyle = derived([direction], ([$direction]) => {
    return styleToString({
      display: "flex",
      "flex-direction": $direction === "horizontal" ? "row" : "column",
      height: "100%",
      overflow: "hidden",
      width: "100%"
    });
  });
  const paneGroupSelectors = derived([direction, groupId], ([$direction, $groupId]) => {
    return {
      "data-pane-group": "",
      "data-direction": $direction,
      "data-pane-group-id": $groupId
    };
  });
  const paneGroupAttrs = derived([paneGroupStyle, paneGroupSelectors], ([$style, $selectors]) => {
    return {
      style: $style,
      ...$selectors
    };
  });
  function setLayout(newLayout) {
    layout.set(newLayout);
  }
  function getLayout() {
    return get(layout);
  }
  return {
    methods: {
      collapsePane,
      expandPane,
      getSize: getPaneSize,
      getPaneStyle,
      isCollapsed: isPaneCollapsed,
      isExpanded: isPaneExpanded,
      registerPane,
      registerResizeHandle,
      resizePane: resizePane2,
      startDragging,
      stopDragging,
      unregisterPane,
      setLayout,
      getLayout
    },
    states: {
      direction,
      dragState,
      groupId,
      paneGroupAttrs,
      paneGroupSelectors,
      paneGroupStyle,
      layout
    },
    options
  };
}
function updateResizeHandleAriaValues({ groupId, layout, paneDataArray }) {
  const resizeHandleElements = getResizeHandleElementsForGroup(groupId);
  for (let index = 0; index < paneDataArray.length - 1; index++) {
    const { valueMax, valueMin, valueNow } = calculateAriaValues({
      layout,
      panesArray: paneDataArray,
      pivotIndices: [index, index + 1]
    });
    const resizeHandleEl = resizeHandleElements[index];
    if (isHTMLElement(resizeHandleEl)) {
      const paneData = paneDataArray[index];
      resizeHandleEl.setAttribute("aria-controls", paneData.id);
      resizeHandleEl.setAttribute("aria-valuemax", "" + Math.round(valueMax));
      resizeHandleEl.setAttribute("aria-valuemin", "" + Math.round(valueMin));
      resizeHandleEl.setAttribute("aria-valuenow", valueNow != null ? "" + Math.round(valueNow) : "");
    }
  }
  return () => {
    resizeHandleElements.forEach((resizeHandleElement) => {
      resizeHandleElement.removeAttribute("aria-controls");
      resizeHandleElement.removeAttribute("aria-valuemax");
      resizeHandleElement.removeAttribute("aria-valuemin");
      resizeHandleElement.removeAttribute("aria-valuenow");
    });
  };
}
function getResizeHandleElementsForGroup(groupId) {
  if (!isBrowser)
    return [];
  return Array.from(document.querySelectorAll(`[data-pane-resizer-id][data-pane-group-id="${groupId}"]`));
}
function getPaneGroupElement(id) {
  if (!isBrowser)
    return null;
  const element2 = document.querySelector(`[data-pane-group][data-pane-group-id="${id}"]`);
  if (element2) {
    return element2;
  }
  return null;
}
function getResizeHandleElement(id) {
  if (!isBrowser)
    return null;
  const element2 = document.querySelector(`[data-pane-resizer-id="${id}"]`);
  if (element2) {
    return element2;
  }
  return null;
}
function getResizeHandleElementIndex(groupId, id) {
  if (!isBrowser)
    return null;
  const handles = getResizeHandleElementsForGroup(groupId);
  const index = handles.findIndex((handle) => handle.getAttribute("data-pane-resizer-id") === id);
  return index ?? null;
}
function getPivotIndices(groupId, dragHandleId) {
  const index = getResizeHandleElementIndex(groupId, dragHandleId);
  return index != null ? [index, index + 1] : [-1, -1];
}
function paneDataHelper(paneDataArray, paneData, layout) {
  const paneConstraintsArray = paneDataArray.map((paneData2) => paneData2.constraints);
  const paneIndex = findPaneDataIndex(paneDataArray, paneData);
  const paneConstraints = paneConstraintsArray[paneIndex];
  const isLastPane = paneIndex === paneDataArray.length - 1;
  const pivotIndices = isLastPane ? [paneIndex - 1, paneIndex] : [paneIndex, paneIndex + 1];
  const paneSize = layout[paneIndex];
  return {
    ...paneConstraints,
    paneSize,
    pivotIndices
  };
}
function findPaneDataIndex(paneDataArray, paneData) {
  return paneDataArray.findIndex((prevPaneData) => prevPaneData.id === paneData.id);
}
function callPaneCallbacks(paneArray, layout, paneIdToLastNotifiedSizeMap) {
  layout.forEach((size, index) => {
    const paneData = paneArray[index];
    assert(paneData);
    const { callbacks, constraints, id: paneId } = paneData;
    const { collapsedSize = 0, collapsible } = constraints;
    const lastNotifiedSize = paneIdToLastNotifiedSizeMap[paneId];
    if (!(lastNotifiedSize == null || size !== lastNotifiedSize))
      return;
    paneIdToLastNotifiedSizeMap[paneId] = size;
    const { onCollapse, onExpand, onResize } = callbacks;
    onResize?.(size, lastNotifiedSize);
    if (collapsible && (onCollapse || onExpand)) {
      if (onExpand && (lastNotifiedSize == null || lastNotifiedSize === collapsedSize) && size !== collapsedSize) {
        onExpand();
      }
      if (onCollapse && (lastNotifiedSize == null || lastNotifiedSize !== collapsedSize) && size === collapsedSize) {
        onCollapse();
      }
    }
  });
}
function getUnsafeDefaultLayout({ paneDataArray }) {
  const layout = Array(paneDataArray.length);
  const paneConstraintsArray = paneDataArray.map((paneData) => paneData.constraints);
  let numPanesWithSizes = 0;
  let remainingSize = 100;
  for (let index = 0; index < paneDataArray.length; index++) {
    const paneConstraints = paneConstraintsArray[index];
    assert(paneConstraints);
    const { defaultSize } = paneConstraints;
    if (defaultSize != null) {
      numPanesWithSizes++;
      layout[index] = defaultSize;
      remainingSize -= defaultSize;
    }
  }
  for (let index = 0; index < paneDataArray.length; index++) {
    const paneConstraints = paneConstraintsArray[index];
    assert(paneConstraints);
    const { defaultSize } = paneConstraints;
    if (defaultSize != null) {
      continue;
    }
    const numRemainingPanes = paneDataArray.length - numPanesWithSizes;
    const size = remainingSize / numRemainingPanes;
    numPanesWithSizes++;
    layout[index] = size;
    remainingSize -= size;
  }
  return layout;
}
function validatePaneGroupLayout({ layout: prevLayout, paneConstraints }) {
  const nextLayout = [...prevLayout];
  const nextLayoutTotalSize = nextLayout.reduce((accumulated, current) => accumulated + current, 0);
  if (nextLayout.length !== paneConstraints.length) {
    throw Error(`Invalid ${paneConstraints.length} pane layout: ${nextLayout.map((size) => `${size}%`).join(", ")}`);
  } else if (!areNumbersAlmostEqual(nextLayoutTotalSize, 100)) {
    for (let index = 0; index < paneConstraints.length; index++) {
      const unsafeSize = nextLayout[index];
      assert(unsafeSize != null);
      const safeSize = 100 / nextLayoutTotalSize * unsafeSize;
      nextLayout[index] = safeSize;
    }
  }
  let remainingSize = 0;
  for (let index = 0; index < paneConstraints.length; index++) {
    const unsafeSize = nextLayout[index];
    assert(unsafeSize != null);
    const safeSize = resizePane({
      paneConstraints,
      paneIndex: index,
      initialSize: unsafeSize
    });
    if (unsafeSize != safeSize) {
      remainingSize += unsafeSize - safeSize;
      nextLayout[index] = safeSize;
    }
  }
  if (!areNumbersAlmostEqual(remainingSize, 0)) {
    for (let index = 0; index < paneConstraints.length; index++) {
      const prevSize = nextLayout[index];
      assert(prevSize != null);
      const unsafeSize = prevSize + remainingSize;
      const safeSize = resizePane({
        paneConstraints,
        paneIndex: index,
        initialSize: unsafeSize
      });
      if (prevSize !== safeSize) {
        remainingSize -= safeSize - prevSize;
        nextLayout[index] = safeSize;
        if (areNumbersAlmostEqual(remainingSize, 0)) {
          break;
        }
      }
    }
  }
  return nextLayout;
}
function getDeltaPercentage(e, dragHandleId, dir, initialDragState, keyboardResizeBy) {
  if (isKeyDown(e)) {
    const isHorizontal = dir === "horizontal";
    let delta = 0;
    if (e.shiftKey) {
      delta = 100;
    } else if (keyboardResizeBy != null) {
      delta = keyboardResizeBy;
    } else {
      delta = 10;
    }
    let movement = 0;
    switch (e.key) {
      case "ArrowDown":
        movement = isHorizontal ? 0 : delta;
        break;
      case "ArrowLeft":
        movement = isHorizontal ? -delta : 0;
        break;
      case "ArrowRight":
        movement = isHorizontal ? delta : 0;
        break;
      case "ArrowUp":
        movement = isHorizontal ? 0 : -delta;
        break;
      case "End":
        movement = 100;
        break;
      case "Home":
        movement = -100;
        break;
    }
    return movement;
  } else {
    if (initialDragState == null)
      return 0;
    return getDragOffsetPercentage(e, dragHandleId, dir, initialDragState);
  }
}
function getDragOffsetPercentage(e, dragHandleId, dir, initialDragState) {
  const isHorizontal = dir === "horizontal";
  const handleElement = getResizeHandleElement(dragHandleId);
  assert(handleElement);
  const groupId = handleElement.getAttribute("data-pane-group-id");
  assert(groupId);
  const { initialCursorPosition } = initialDragState;
  const cursorPosition = getResizeEventCursorPosition(dir, e);
  const groupElement = getPaneGroupElement(groupId);
  assert(groupElement);
  const groupRect = groupElement.getBoundingClientRect();
  const groupSizeInPixels = isHorizontal ? groupRect.width : groupRect.height;
  const offsetPixels = cursorPosition - initialCursorPosition;
  const offsetPercentage = offsetPixels / groupSizeInPixels * 100;
  return offsetPercentage;
}
function getResizeEventCursorPosition(dir, e) {
  const isHorizontal = dir === "horizontal";
  if (isMouseEvent(e)) {
    return isHorizontal ? e.clientX : e.clientY;
  } else if (isTouchEvent(e)) {
    const firstTouch = e.touches[0];
    assert(firstTouch);
    return isHorizontal ? firstTouch.screenX : firstTouch.screenY;
  } else {
    throw Error(`Unsupported event type "${e.type}"`);
  }
}
const PF_GROUP_CTX = Symbol("PF_GROUP_CTX");
function setCtx(props) {
  const paneForge = createPaneForge(removeUndefined(props));
  const updateOption = getOptionUpdater(paneForge.options);
  const ctxValue = { ...paneForge, updateOption };
  setContext(PF_GROUP_CTX, ctxValue);
  return ctxValue;
}
function getCtx(componentName) {
  if (!hasContext(PF_GROUP_CTX)) {
    throw new Error(`${componentName} components must be rendered with a <PaneGroup> container`);
  }
  return getContext(PF_GROUP_CTX);
}
function Pane_group($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "autoSaveId",
    "direction",
    "id",
    "keyboardResizeBy",
    "onLayoutChange",
    "storage",
    "el",
    "paneGroup",
    "style"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let style;
    let autoSaveId = fallback($$props["autoSaveId"], null);
    let direction = $$props["direction"];
    let id = fallback($$props["id"], null);
    let keyboardResizeBy = fallback($$props["keyboardResizeBy"], null);
    let onLayoutChange = fallback($$props["onLayoutChange"], null);
    let storage = fallback($$props["storage"], defaultStorage);
    let el = fallback($$props["el"], () => void 0, true);
    let paneGroup = fallback($$props["paneGroup"], () => void 0, true);
    let styleFromProps = fallback($$props["style"], () => void 0, true);
    const {
      states: { paneGroupStyle, paneGroupSelectors, groupId },
      methods: { setLayout, getLayout },
      updateOption
    } = setCtx({
      autoSaveId,
      direction,
      id,
      keyboardResizeBy,
      onLayout: onLayoutChange,
      storage
    });
    paneGroup = {
      getLayout,
      setLayout,
      getId: () => store_get($$store_subs ??= {}, "$groupId", groupId)
    };
    updateOption("autoSaveId", autoSaveId);
    updateOption("direction", direction);
    updateOption("id", id);
    updateOption("keyboardResizeBy", keyboardResizeBy);
    updateOption("onLayout", onLayoutChange);
    updateOption("storage", storage);
    style = store_get($$store_subs ??= {}, "$paneGroupStyle", paneGroupStyle) + (styleFromProps ?? "");
    $$renderer2.push(`<div${attributes({
      id: store_get($$store_subs ??= {}, "$groupId", groupId),
      ...store_get($$store_subs ??= {}, "$paneGroupSelectors", paneGroupSelectors),
      style,
      ...$$restProps
    })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      autoSaveId,
      direction,
      id,
      keyboardResizeBy,
      onLayoutChange,
      storage,
      el,
      paneGroup,
      style: styleFromProps
    });
  });
}
function Pane($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "collapsedSize",
    "collapsible",
    "defaultSize",
    "maxSize",
    "minSize",
    "onCollapse",
    "onExpand",
    "onResize",
    "order",
    "el",
    "pane",
    "id",
    "style"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let style, attrs;
    let collapsedSize = fallback($$props["collapsedSize"], () => void 0, true);
    let collapsible = fallback($$props["collapsible"], () => void 0, true);
    let defaultSize = fallback($$props["defaultSize"], () => void 0, true);
    let maxSize = fallback($$props["maxSize"], () => void 0, true);
    let minSize = fallback($$props["minSize"], () => void 0, true);
    let onCollapse = fallback($$props["onCollapse"], () => void 0, true);
    let onExpand = fallback($$props["onExpand"], () => void 0, true);
    let onResize = fallback($$props["onResize"], () => void 0, true);
    let order = fallback($$props["order"], () => void 0, true);
    let el = fallback($$props["el"], () => void 0, true);
    let pane = fallback($$props["pane"], () => void 0, true);
    let idFromProps = fallback($$props["id"], () => void 0, true);
    let styleFromProps = fallback($$props["style"], () => void 0, true);
    const {
      methods: {
        getPaneStyle,
        registerPane,
        unregisterPane,
        collapsePane,
        expandPane,
        getSize,
        isCollapsed,
        isExpanded,
        resizePane: resizePane2
      },
      states: { groupId }
    } = getCtx("Pane");
    const paneId = generateId(idFromProps);
    let paneData;
    pane = {
      collapse: () => {
        collapsePane(paneData);
      },
      expand: () => expandPane(paneData),
      getSize: () => getSize(paneData),
      isCollapsed: () => isCollapsed(paneData),
      isExpanded: () => isExpanded(paneData),
      resize: (size) => resizePane2(paneData, size),
      getId: () => paneId
    };
    paneData = {
      callbacks: { onCollapse, onExpand, onResize },
      constraints: { collapsedSize, collapsible, defaultSize, maxSize, minSize },
      id: paneId,
      idIsFromProps: idFromProps !== void 0,
      order
    };
    style = store_get($$store_subs ??= {}, "$getPaneStyle", getPaneStyle)(paneData, defaultSize) + (styleFromProps ?? "");
    attrs = {
      "data-pane": "",
      "data-pane-id": paneId,
      "data-pane-group-id": store_get($$store_subs ??= {}, "$groupId", groupId)
    };
    $$renderer2.push(`<div${attributes({ style, ...attrs, ...$$restProps })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      collapsedSize,
      collapsible,
      defaultSize,
      maxSize,
      minSize,
      onCollapse,
      onExpand,
      onResize,
      order,
      el,
      pane,
      id: idFromProps,
      style: styleFromProps
    });
  });
}
function Drawer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let show = fallback($$props["show"], false);
    let className = fallback($$props["className"], "");
    let onClose = fallback($$props["onClose"], () => {
    });
    let modalElement = null;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isTopModal()) {
        /* @__PURE__ */ console.log("Escape");
        show = false;
      }
    };
    const isTopModal = () => {
      const modals = document.getElementsByClassName("modal");
      return modals.length && modals[modals.length - 1] === modalElement;
    };
    onDestroy(() => {
      show = false;
    });
    if (show && modalElement) {
      document.body.appendChild(modalElement);
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    if (show) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal fixed right-0 bottom-0 left-0 z-999 flex h-screen max-h-[100dvh] w-full justify-center overflow-hidden overscroll-contain bg-black/60"><div${attr_class(` mt-auto w-full bg-gray-50 dark:bg-gray-900 dark:text-gray-100 ${stringify(className)} scrollbar-hidden max-h-[100dvh] overflow-y-auto`, "svelte-1u2o1qj")}><!--[-->`);
      slot($$renderer2, $$props, "default", {}, null);
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { show, className, onClose });
  });
}
function VirtualList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let items = $$props["items"];
    let height = fallback($$props["height"], "100%");
    let itemHeight = fallback($$props["itemHeight"], void 0);
    let start = fallback($$props["start"], 0);
    let end = fallback($$props["end"], 0);
    let visible;
    let top = 0;
    let bottom = 0;
    visible = items.slice(start, end).map((data, i) => {
      return { index: i + start, data };
    });
    $$renderer2.push(`<svelte-virtual-list-viewport${attr_style(`height: ${stringify(
      // wait until the DOM is up to date
      // render the newly visible row
      // prevent jumping if we scrolled up into unknown territory
      // TODO if we overestimated the space these
      // rows would occupy we may need to add some
      // more. maybe we can just call handle_scroll again?
      // trigger initial refresh
      height
    )};`)} class="svelte-m5no5e"><svelte-virtual-list-contents${attr_style(`padding-top: ${stringify(top)}px; padding-bottom: ${stringify(bottom)}px;`)} class="svelte-m5no5e"><!--[-->`);
    const each_array = ensure_array_like(visible);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let row = each_array[$$index];
      $$renderer2.push(`<svelte-virtual-list-row class="svelte-m5no5e"><!--[-->`);
      slot($$renderer2, $$props, "default", { item: row.data }, () => {
        $$renderer2.push(`Missing template`);
      });
      $$renderer2.push(`<!--]--></svelte-virtual-list-row>`);
    }
    $$renderer2.push(`<!--]--></svelte-virtual-list-contents></svelte-virtual-list-viewport>`);
    bind_props($$props, { items, height, itemHeight, start, end });
  });
}
const Component = [
  "1F3FB",
  "1F3FC",
  "1F3FD",
  "1F3FE",
  "1F3FF",
  "1F9B0",
  "1F9B1",
  "1F9B3",
  "1F9B2"
];
const Activities = [
  "1F383",
  "1F384",
  "1F386",
  "1F387",
  "1F9E8",
  "2728",
  "1F388",
  "1F389",
  "1F38A",
  "1F38B",
  "1F38D",
  "1F38E",
  "1F38F",
  "1F390",
  "1F391",
  "1F9E7",
  "1F380",
  "1F381",
  "1F397-FE0F",
  "1F397",
  "1F39F-FE0F",
  "1F39F",
  "1F3AB",
  "1F396-FE0F",
  "1F396",
  "1F3C6",
  "1F3C5",
  "1F947",
  "1F948",
  "1F949",
  "26BD",
  "26BE",
  "1F94E",
  "1F3C0",
  "1F3D0",
  "1F3C8",
  "1F3C9",
  "1F3BE",
  "1F94F",
  "1F3B3",
  "1F3CF",
  "1F3D1",
  "1F3D2",
  "1F94D",
  "1F3D3",
  "1F3F8",
  "1F94A",
  "1F94B",
  "1F945",
  "26F3",
  "26F8-FE0F",
  "26F8",
  "1F3A3",
  "1F93F",
  "1F3BD",
  "1F3BF",
  "1F6F7",
  "1F94C",
  "1F3AF",
  "1FA80",
  "1FA81",
  "1F52B",
  "1F3B1",
  "1F52E",
  "1FA84",
  "1F3AE",
  "1F579-FE0F",
  "1F579",
  "1F3B0",
  "1F3B2",
  "1F9E9",
  "1F9F8",
  "1FA85",
  "1FAA9",
  "1FA86",
  "2660-FE0F",
  "2660",
  "2665-FE0F",
  "2665",
  "2666-FE0F",
  "2666",
  "2663-FE0F",
  "2663",
  "265F-FE0F",
  "265F",
  "1F0CF",
  "1F004",
  "1F3B4",
  "1F3AD",
  "1F5BC-FE0F",
  "1F5BC",
  "1F3A8",
  "1F9F5",
  "1FAA1",
  "1F9F6",
  "1FAA2"
];
const Objects = [
  "1F453",
  "1F576-FE0F",
  "1F576",
  "1F97D",
  "1F97C",
  "1F9BA",
  "1F454",
  "1F455",
  "1F456",
  "1F9E3",
  "1F9E4",
  "1F9E5",
  "1F9E6",
  "1F457",
  "1F458",
  "1F97B",
  "1FA71",
  "1FA72",
  "1FA73",
  "1F459",
  "1F45A",
  "1FAAD",
  "1F45B",
  "1F45C",
  "1F45D",
  "1F6CD-FE0F",
  "1F6CD",
  "1F392",
  "1FA74",
  "1F45E",
  "1F45F",
  "1F97E",
  "1F97F",
  "1F460",
  "1F461",
  "1FA70",
  "1F462",
  "1FAAE",
  "1F451",
  "1F452",
  "1F3A9",
  "1F393",
  "1F9E2",
  "1FA96",
  "26D1-FE0F",
  "26D1",
  "1F4FF",
  "1F484",
  "1F48D",
  "1F48E",
  "1F507",
  "1F508",
  "1F509",
  "1F50A",
  "1F4E2",
  "1F4E3",
  "1F4EF",
  "1F514",
  "1F515",
  "1F3BC",
  "1F3B5",
  "1F3B6",
  "1F399-FE0F",
  "1F399",
  "1F39A-FE0F",
  "1F39A",
  "1F39B-FE0F",
  "1F39B",
  "1F3A4",
  "1F3A7",
  "1F4FB",
  "1F3B7",
  "1FA97",
  "1F3B8",
  "1F3B9",
  "1F3BA",
  "1F3BB",
  "1FA95",
  "1F941",
  "1FA98",
  "1FA87",
  "1FA88",
  "1FA89",
  "1F4F1",
  "1F4F2",
  "260E-FE0F",
  "260E",
  "1F4DE",
  "1F4DF",
  "1F4E0",
  "1F50B",
  "1FAAB",
  "1F50C",
  "1F4BB",
  "1F5A5-FE0F",
  "1F5A5",
  "1F5A8-FE0F",
  "1F5A8",
  "2328-FE0F",
  "2328",
  "1F5B1-FE0F",
  "1F5B1",
  "1F5B2-FE0F",
  "1F5B2",
  "1F4BD",
  "1F4BE",
  "1F4BF",
  "1F4C0",
  "1F9EE",
  "1F3A5",
  "1F39E-FE0F",
  "1F39E",
  "1F4FD-FE0F",
  "1F4FD",
  "1F3AC",
  "1F4FA",
  "1F4F7",
  "1F4F8",
  "1F4F9",
  "1F4FC",
  "1F50D",
  "1F50E",
  "1F56F-FE0F",
  "1F56F",
  "1F4A1",
  "1F526",
  "1F3EE",
  "1FA94",
  "1F4D4",
  "1F4D5",
  "1F4D6",
  "1F4D7",
  "1F4D8",
  "1F4D9",
  "1F4DA",
  "1F4D3",
  "1F4D2",
  "1F4C3",
  "1F4DC",
  "1F4C4",
  "1F4F0",
  "1F5DE-FE0F",
  "1F5DE",
  "1F4D1",
  "1F516",
  "1F3F7-FE0F",
  "1F3F7",
  "1F4B0",
  "1FA99",
  "1F4B4",
  "1F4B5",
  "1F4B6",
  "1F4B7",
  "1F4B8",
  "1F4B3",
  "1F9FE",
  "1F4B9",
  "2709-FE0F",
  "2709",
  "1F4E7",
  "1F4E8",
  "1F4E9",
  "1F4E4",
  "1F4E5",
  "1F4E6",
  "1F4EB",
  "1F4EA",
  "1F4EC",
  "1F4ED",
  "1F4EE",
  "1F5F3-FE0F",
  "1F5F3",
  "270F-FE0F",
  "270F",
  "2712-FE0F",
  "2712",
  "1F58B-FE0F",
  "1F58B",
  "1F58A-FE0F",
  "1F58A",
  "1F58C-FE0F",
  "1F58C",
  "1F58D-FE0F",
  "1F58D",
  "1F4DD",
  "1F4BC",
  "1F4C1",
  "1F4C2",
  "1F5C2-FE0F",
  "1F5C2",
  "1F4C5",
  "1F4C6",
  "1F5D2-FE0F",
  "1F5D2",
  "1F5D3-FE0F",
  "1F5D3",
  "1F4C7",
  "1F4C8",
  "1F4C9",
  "1F4CA",
  "1F4CB",
  "1F4CC",
  "1F4CD",
  "1F4CE",
  "1F587-FE0F",
  "1F587",
  "1F4CF",
  "1F4D0",
  "2702-FE0F",
  "2702",
  "1F5C3-FE0F",
  "1F5C3",
  "1F5C4-FE0F",
  "1F5C4",
  "1F5D1-FE0F",
  "1F5D1",
  "1F512",
  "1F513",
  "1F50F",
  "1F510",
  "1F511",
  "1F5DD-FE0F",
  "1F5DD",
  "1F528",
  "1FA93",
  "26CF-FE0F",
  "26CF",
  "2692-FE0F",
  "2692",
  "1F6E0-FE0F",
  "1F6E0",
  "1F5E1-FE0F",
  "1F5E1",
  "2694-FE0F",
  "2694",
  "1F4A3",
  "1FA83",
  "1F3F9",
  "1F6E1-FE0F",
  "1F6E1",
  "1FA9A",
  "1F527",
  "1FA9B",
  "1F529",
  "2699-FE0F",
  "2699",
  "1F5DC-FE0F",
  "1F5DC",
  "2696-FE0F",
  "2696",
  "1F9AF",
  "1F517",
  "26D3-FE0F-200D-1F4A5",
  "26D3-200D-1F4A5",
  "26D3-FE0F",
  "26D3",
  "1FA9D",
  "1F9F0",
  "1F9F2",
  "1FA9C",
  "1FA8F",
  "2697-FE0F",
  "2697",
  "1F9EA",
  "1F9EB",
  "1F9EC",
  "1F52C",
  "1F52D",
  "1F4E1",
  "1F489",
  "1FA78",
  "1F48A",
  "1FA79",
  "1FA7C",
  "1FA7A",
  "1FA7B",
  "1F6AA",
  "1F6D7",
  "1FA9E",
  "1FA9F",
  "1F6CF-FE0F",
  "1F6CF",
  "1F6CB-FE0F",
  "1F6CB",
  "1FA91",
  "1F6BD",
  "1FAA0",
  "1F6BF",
  "1F6C1",
  "1FAA4",
  "1FA92",
  "1F9F4",
  "1F9F7",
  "1F9F9",
  "1F9FA",
  "1F9FB",
  "1FAA3",
  "1F9FC",
  "1FAE7",
  "1FAA5",
  "1F9FD",
  "1F9EF",
  "1F6D2",
  "1F6AC",
  "26B0-FE0F",
  "26B0",
  "1FAA6",
  "26B1-FE0F",
  "26B1",
  "1F9FF",
  "1FAAC",
  "1F5FF",
  "1FAA7",
  "1FAAA"
];
const Symbols = [
  "1F3E7",
  "1F6AE",
  "1F6B0",
  "267F",
  "1F6B9",
  "1F6BA",
  "1F6BB",
  "1F6BC",
  "1F6BE",
  "1F6C2",
  "1F6C3",
  "1F6C4",
  "1F6C5",
  "26A0-FE0F",
  "26A0",
  "1F6B8",
  "26D4",
  "1F6AB",
  "1F6B3",
  "1F6AD",
  "1F6AF",
  "1F6B1",
  "1F6B7",
  "1F4F5",
  "1F51E",
  "2622-FE0F",
  "2622",
  "2623-FE0F",
  "2623",
  "2B06-FE0F",
  "2B06",
  "2197-FE0F",
  "2197",
  "27A1-FE0F",
  "27A1",
  "2198-FE0F",
  "2198",
  "2B07-FE0F",
  "2B07",
  "2199-FE0F",
  "2199",
  "2B05-FE0F",
  "2B05",
  "2196-FE0F",
  "2196",
  "2195-FE0F",
  "2195",
  "2194-FE0F",
  "2194",
  "21A9-FE0F",
  "21A9",
  "21AA-FE0F",
  "21AA",
  "2934-FE0F",
  "2934",
  "2935-FE0F",
  "2935",
  "1F503",
  "1F504",
  "1F519",
  "1F51A",
  "1F51B",
  "1F51C",
  "1F51D",
  "1F6D0",
  "269B-FE0F",
  "269B",
  "1F549-FE0F",
  "1F549",
  "2721-FE0F",
  "2721",
  "2638-FE0F",
  "2638",
  "262F-FE0F",
  "262F",
  "271D-FE0F",
  "271D",
  "2626-FE0F",
  "2626",
  "262A-FE0F",
  "262A",
  "262E-FE0F",
  "262E",
  "1F54E",
  "1F52F",
  "1FAAF",
  "2648",
  "2649",
  "264A",
  "264B",
  "264C",
  "264D",
  "264E",
  "264F",
  "2650",
  "2651",
  "2652",
  "2653",
  "26CE",
  "1F500",
  "1F501",
  "1F502",
  "25B6-FE0F",
  "25B6",
  "23E9",
  "23ED-FE0F",
  "23ED",
  "23EF-FE0F",
  "23EF",
  "25C0-FE0F",
  "25C0",
  "23EA",
  "23EE-FE0F",
  "23EE",
  "1F53C",
  "23EB",
  "1F53D",
  "23EC",
  "23F8-FE0F",
  "23F8",
  "23F9-FE0F",
  "23F9",
  "23FA-FE0F",
  "23FA",
  "23CF-FE0F",
  "23CF",
  "1F3A6",
  "1F505",
  "1F506",
  "1F4F6",
  "1F6DC",
  "1F4F3",
  "1F4F4",
  "2640-FE0F",
  "2640",
  "2642-FE0F",
  "2642",
  "26A7-FE0F",
  "26A7",
  "2716-FE0F",
  "2716",
  "2795",
  "2796",
  "2797",
  "1F7F0",
  "267E-FE0F",
  "267E",
  "203C-FE0F",
  "203C",
  "2049-FE0F",
  "2049",
  "2753",
  "2754",
  "2755",
  "2757",
  "3030-FE0F",
  "3030",
  "1F4B1",
  "1F4B2",
  "2695-FE0F",
  "2695",
  "267B-FE0F",
  "267B",
  "269C-FE0F",
  "269C",
  "1F531",
  "1F4DB",
  "1F530",
  "2B55",
  "2705",
  "2611-FE0F",
  "2611",
  "2714-FE0F",
  "2714",
  "274C",
  "274E",
  "27B0",
  "27BF",
  "303D-FE0F",
  "303D",
  "2733-FE0F",
  "2733",
  "2734-FE0F",
  "2734",
  "2747-FE0F",
  "2747",
  "00A9-FE0F",
  "00A9",
  "00AE-FE0F",
  "00AE",
  "2122-FE0F",
  "2122",
  "1FADF",
  "0023-FE0F-20E3",
  "0023-20E3",
  "002A-FE0F-20E3",
  "002A-20E3",
  "0030-FE0F-20E3",
  "0030-20E3",
  "0031-FE0F-20E3",
  "0031-20E3",
  "0032-FE0F-20E3",
  "0032-20E3",
  "0033-FE0F-20E3",
  "0033-20E3",
  "0034-FE0F-20E3",
  "0034-20E3",
  "0035-FE0F-20E3",
  "0035-20E3",
  "0036-FE0F-20E3",
  "0036-20E3",
  "0037-FE0F-20E3",
  "0037-20E3",
  "0038-FE0F-20E3",
  "0038-20E3",
  "0039-FE0F-20E3",
  "0039-20E3",
  "1F51F",
  "1F520",
  "1F521",
  "1F522",
  "1F523",
  "1F524",
  "1F170-FE0F",
  "1F170",
  "1F18E",
  "1F171-FE0F",
  "1F171",
  "1F191",
  "1F192",
  "1F193",
  "2139-FE0F",
  "2139",
  "1F194",
  "24C2-FE0F",
  "24C2",
  "1F195",
  "1F196",
  "1F17E-FE0F",
  "1F17E",
  "1F197",
  "1F17F-FE0F",
  "1F17F",
  "1F198",
  "1F199",
  "1F19A",
  "1F201",
  "1F202-FE0F",
  "1F202",
  "1F237-FE0F",
  "1F237",
  "1F236",
  "1F22F",
  "1F250",
  "1F239",
  "1F21A",
  "1F232",
  "1F251",
  "1F238",
  "1F234",
  "1F233",
  "3297-FE0F",
  "3297",
  "3299-FE0F",
  "3299",
  "1F23A",
  "1F235",
  "1F534",
  "1F7E0",
  "1F7E1",
  "1F7E2",
  "1F535",
  "1F7E3",
  "1F7E4",
  "26AB",
  "26AA",
  "1F7E5",
  "1F7E7",
  "1F7E8",
  "1F7E9",
  "1F7E6",
  "1F7EA",
  "1F7EB",
  "2B1B",
  "2B1C",
  "25FC-FE0F",
  "25FC",
  "25FB-FE0F",
  "25FB",
  "25FE",
  "25FD",
  "25AA-FE0F",
  "25AA",
  "25AB-FE0F",
  "25AB",
  "1F536",
  "1F537",
  "1F538",
  "1F539",
  "1F53A",
  "1F53B",
  "1F4A0",
  "1F518",
  "1F533",
  "1F532"
];
const Flags = [
  "1F3C1",
  "1F6A9",
  "1F38C",
  "1F3F4",
  "1F3F3-FE0F",
  "1F3F3",
  "1F3F3-FE0F-200D-1F308",
  "1F3F3-200D-1F308",
  "1F3F3-FE0F-200D-26A7-FE0F",
  "1F3F3-200D-26A7-FE0F",
  "1F3F3-FE0F-200D-26A7",
  "1F3F3-200D-26A7",
  "1F3F4-200D-2620-FE0F",
  "1F3F4-200D-2620",
  "1F1E6-1F1E8",
  "1F1E6-1F1E9",
  "1F1E6-1F1EA",
  "1F1E6-1F1EB",
  "1F1E6-1F1EC",
  "1F1E6-1F1EE",
  "1F1E6-1F1F1",
  "1F1E6-1F1F2",
  "1F1E6-1F1F4",
  "1F1E6-1F1F6",
  "1F1E6-1F1F7",
  "1F1E6-1F1F8",
  "1F1E6-1F1F9",
  "1F1E6-1F1FA",
  "1F1E6-1F1FC",
  "1F1E6-1F1FD",
  "1F1E6-1F1FF",
  "1F1E7-1F1E6",
  "1F1E7-1F1E7",
  "1F1E7-1F1E9",
  "1F1E7-1F1EA",
  "1F1E7-1F1EB",
  "1F1E7-1F1EC",
  "1F1E7-1F1ED",
  "1F1E7-1F1EE",
  "1F1E7-1F1EF",
  "1F1E7-1F1F1",
  "1F1E7-1F1F2",
  "1F1E7-1F1F3",
  "1F1E7-1F1F4",
  "1F1E7-1F1F6",
  "1F1E7-1F1F7",
  "1F1E7-1F1F8",
  "1F1E7-1F1F9",
  "1F1E7-1F1FB",
  "1F1E7-1F1FC",
  "1F1E7-1F1FE",
  "1F1E7-1F1FF",
  "1F1E8-1F1E6",
  "1F1E8-1F1E8",
  "1F1E8-1F1E9",
  "1F1E8-1F1EB",
  "1F1E8-1F1EC",
  "1F1E8-1F1ED",
  "1F1E8-1F1EE",
  "1F1E8-1F1F0",
  "1F1E8-1F1F1",
  "1F1E8-1F1F2",
  "1F1E8-1F1F3",
  "1F1E8-1F1F4",
  "1F1E8-1F1F5",
  "1F1E8-1F1F6",
  "1F1E8-1F1F7",
  "1F1E8-1F1FA",
  "1F1E8-1F1FB",
  "1F1E8-1F1FC",
  "1F1E8-1F1FD",
  "1F1E8-1F1FE",
  "1F1E8-1F1FF",
  "1F1E9-1F1EA",
  "1F1E9-1F1EC",
  "1F1E9-1F1EF",
  "1F1E9-1F1F0",
  "1F1E9-1F1F2",
  "1F1E9-1F1F4",
  "1F1E9-1F1FF",
  "1F1EA-1F1E6",
  "1F1EA-1F1E8",
  "1F1EA-1F1EA",
  "1F1EA-1F1EC",
  "1F1EA-1F1ED",
  "1F1EA-1F1F7",
  "1F1EA-1F1F8",
  "1F1EA-1F1F9",
  "1F1EA-1F1FA",
  "1F1EB-1F1EE",
  "1F1EB-1F1EF",
  "1F1EB-1F1F0",
  "1F1EB-1F1F2",
  "1F1EB-1F1F4",
  "1F1EB-1F1F7",
  "1F1EC-1F1E6",
  "1F1EC-1F1E7",
  "1F1EC-1F1E9",
  "1F1EC-1F1EA",
  "1F1EC-1F1EB",
  "1F1EC-1F1EC",
  "1F1EC-1F1ED",
  "1F1EC-1F1EE",
  "1F1EC-1F1F1",
  "1F1EC-1F1F2",
  "1F1EC-1F1F3",
  "1F1EC-1F1F5",
  "1F1EC-1F1F6",
  "1F1EC-1F1F7",
  "1F1EC-1F1F8",
  "1F1EC-1F1F9",
  "1F1EC-1F1FA",
  "1F1EC-1F1FC",
  "1F1EC-1F1FE",
  "1F1ED-1F1F0",
  "1F1ED-1F1F2",
  "1F1ED-1F1F3",
  "1F1ED-1F1F7",
  "1F1ED-1F1F9",
  "1F1ED-1F1FA",
  "1F1EE-1F1E8",
  "1F1EE-1F1E9",
  "1F1EE-1F1EA",
  "1F1EE-1F1F1",
  "1F1EE-1F1F2",
  "1F1EE-1F1F3",
  "1F1EE-1F1F4",
  "1F1EE-1F1F6",
  "1F1EE-1F1F7",
  "1F1EE-1F1F8",
  "1F1EE-1F1F9",
  "1F1EF-1F1EA",
  "1F1EF-1F1F2",
  "1F1EF-1F1F4",
  "1F1EF-1F1F5",
  "1F1F0-1F1EA",
  "1F1F0-1F1EC",
  "1F1F0-1F1ED",
  "1F1F0-1F1EE",
  "1F1F0-1F1F2",
  "1F1F0-1F1F3",
  "1F1F0-1F1F5",
  "1F1F0-1F1F7",
  "1F1F0-1F1FC",
  "1F1F0-1F1FE",
  "1F1F0-1F1FF",
  "1F1F1-1F1E6",
  "1F1F1-1F1E7",
  "1F1F1-1F1E8",
  "1F1F1-1F1EE",
  "1F1F1-1F1F0",
  "1F1F1-1F1F7",
  "1F1F1-1F1F8",
  "1F1F1-1F1F9",
  "1F1F1-1F1FA",
  "1F1F1-1F1FB",
  "1F1F1-1F1FE",
  "1F1F2-1F1E6",
  "1F1F2-1F1E8",
  "1F1F2-1F1E9",
  "1F1F2-1F1EA",
  "1F1F2-1F1EB",
  "1F1F2-1F1EC",
  "1F1F2-1F1ED",
  "1F1F2-1F1F0",
  "1F1F2-1F1F1",
  "1F1F2-1F1F2",
  "1F1F2-1F1F3",
  "1F1F2-1F1F4",
  "1F1F2-1F1F5",
  "1F1F2-1F1F6",
  "1F1F2-1F1F7",
  "1F1F2-1F1F8",
  "1F1F2-1F1F9",
  "1F1F2-1F1FA",
  "1F1F2-1F1FB",
  "1F1F2-1F1FC",
  "1F1F2-1F1FD",
  "1F1F2-1F1FE",
  "1F1F2-1F1FF",
  "1F1F3-1F1E6",
  "1F1F3-1F1E8",
  "1F1F3-1F1EA",
  "1F1F3-1F1EB",
  "1F1F3-1F1EC",
  "1F1F3-1F1EE",
  "1F1F3-1F1F1",
  "1F1F3-1F1F4",
  "1F1F3-1F1F5",
  "1F1F3-1F1F7",
  "1F1F3-1F1FA",
  "1F1F3-1F1FF",
  "1F1F4-1F1F2",
  "1F1F5-1F1E6",
  "1F1F5-1F1EA",
  "1F1F5-1F1EB",
  "1F1F5-1F1EC",
  "1F1F5-1F1ED",
  "1F1F5-1F1F0",
  "1F1F5-1F1F1",
  "1F1F5-1F1F2",
  "1F1F5-1F1F3",
  "1F1F5-1F1F7",
  "1F1F5-1F1F8",
  "1F1F5-1F1F9",
  "1F1F5-1F1FC",
  "1F1F5-1F1FE",
  "1F1F6-1F1E6",
  "1F1F7-1F1EA",
  "1F1F7-1F1F4",
  "1F1F7-1F1F8",
  "1F1F7-1F1FA",
  "1F1F7-1F1FC",
  "1F1F8-1F1E6",
  "1F1F8-1F1E7",
  "1F1F8-1F1E8",
  "1F1F8-1F1E9",
  "1F1F8-1F1EA",
  "1F1F8-1F1EC",
  "1F1F8-1F1ED",
  "1F1F8-1F1EE",
  "1F1F8-1F1EF",
  "1F1F8-1F1F0",
  "1F1F8-1F1F1",
  "1F1F8-1F1F2",
  "1F1F8-1F1F3",
  "1F1F8-1F1F4",
  "1F1F8-1F1F7",
  "1F1F8-1F1F8",
  "1F1F8-1F1F9",
  "1F1F8-1F1FB",
  "1F1F8-1F1FD",
  "1F1F8-1F1FE",
  "1F1F8-1F1FF",
  "1F1F9-1F1E6",
  "1F1F9-1F1E8",
  "1F1F9-1F1E9",
  "1F1F9-1F1EB",
  "1F1F9-1F1EC",
  "1F1F9-1F1ED",
  "1F1F9-1F1EF",
  "1F1F9-1F1F0",
  "1F1F9-1F1F1",
  "1F1F9-1F1F2",
  "1F1F9-1F1F3",
  "1F1F9-1F1F4",
  "1F1F9-1F1F7",
  "1F1F9-1F1F9",
  "1F1F9-1F1FB",
  "1F1F9-1F1FC",
  "1F1F9-1F1FF",
  "1F1FA-1F1E6",
  "1F1FA-1F1EC",
  "1F1FA-1F1F2",
  "1F1FA-1F1F3",
  "1F1FA-1F1F8",
  "1F1FA-1F1FE",
  "1F1FA-1F1FF",
  "1F1FB-1F1E6",
  "1F1FB-1F1E8",
  "1F1FB-1F1EA",
  "1F1FB-1F1EC",
  "1F1FB-1F1EE",
  "1F1FB-1F1F3",
  "1F1FB-1F1FA",
  "1F1FC-1F1EB",
  "1F1FC-1F1F8",
  "1F1FD-1F1F0",
  "1F1FE-1F1EA",
  "1F1FE-1F1F9",
  "1F1FF-1F1E6",
  "1F1FF-1F1F2",
  "1F1FF-1F1FC",
  "1F3F4-E0067-E0062-E0065-E006E-E0067-E007F",
  "1F3F4-E0067-E0062-E0073-E0063-E0074-E007F",
  "1F3F4-E0067-E0062-E0077-E006C-E0073-E007F"
];
const emojiGroups = {
  "Smileys & Emotion": [
    "1F600",
    "1F603",
    "1F604",
    "1F601",
    "1F606",
    "1F605",
    "1F923",
    "1F602",
    "1F642",
    "1F643",
    "1FAE0",
    "1F609",
    "1F60A",
    "1F607",
    "1F970",
    "1F60D",
    "1F929",
    "1F618",
    "1F617",
    "263A-FE0F",
    "263A",
    "1F61A",
    "1F619",
    "1F972",
    "1F60B",
    "1F61B",
    "1F61C",
    "1F92A",
    "1F61D",
    "1F911",
    "1F917",
    "1F92D",
    "1FAE2",
    "1FAE3",
    "1F92B",
    "1F914",
    "1FAE1",
    "1F910",
    "1F928",
    "1F610",
    "1F611",
    "1F636",
    "1FAE5",
    "1F636-200D-1F32B-FE0F",
    "1F636-200D-1F32B",
    "1F60F",
    "1F612",
    "1F644",
    "1F62C",
    "1F62E-200D-1F4A8",
    "1F925",
    "1FAE8",
    "1F642-200D-2194-FE0F",
    "1F642-200D-2194",
    "1F642-200D-2195-FE0F",
    "1F642-200D-2195",
    "1F60C",
    "1F614",
    "1F62A",
    "1F924",
    "1F634",
    "1FAE9",
    "1F637",
    "1F912",
    "1F915",
    "1F922",
    "1F92E",
    "1F927",
    "1F975",
    "1F976",
    "1F974",
    "1F635",
    "1F635-200D-1F4AB",
    "1F92F",
    "1F920",
    "1F973",
    "1F978",
    "1F60E",
    "1F913",
    "1F9D0",
    "1F615",
    "1FAE4",
    "1F61F",
    "1F641",
    "2639-FE0F",
    "2639",
    "1F62E",
    "1F62F",
    "1F632",
    "1F633",
    "1F97A",
    "1F979",
    "1F626",
    "1F627",
    "1F628",
    "1F630",
    "1F625",
    "1F622",
    "1F62D",
    "1F631",
    "1F616",
    "1F623",
    "1F61E",
    "1F613",
    "1F629",
    "1F62B",
    "1F971",
    "1F624",
    "1F621",
    "1F620",
    "1F92C",
    "1F608",
    "1F47F",
    "1F480",
    "2620-FE0F",
    "2620",
    "1F4A9",
    "1F921",
    "1F479",
    "1F47A",
    "1F47B",
    "1F47D",
    "1F47E",
    "1F916",
    "1F63A",
    "1F638",
    "1F639",
    "1F63B",
    "1F63C",
    "1F63D",
    "1F640",
    "1F63F",
    "1F63E",
    "1F648",
    "1F649",
    "1F64A",
    "1F48C",
    "1F498",
    "1F49D",
    "1F496",
    "1F497",
    "1F493",
    "1F49E",
    "1F495",
    "1F49F",
    "2763-FE0F",
    "2763",
    "1F494",
    "2764-FE0F-200D-1F525",
    "2764-200D-1F525",
    "2764-FE0F-200D-1FA79",
    "2764-200D-1FA79",
    "2764-FE0F",
    "2764",
    "1FA77",
    "1F9E1",
    "1F49B",
    "1F49A",
    "1F499",
    "1FA75",
    "1F49C",
    "1F90E",
    "1F5A4",
    "1FA76",
    "1F90D",
    "1F48B",
    "1F4AF",
    "1F4A2",
    "1F4A5",
    "1F4AB",
    "1F4A6",
    "1F4A8",
    "1F573-FE0F",
    "1F573",
    "1F4AC",
    "1F441-FE0F-200D-1F5E8-FE0F",
    "1F441-200D-1F5E8-FE0F",
    "1F441-FE0F-200D-1F5E8",
    "1F441-200D-1F5E8",
    "1F5E8-FE0F",
    "1F5E8",
    "1F5EF-FE0F",
    "1F5EF",
    "1F4AD",
    "1F4A4"
  ],
  "People & Body": [
    "1F44B",
    "1F44B-1F3FB",
    "1F44B-1F3FC",
    "1F44B-1F3FD",
    "1F44B-1F3FE",
    "1F44B-1F3FF",
    "1F91A",
    "1F91A-1F3FB",
    "1F91A-1F3FC",
    "1F91A-1F3FD",
    "1F91A-1F3FE",
    "1F91A-1F3FF",
    "1F590-FE0F",
    "1F590",
    "1F590-1F3FB",
    "1F590-1F3FC",
    "1F590-1F3FD",
    "1F590-1F3FE",
    "1F590-1F3FF",
    "270B",
    "270B-1F3FB",
    "270B-1F3FC",
    "270B-1F3FD",
    "270B-1F3FE",
    "270B-1F3FF",
    "1F596",
    "1F596-1F3FB",
    "1F596-1F3FC",
    "1F596-1F3FD",
    "1F596-1F3FE",
    "1F596-1F3FF",
    "1FAF1",
    "1FAF1-1F3FB",
    "1FAF1-1F3FC",
    "1FAF1-1F3FD",
    "1FAF1-1F3FE",
    "1FAF1-1F3FF",
    "1FAF2",
    "1FAF2-1F3FB",
    "1FAF2-1F3FC",
    "1FAF2-1F3FD",
    "1FAF2-1F3FE",
    "1FAF2-1F3FF",
    "1FAF3",
    "1FAF3-1F3FB",
    "1FAF3-1F3FC",
    "1FAF3-1F3FD",
    "1FAF3-1F3FE",
    "1FAF3-1F3FF",
    "1FAF4",
    "1FAF4-1F3FB",
    "1FAF4-1F3FC",
    "1FAF4-1F3FD",
    "1FAF4-1F3FE",
    "1FAF4-1F3FF",
    "1FAF7",
    "1FAF7-1F3FB",
    "1FAF7-1F3FC",
    "1FAF7-1F3FD",
    "1FAF7-1F3FE",
    "1FAF7-1F3FF",
    "1FAF8",
    "1FAF8-1F3FB",
    "1FAF8-1F3FC",
    "1FAF8-1F3FD",
    "1FAF8-1F3FE",
    "1FAF8-1F3FF",
    "1F44C",
    "1F44C-1F3FB",
    "1F44C-1F3FC",
    "1F44C-1F3FD",
    "1F44C-1F3FE",
    "1F44C-1F3FF",
    "1F90C",
    "1F90C-1F3FB",
    "1F90C-1F3FC",
    "1F90C-1F3FD",
    "1F90C-1F3FE",
    "1F90C-1F3FF",
    "1F90F",
    "1F90F-1F3FB",
    "1F90F-1F3FC",
    "1F90F-1F3FD",
    "1F90F-1F3FE",
    "1F90F-1F3FF",
    "270C-FE0F",
    "270C",
    "270C-1F3FB",
    "270C-1F3FC",
    "270C-1F3FD",
    "270C-1F3FE",
    "270C-1F3FF",
    "1F91E",
    "1F91E-1F3FB",
    "1F91E-1F3FC",
    "1F91E-1F3FD",
    "1F91E-1F3FE",
    "1F91E-1F3FF",
    "1FAF0",
    "1FAF0-1F3FB",
    "1FAF0-1F3FC",
    "1FAF0-1F3FD",
    "1FAF0-1F3FE",
    "1FAF0-1F3FF",
    "1F91F",
    "1F91F-1F3FB",
    "1F91F-1F3FC",
    "1F91F-1F3FD",
    "1F91F-1F3FE",
    "1F91F-1F3FF",
    "1F918",
    "1F918-1F3FB",
    "1F918-1F3FC",
    "1F918-1F3FD",
    "1F918-1F3FE",
    "1F918-1F3FF",
    "1F919",
    "1F919-1F3FB",
    "1F919-1F3FC",
    "1F919-1F3FD",
    "1F919-1F3FE",
    "1F919-1F3FF",
    "1F448",
    "1F448-1F3FB",
    "1F448-1F3FC",
    "1F448-1F3FD",
    "1F448-1F3FE",
    "1F448-1F3FF",
    "1F449",
    "1F449-1F3FB",
    "1F449-1F3FC",
    "1F449-1F3FD",
    "1F449-1F3FE",
    "1F449-1F3FF",
    "1F446",
    "1F446-1F3FB",
    "1F446-1F3FC",
    "1F446-1F3FD",
    "1F446-1F3FE",
    "1F446-1F3FF",
    "1F595",
    "1F595-1F3FB",
    "1F595-1F3FC",
    "1F595-1F3FD",
    "1F595-1F3FE",
    "1F595-1F3FF",
    "1F447",
    "1F447-1F3FB",
    "1F447-1F3FC",
    "1F447-1F3FD",
    "1F447-1F3FE",
    "1F447-1F3FF",
    "261D-FE0F",
    "261D",
    "261D-1F3FB",
    "261D-1F3FC",
    "261D-1F3FD",
    "261D-1F3FE",
    "261D-1F3FF",
    "1FAF5",
    "1FAF5-1F3FB",
    "1FAF5-1F3FC",
    "1FAF5-1F3FD",
    "1FAF5-1F3FE",
    "1FAF5-1F3FF",
    "1F44D",
    "1F44D-1F3FB",
    "1F44D-1F3FC",
    "1F44D-1F3FD",
    "1F44D-1F3FE",
    "1F44D-1F3FF",
    "1F44E",
    "1F44E-1F3FB",
    "1F44E-1F3FC",
    "1F44E-1F3FD",
    "1F44E-1F3FE",
    "1F44E-1F3FF",
    "270A",
    "270A-1F3FB",
    "270A-1F3FC",
    "270A-1F3FD",
    "270A-1F3FE",
    "270A-1F3FF",
    "1F44A",
    "1F44A-1F3FB",
    "1F44A-1F3FC",
    "1F44A-1F3FD",
    "1F44A-1F3FE",
    "1F44A-1F3FF",
    "1F91B",
    "1F91B-1F3FB",
    "1F91B-1F3FC",
    "1F91B-1F3FD",
    "1F91B-1F3FE",
    "1F91B-1F3FF",
    "1F91C",
    "1F91C-1F3FB",
    "1F91C-1F3FC",
    "1F91C-1F3FD",
    "1F91C-1F3FE",
    "1F91C-1F3FF",
    "1F44F",
    "1F44F-1F3FB",
    "1F44F-1F3FC",
    "1F44F-1F3FD",
    "1F44F-1F3FE",
    "1F44F-1F3FF",
    "1F64C",
    "1F64C-1F3FB",
    "1F64C-1F3FC",
    "1F64C-1F3FD",
    "1F64C-1F3FE",
    "1F64C-1F3FF",
    "1FAF6",
    "1FAF6-1F3FB",
    "1FAF6-1F3FC",
    "1FAF6-1F3FD",
    "1FAF6-1F3FE",
    "1FAF6-1F3FF",
    "1F450",
    "1F450-1F3FB",
    "1F450-1F3FC",
    "1F450-1F3FD",
    "1F450-1F3FE",
    "1F450-1F3FF",
    "1F932",
    "1F932-1F3FB",
    "1F932-1F3FC",
    "1F932-1F3FD",
    "1F932-1F3FE",
    "1F932-1F3FF",
    "1F91D",
    "1F91D-1F3FB",
    "1F91D-1F3FC",
    "1F91D-1F3FD",
    "1F91D-1F3FE",
    "1F91D-1F3FF",
    "1FAF1-1F3FB-200D-1FAF2-1F3FC",
    "1FAF1-1F3FB-200D-1FAF2-1F3FD",
    "1FAF1-1F3FB-200D-1FAF2-1F3FE",
    "1FAF1-1F3FB-200D-1FAF2-1F3FF",
    "1FAF1-1F3FC-200D-1FAF2-1F3FB",
    "1FAF1-1F3FC-200D-1FAF2-1F3FD",
    "1FAF1-1F3FC-200D-1FAF2-1F3FE",
    "1FAF1-1F3FC-200D-1FAF2-1F3FF",
    "1FAF1-1F3FD-200D-1FAF2-1F3FB",
    "1FAF1-1F3FD-200D-1FAF2-1F3FC",
    "1FAF1-1F3FD-200D-1FAF2-1F3FE",
    "1FAF1-1F3FD-200D-1FAF2-1F3FF",
    "1FAF1-1F3FE-200D-1FAF2-1F3FB",
    "1FAF1-1F3FE-200D-1FAF2-1F3FC",
    "1FAF1-1F3FE-200D-1FAF2-1F3FD",
    "1FAF1-1F3FE-200D-1FAF2-1F3FF",
    "1FAF1-1F3FF-200D-1FAF2-1F3FB",
    "1FAF1-1F3FF-200D-1FAF2-1F3FC",
    "1FAF1-1F3FF-200D-1FAF2-1F3FD",
    "1FAF1-1F3FF-200D-1FAF2-1F3FE",
    "1F64F",
    "1F64F-1F3FB",
    "1F64F-1F3FC",
    "1F64F-1F3FD",
    "1F64F-1F3FE",
    "1F64F-1F3FF",
    "270D-FE0F",
    "270D",
    "270D-1F3FB",
    "270D-1F3FC",
    "270D-1F3FD",
    "270D-1F3FE",
    "270D-1F3FF",
    "1F485",
    "1F485-1F3FB",
    "1F485-1F3FC",
    "1F485-1F3FD",
    "1F485-1F3FE",
    "1F485-1F3FF",
    "1F933",
    "1F933-1F3FB",
    "1F933-1F3FC",
    "1F933-1F3FD",
    "1F933-1F3FE",
    "1F933-1F3FF",
    "1F4AA",
    "1F4AA-1F3FB",
    "1F4AA-1F3FC",
    "1F4AA-1F3FD",
    "1F4AA-1F3FE",
    "1F4AA-1F3FF",
    "1F9BE",
    "1F9BF",
    "1F9B5",
    "1F9B5-1F3FB",
    "1F9B5-1F3FC",
    "1F9B5-1F3FD",
    "1F9B5-1F3FE",
    "1F9B5-1F3FF",
    "1F9B6",
    "1F9B6-1F3FB",
    "1F9B6-1F3FC",
    "1F9B6-1F3FD",
    "1F9B6-1F3FE",
    "1F9B6-1F3FF",
    "1F442",
    "1F442-1F3FB",
    "1F442-1F3FC",
    "1F442-1F3FD",
    "1F442-1F3FE",
    "1F442-1F3FF",
    "1F9BB",
    "1F9BB-1F3FB",
    "1F9BB-1F3FC",
    "1F9BB-1F3FD",
    "1F9BB-1F3FE",
    "1F9BB-1F3FF",
    "1F443",
    "1F443-1F3FB",
    "1F443-1F3FC",
    "1F443-1F3FD",
    "1F443-1F3FE",
    "1F443-1F3FF",
    "1F9E0",
    "1FAC0",
    "1FAC1",
    "1F9B7",
    "1F9B4",
    "1F440",
    "1F441-FE0F",
    "1F441",
    "1F445",
    "1F444",
    "1FAE6",
    "1F476",
    "1F476-1F3FB",
    "1F476-1F3FC",
    "1F476-1F3FD",
    "1F476-1F3FE",
    "1F476-1F3FF",
    "1F9D2",
    "1F9D2-1F3FB",
    "1F9D2-1F3FC",
    "1F9D2-1F3FD",
    "1F9D2-1F3FE",
    "1F9D2-1F3FF",
    "1F466",
    "1F466-1F3FB",
    "1F466-1F3FC",
    "1F466-1F3FD",
    "1F466-1F3FE",
    "1F466-1F3FF",
    "1F467",
    "1F467-1F3FB",
    "1F467-1F3FC",
    "1F467-1F3FD",
    "1F467-1F3FE",
    "1F467-1F3FF",
    "1F9D1",
    "1F9D1-1F3FB",
    "1F9D1-1F3FC",
    "1F9D1-1F3FD",
    "1F9D1-1F3FE",
    "1F9D1-1F3FF",
    "1F471",
    "1F471-1F3FB",
    "1F471-1F3FC",
    "1F471-1F3FD",
    "1F471-1F3FE",
    "1F471-1F3FF",
    "1F468",
    "1F468-1F3FB",
    "1F468-1F3FC",
    "1F468-1F3FD",
    "1F468-1F3FE",
    "1F468-1F3FF",
    "1F9D4",
    "1F9D4-1F3FB",
    "1F9D4-1F3FC",
    "1F9D4-1F3FD",
    "1F9D4-1F3FE",
    "1F9D4-1F3FF",
    "1F9D4-200D-2642-FE0F",
    "1F9D4-200D-2642",
    "1F9D4-1F3FB-200D-2642-FE0F",
    "1F9D4-1F3FB-200D-2642",
    "1F9D4-1F3FC-200D-2642-FE0F",
    "1F9D4-1F3FC-200D-2642",
    "1F9D4-1F3FD-200D-2642-FE0F",
    "1F9D4-1F3FD-200D-2642",
    "1F9D4-1F3FE-200D-2642-FE0F",
    "1F9D4-1F3FE-200D-2642",
    "1F9D4-1F3FF-200D-2642-FE0F",
    "1F9D4-1F3FF-200D-2642",
    "1F9D4-200D-2640-FE0F",
    "1F9D4-200D-2640",
    "1F9D4-1F3FB-200D-2640-FE0F",
    "1F9D4-1F3FB-200D-2640",
    "1F9D4-1F3FC-200D-2640-FE0F",
    "1F9D4-1F3FC-200D-2640",
    "1F9D4-1F3FD-200D-2640-FE0F",
    "1F9D4-1F3FD-200D-2640",
    "1F9D4-1F3FE-200D-2640-FE0F",
    "1F9D4-1F3FE-200D-2640",
    "1F9D4-1F3FF-200D-2640-FE0F",
    "1F9D4-1F3FF-200D-2640",
    "1F468-200D-1F9B0",
    "1F468-1F3FB-200D-1F9B0",
    "1F468-1F3FC-200D-1F9B0",
    "1F468-1F3FD-200D-1F9B0",
    "1F468-1F3FE-200D-1F9B0",
    "1F468-1F3FF-200D-1F9B0",
    "1F468-200D-1F9B1",
    "1F468-1F3FB-200D-1F9B1",
    "1F468-1F3FC-200D-1F9B1",
    "1F468-1F3FD-200D-1F9B1",
    "1F468-1F3FE-200D-1F9B1",
    "1F468-1F3FF-200D-1F9B1",
    "1F468-200D-1F9B3",
    "1F468-1F3FB-200D-1F9B3",
    "1F468-1F3FC-200D-1F9B3",
    "1F468-1F3FD-200D-1F9B3",
    "1F468-1F3FE-200D-1F9B3",
    "1F468-1F3FF-200D-1F9B3",
    "1F468-200D-1F9B2",
    "1F468-1F3FB-200D-1F9B2",
    "1F468-1F3FC-200D-1F9B2",
    "1F468-1F3FD-200D-1F9B2",
    "1F468-1F3FE-200D-1F9B2",
    "1F468-1F3FF-200D-1F9B2",
    "1F469",
    "1F469-1F3FB",
    "1F469-1F3FC",
    "1F469-1F3FD",
    "1F469-1F3FE",
    "1F469-1F3FF",
    "1F469-200D-1F9B0",
    "1F469-1F3FB-200D-1F9B0",
    "1F469-1F3FC-200D-1F9B0",
    "1F469-1F3FD-200D-1F9B0",
    "1F469-1F3FE-200D-1F9B0",
    "1F469-1F3FF-200D-1F9B0",
    "1F9D1-200D-1F9B0",
    "1F9D1-1F3FB-200D-1F9B0",
    "1F9D1-1F3FC-200D-1F9B0",
    "1F9D1-1F3FD-200D-1F9B0",
    "1F9D1-1F3FE-200D-1F9B0",
    "1F9D1-1F3FF-200D-1F9B0",
    "1F469-200D-1F9B1",
    "1F469-1F3FB-200D-1F9B1",
    "1F469-1F3FC-200D-1F9B1",
    "1F469-1F3FD-200D-1F9B1",
    "1F469-1F3FE-200D-1F9B1",
    "1F469-1F3FF-200D-1F9B1",
    "1F9D1-200D-1F9B1",
    "1F9D1-1F3FB-200D-1F9B1",
    "1F9D1-1F3FC-200D-1F9B1",
    "1F9D1-1F3FD-200D-1F9B1",
    "1F9D1-1F3FE-200D-1F9B1",
    "1F9D1-1F3FF-200D-1F9B1",
    "1F469-200D-1F9B3",
    "1F469-1F3FB-200D-1F9B3",
    "1F469-1F3FC-200D-1F9B3",
    "1F469-1F3FD-200D-1F9B3",
    "1F469-1F3FE-200D-1F9B3",
    "1F469-1F3FF-200D-1F9B3",
    "1F9D1-200D-1F9B3",
    "1F9D1-1F3FB-200D-1F9B3",
    "1F9D1-1F3FC-200D-1F9B3",
    "1F9D1-1F3FD-200D-1F9B3",
    "1F9D1-1F3FE-200D-1F9B3",
    "1F9D1-1F3FF-200D-1F9B3",
    "1F469-200D-1F9B2",
    "1F469-1F3FB-200D-1F9B2",
    "1F469-1F3FC-200D-1F9B2",
    "1F469-1F3FD-200D-1F9B2",
    "1F469-1F3FE-200D-1F9B2",
    "1F469-1F3FF-200D-1F9B2",
    "1F9D1-200D-1F9B2",
    "1F9D1-1F3FB-200D-1F9B2",
    "1F9D1-1F3FC-200D-1F9B2",
    "1F9D1-1F3FD-200D-1F9B2",
    "1F9D1-1F3FE-200D-1F9B2",
    "1F9D1-1F3FF-200D-1F9B2",
    "1F471-200D-2640-FE0F",
    "1F471-200D-2640",
    "1F471-1F3FB-200D-2640-FE0F",
    "1F471-1F3FB-200D-2640",
    "1F471-1F3FC-200D-2640-FE0F",
    "1F471-1F3FC-200D-2640",
    "1F471-1F3FD-200D-2640-FE0F",
    "1F471-1F3FD-200D-2640",
    "1F471-1F3FE-200D-2640-FE0F",
    "1F471-1F3FE-200D-2640",
    "1F471-1F3FF-200D-2640-FE0F",
    "1F471-1F3FF-200D-2640",
    "1F471-200D-2642-FE0F",
    "1F471-200D-2642",
    "1F471-1F3FB-200D-2642-FE0F",
    "1F471-1F3FB-200D-2642",
    "1F471-1F3FC-200D-2642-FE0F",
    "1F471-1F3FC-200D-2642",
    "1F471-1F3FD-200D-2642-FE0F",
    "1F471-1F3FD-200D-2642",
    "1F471-1F3FE-200D-2642-FE0F",
    "1F471-1F3FE-200D-2642",
    "1F471-1F3FF-200D-2642-FE0F",
    "1F471-1F3FF-200D-2642",
    "1F9D3",
    "1F9D3-1F3FB",
    "1F9D3-1F3FC",
    "1F9D3-1F3FD",
    "1F9D3-1F3FE",
    "1F9D3-1F3FF",
    "1F474",
    "1F474-1F3FB",
    "1F474-1F3FC",
    "1F474-1F3FD",
    "1F474-1F3FE",
    "1F474-1F3FF",
    "1F475",
    "1F475-1F3FB",
    "1F475-1F3FC",
    "1F475-1F3FD",
    "1F475-1F3FE",
    "1F475-1F3FF",
    "1F64D",
    "1F64D-1F3FB",
    "1F64D-1F3FC",
    "1F64D-1F3FD",
    "1F64D-1F3FE",
    "1F64D-1F3FF",
    "1F64D-200D-2642-FE0F",
    "1F64D-200D-2642",
    "1F64D-1F3FB-200D-2642-FE0F",
    "1F64D-1F3FB-200D-2642",
    "1F64D-1F3FC-200D-2642-FE0F",
    "1F64D-1F3FC-200D-2642",
    "1F64D-1F3FD-200D-2642-FE0F",
    "1F64D-1F3FD-200D-2642",
    "1F64D-1F3FE-200D-2642-FE0F",
    "1F64D-1F3FE-200D-2642",
    "1F64D-1F3FF-200D-2642-FE0F",
    "1F64D-1F3FF-200D-2642",
    "1F64D-200D-2640-FE0F",
    "1F64D-200D-2640",
    "1F64D-1F3FB-200D-2640-FE0F",
    "1F64D-1F3FB-200D-2640",
    "1F64D-1F3FC-200D-2640-FE0F",
    "1F64D-1F3FC-200D-2640",
    "1F64D-1F3FD-200D-2640-FE0F",
    "1F64D-1F3FD-200D-2640",
    "1F64D-1F3FE-200D-2640-FE0F",
    "1F64D-1F3FE-200D-2640",
    "1F64D-1F3FF-200D-2640-FE0F",
    "1F64D-1F3FF-200D-2640",
    "1F64E",
    "1F64E-1F3FB",
    "1F64E-1F3FC",
    "1F64E-1F3FD",
    "1F64E-1F3FE",
    "1F64E-1F3FF",
    "1F64E-200D-2642-FE0F",
    "1F64E-200D-2642",
    "1F64E-1F3FB-200D-2642-FE0F",
    "1F64E-1F3FB-200D-2642",
    "1F64E-1F3FC-200D-2642-FE0F",
    "1F64E-1F3FC-200D-2642",
    "1F64E-1F3FD-200D-2642-FE0F",
    "1F64E-1F3FD-200D-2642",
    "1F64E-1F3FE-200D-2642-FE0F",
    "1F64E-1F3FE-200D-2642",
    "1F64E-1F3FF-200D-2642-FE0F",
    "1F64E-1F3FF-200D-2642",
    "1F64E-200D-2640-FE0F",
    "1F64E-200D-2640",
    "1F64E-1F3FB-200D-2640-FE0F",
    "1F64E-1F3FB-200D-2640",
    "1F64E-1F3FC-200D-2640-FE0F",
    "1F64E-1F3FC-200D-2640",
    "1F64E-1F3FD-200D-2640-FE0F",
    "1F64E-1F3FD-200D-2640",
    "1F64E-1F3FE-200D-2640-FE0F",
    "1F64E-1F3FE-200D-2640",
    "1F64E-1F3FF-200D-2640-FE0F",
    "1F64E-1F3FF-200D-2640",
    "1F645",
    "1F645-1F3FB",
    "1F645-1F3FC",
    "1F645-1F3FD",
    "1F645-1F3FE",
    "1F645-1F3FF",
    "1F645-200D-2642-FE0F",
    "1F645-200D-2642",
    "1F645-1F3FB-200D-2642-FE0F",
    "1F645-1F3FB-200D-2642",
    "1F645-1F3FC-200D-2642-FE0F",
    "1F645-1F3FC-200D-2642",
    "1F645-1F3FD-200D-2642-FE0F",
    "1F645-1F3FD-200D-2642",
    "1F645-1F3FE-200D-2642-FE0F",
    "1F645-1F3FE-200D-2642",
    "1F645-1F3FF-200D-2642-FE0F",
    "1F645-1F3FF-200D-2642",
    "1F645-200D-2640-FE0F",
    "1F645-200D-2640",
    "1F645-1F3FB-200D-2640-FE0F",
    "1F645-1F3FB-200D-2640",
    "1F645-1F3FC-200D-2640-FE0F",
    "1F645-1F3FC-200D-2640",
    "1F645-1F3FD-200D-2640-FE0F",
    "1F645-1F3FD-200D-2640",
    "1F645-1F3FE-200D-2640-FE0F",
    "1F645-1F3FE-200D-2640",
    "1F645-1F3FF-200D-2640-FE0F",
    "1F645-1F3FF-200D-2640",
    "1F646",
    "1F646-1F3FB",
    "1F646-1F3FC",
    "1F646-1F3FD",
    "1F646-1F3FE",
    "1F646-1F3FF",
    "1F646-200D-2642-FE0F",
    "1F646-200D-2642",
    "1F646-1F3FB-200D-2642-FE0F",
    "1F646-1F3FB-200D-2642",
    "1F646-1F3FC-200D-2642-FE0F",
    "1F646-1F3FC-200D-2642",
    "1F646-1F3FD-200D-2642-FE0F",
    "1F646-1F3FD-200D-2642",
    "1F646-1F3FE-200D-2642-FE0F",
    "1F646-1F3FE-200D-2642",
    "1F646-1F3FF-200D-2642-FE0F",
    "1F646-1F3FF-200D-2642",
    "1F646-200D-2640-FE0F",
    "1F646-200D-2640",
    "1F646-1F3FB-200D-2640-FE0F",
    "1F646-1F3FB-200D-2640",
    "1F646-1F3FC-200D-2640-FE0F",
    "1F646-1F3FC-200D-2640",
    "1F646-1F3FD-200D-2640-FE0F",
    "1F646-1F3FD-200D-2640",
    "1F646-1F3FE-200D-2640-FE0F",
    "1F646-1F3FE-200D-2640",
    "1F646-1F3FF-200D-2640-FE0F",
    "1F646-1F3FF-200D-2640",
    "1F481",
    "1F481-1F3FB",
    "1F481-1F3FC",
    "1F481-1F3FD",
    "1F481-1F3FE",
    "1F481-1F3FF",
    "1F481-200D-2642-FE0F",
    "1F481-200D-2642",
    "1F481-1F3FB-200D-2642-FE0F",
    "1F481-1F3FB-200D-2642",
    "1F481-1F3FC-200D-2642-FE0F",
    "1F481-1F3FC-200D-2642",
    "1F481-1F3FD-200D-2642-FE0F",
    "1F481-1F3FD-200D-2642",
    "1F481-1F3FE-200D-2642-FE0F",
    "1F481-1F3FE-200D-2642",
    "1F481-1F3FF-200D-2642-FE0F",
    "1F481-1F3FF-200D-2642",
    "1F481-200D-2640-FE0F",
    "1F481-200D-2640",
    "1F481-1F3FB-200D-2640-FE0F",
    "1F481-1F3FB-200D-2640",
    "1F481-1F3FC-200D-2640-FE0F",
    "1F481-1F3FC-200D-2640",
    "1F481-1F3FD-200D-2640-FE0F",
    "1F481-1F3FD-200D-2640",
    "1F481-1F3FE-200D-2640-FE0F",
    "1F481-1F3FE-200D-2640",
    "1F481-1F3FF-200D-2640-FE0F",
    "1F481-1F3FF-200D-2640",
    "1F64B",
    "1F64B-1F3FB",
    "1F64B-1F3FC",
    "1F64B-1F3FD",
    "1F64B-1F3FE",
    "1F64B-1F3FF",
    "1F64B-200D-2642-FE0F",
    "1F64B-200D-2642",
    "1F64B-1F3FB-200D-2642-FE0F",
    "1F64B-1F3FB-200D-2642",
    "1F64B-1F3FC-200D-2642-FE0F",
    "1F64B-1F3FC-200D-2642",
    "1F64B-1F3FD-200D-2642-FE0F",
    "1F64B-1F3FD-200D-2642",
    "1F64B-1F3FE-200D-2642-FE0F",
    "1F64B-1F3FE-200D-2642",
    "1F64B-1F3FF-200D-2642-FE0F",
    "1F64B-1F3FF-200D-2642",
    "1F64B-200D-2640-FE0F",
    "1F64B-200D-2640",
    "1F64B-1F3FB-200D-2640-FE0F",
    "1F64B-1F3FB-200D-2640",
    "1F64B-1F3FC-200D-2640-FE0F",
    "1F64B-1F3FC-200D-2640",
    "1F64B-1F3FD-200D-2640-FE0F",
    "1F64B-1F3FD-200D-2640",
    "1F64B-1F3FE-200D-2640-FE0F",
    "1F64B-1F3FE-200D-2640",
    "1F64B-1F3FF-200D-2640-FE0F",
    "1F64B-1F3FF-200D-2640",
    "1F9CF",
    "1F9CF-1F3FB",
    "1F9CF-1F3FC",
    "1F9CF-1F3FD",
    "1F9CF-1F3FE",
    "1F9CF-1F3FF",
    "1F9CF-200D-2642-FE0F",
    "1F9CF-200D-2642",
    "1F9CF-1F3FB-200D-2642-FE0F",
    "1F9CF-1F3FB-200D-2642",
    "1F9CF-1F3FC-200D-2642-FE0F",
    "1F9CF-1F3FC-200D-2642",
    "1F9CF-1F3FD-200D-2642-FE0F",
    "1F9CF-1F3FD-200D-2642",
    "1F9CF-1F3FE-200D-2642-FE0F",
    "1F9CF-1F3FE-200D-2642",
    "1F9CF-1F3FF-200D-2642-FE0F",
    "1F9CF-1F3FF-200D-2642",
    "1F9CF-200D-2640-FE0F",
    "1F9CF-200D-2640",
    "1F9CF-1F3FB-200D-2640-FE0F",
    "1F9CF-1F3FB-200D-2640",
    "1F9CF-1F3FC-200D-2640-FE0F",
    "1F9CF-1F3FC-200D-2640",
    "1F9CF-1F3FD-200D-2640-FE0F",
    "1F9CF-1F3FD-200D-2640",
    "1F9CF-1F3FE-200D-2640-FE0F",
    "1F9CF-1F3FE-200D-2640",
    "1F9CF-1F3FF-200D-2640-FE0F",
    "1F9CF-1F3FF-200D-2640",
    "1F647",
    "1F647-1F3FB",
    "1F647-1F3FC",
    "1F647-1F3FD",
    "1F647-1F3FE",
    "1F647-1F3FF",
    "1F647-200D-2642-FE0F",
    "1F647-200D-2642",
    "1F647-1F3FB-200D-2642-FE0F",
    "1F647-1F3FB-200D-2642",
    "1F647-1F3FC-200D-2642-FE0F",
    "1F647-1F3FC-200D-2642",
    "1F647-1F3FD-200D-2642-FE0F",
    "1F647-1F3FD-200D-2642",
    "1F647-1F3FE-200D-2642-FE0F",
    "1F647-1F3FE-200D-2642",
    "1F647-1F3FF-200D-2642-FE0F",
    "1F647-1F3FF-200D-2642",
    "1F647-200D-2640-FE0F",
    "1F647-200D-2640",
    "1F647-1F3FB-200D-2640-FE0F",
    "1F647-1F3FB-200D-2640",
    "1F647-1F3FC-200D-2640-FE0F",
    "1F647-1F3FC-200D-2640",
    "1F647-1F3FD-200D-2640-FE0F",
    "1F647-1F3FD-200D-2640",
    "1F647-1F3FE-200D-2640-FE0F",
    "1F647-1F3FE-200D-2640",
    "1F647-1F3FF-200D-2640-FE0F",
    "1F647-1F3FF-200D-2640",
    "1F926",
    "1F926-1F3FB",
    "1F926-1F3FC",
    "1F926-1F3FD",
    "1F926-1F3FE",
    "1F926-1F3FF",
    "1F926-200D-2642-FE0F",
    "1F926-200D-2642",
    "1F926-1F3FB-200D-2642-FE0F",
    "1F926-1F3FB-200D-2642",
    "1F926-1F3FC-200D-2642-FE0F",
    "1F926-1F3FC-200D-2642",
    "1F926-1F3FD-200D-2642-FE0F",
    "1F926-1F3FD-200D-2642",
    "1F926-1F3FE-200D-2642-FE0F",
    "1F926-1F3FE-200D-2642",
    "1F926-1F3FF-200D-2642-FE0F",
    "1F926-1F3FF-200D-2642",
    "1F926-200D-2640-FE0F",
    "1F926-200D-2640",
    "1F926-1F3FB-200D-2640-FE0F",
    "1F926-1F3FB-200D-2640",
    "1F926-1F3FC-200D-2640-FE0F",
    "1F926-1F3FC-200D-2640",
    "1F926-1F3FD-200D-2640-FE0F",
    "1F926-1F3FD-200D-2640",
    "1F926-1F3FE-200D-2640-FE0F",
    "1F926-1F3FE-200D-2640",
    "1F926-1F3FF-200D-2640-FE0F",
    "1F926-1F3FF-200D-2640",
    "1F937",
    "1F937-1F3FB",
    "1F937-1F3FC",
    "1F937-1F3FD",
    "1F937-1F3FE",
    "1F937-1F3FF",
    "1F937-200D-2642-FE0F",
    "1F937-200D-2642",
    "1F937-1F3FB-200D-2642-FE0F",
    "1F937-1F3FB-200D-2642",
    "1F937-1F3FC-200D-2642-FE0F",
    "1F937-1F3FC-200D-2642",
    "1F937-1F3FD-200D-2642-FE0F",
    "1F937-1F3FD-200D-2642",
    "1F937-1F3FE-200D-2642-FE0F",
    "1F937-1F3FE-200D-2642",
    "1F937-1F3FF-200D-2642-FE0F",
    "1F937-1F3FF-200D-2642",
    "1F937-200D-2640-FE0F",
    "1F937-200D-2640",
    "1F937-1F3FB-200D-2640-FE0F",
    "1F937-1F3FB-200D-2640",
    "1F937-1F3FC-200D-2640-FE0F",
    "1F937-1F3FC-200D-2640",
    "1F937-1F3FD-200D-2640-FE0F",
    "1F937-1F3FD-200D-2640",
    "1F937-1F3FE-200D-2640-FE0F",
    "1F937-1F3FE-200D-2640",
    "1F937-1F3FF-200D-2640-FE0F",
    "1F937-1F3FF-200D-2640",
    "1F9D1-200D-2695-FE0F",
    "1F9D1-200D-2695",
    "1F9D1-1F3FB-200D-2695-FE0F",
    "1F9D1-1F3FB-200D-2695",
    "1F9D1-1F3FC-200D-2695-FE0F",
    "1F9D1-1F3FC-200D-2695",
    "1F9D1-1F3FD-200D-2695-FE0F",
    "1F9D1-1F3FD-200D-2695",
    "1F9D1-1F3FE-200D-2695-FE0F",
    "1F9D1-1F3FE-200D-2695",
    "1F9D1-1F3FF-200D-2695-FE0F",
    "1F9D1-1F3FF-200D-2695",
    "1F468-200D-2695-FE0F",
    "1F468-200D-2695",
    "1F468-1F3FB-200D-2695-FE0F",
    "1F468-1F3FB-200D-2695",
    "1F468-1F3FC-200D-2695-FE0F",
    "1F468-1F3FC-200D-2695",
    "1F468-1F3FD-200D-2695-FE0F",
    "1F468-1F3FD-200D-2695",
    "1F468-1F3FE-200D-2695-FE0F",
    "1F468-1F3FE-200D-2695",
    "1F468-1F3FF-200D-2695-FE0F",
    "1F468-1F3FF-200D-2695",
    "1F469-200D-2695-FE0F",
    "1F469-200D-2695",
    "1F469-1F3FB-200D-2695-FE0F",
    "1F469-1F3FB-200D-2695",
    "1F469-1F3FC-200D-2695-FE0F",
    "1F469-1F3FC-200D-2695",
    "1F469-1F3FD-200D-2695-FE0F",
    "1F469-1F3FD-200D-2695",
    "1F469-1F3FE-200D-2695-FE0F",
    "1F469-1F3FE-200D-2695",
    "1F469-1F3FF-200D-2695-FE0F",
    "1F469-1F3FF-200D-2695",
    "1F9D1-200D-1F393",
    "1F9D1-1F3FB-200D-1F393",
    "1F9D1-1F3FC-200D-1F393",
    "1F9D1-1F3FD-200D-1F393",
    "1F9D1-1F3FE-200D-1F393",
    "1F9D1-1F3FF-200D-1F393",
    "1F468-200D-1F393",
    "1F468-1F3FB-200D-1F393",
    "1F468-1F3FC-200D-1F393",
    "1F468-1F3FD-200D-1F393",
    "1F468-1F3FE-200D-1F393",
    "1F468-1F3FF-200D-1F393",
    "1F469-200D-1F393",
    "1F469-1F3FB-200D-1F393",
    "1F469-1F3FC-200D-1F393",
    "1F469-1F3FD-200D-1F393",
    "1F469-1F3FE-200D-1F393",
    "1F469-1F3FF-200D-1F393",
    "1F9D1-200D-1F3EB",
    "1F9D1-1F3FB-200D-1F3EB",
    "1F9D1-1F3FC-200D-1F3EB",
    "1F9D1-1F3FD-200D-1F3EB",
    "1F9D1-1F3FE-200D-1F3EB",
    "1F9D1-1F3FF-200D-1F3EB",
    "1F468-200D-1F3EB",
    "1F468-1F3FB-200D-1F3EB",
    "1F468-1F3FC-200D-1F3EB",
    "1F468-1F3FD-200D-1F3EB",
    "1F468-1F3FE-200D-1F3EB",
    "1F468-1F3FF-200D-1F3EB",
    "1F469-200D-1F3EB",
    "1F469-1F3FB-200D-1F3EB",
    "1F469-1F3FC-200D-1F3EB",
    "1F469-1F3FD-200D-1F3EB",
    "1F469-1F3FE-200D-1F3EB",
    "1F469-1F3FF-200D-1F3EB",
    "1F9D1-200D-2696-FE0F",
    "1F9D1-200D-2696",
    "1F9D1-1F3FB-200D-2696-FE0F",
    "1F9D1-1F3FB-200D-2696",
    "1F9D1-1F3FC-200D-2696-FE0F",
    "1F9D1-1F3FC-200D-2696",
    "1F9D1-1F3FD-200D-2696-FE0F",
    "1F9D1-1F3FD-200D-2696",
    "1F9D1-1F3FE-200D-2696-FE0F",
    "1F9D1-1F3FE-200D-2696",
    "1F9D1-1F3FF-200D-2696-FE0F",
    "1F9D1-1F3FF-200D-2696",
    "1F468-200D-2696-FE0F",
    "1F468-200D-2696",
    "1F468-1F3FB-200D-2696-FE0F",
    "1F468-1F3FB-200D-2696",
    "1F468-1F3FC-200D-2696-FE0F",
    "1F468-1F3FC-200D-2696",
    "1F468-1F3FD-200D-2696-FE0F",
    "1F468-1F3FD-200D-2696",
    "1F468-1F3FE-200D-2696-FE0F",
    "1F468-1F3FE-200D-2696",
    "1F468-1F3FF-200D-2696-FE0F",
    "1F468-1F3FF-200D-2696",
    "1F469-200D-2696-FE0F",
    "1F469-200D-2696",
    "1F469-1F3FB-200D-2696-FE0F",
    "1F469-1F3FB-200D-2696",
    "1F469-1F3FC-200D-2696-FE0F",
    "1F469-1F3FC-200D-2696",
    "1F469-1F3FD-200D-2696-FE0F",
    "1F469-1F3FD-200D-2696",
    "1F469-1F3FE-200D-2696-FE0F",
    "1F469-1F3FE-200D-2696",
    "1F469-1F3FF-200D-2696-FE0F",
    "1F469-1F3FF-200D-2696",
    "1F9D1-200D-1F33E",
    "1F9D1-1F3FB-200D-1F33E",
    "1F9D1-1F3FC-200D-1F33E",
    "1F9D1-1F3FD-200D-1F33E",
    "1F9D1-1F3FE-200D-1F33E",
    "1F9D1-1F3FF-200D-1F33E",
    "1F468-200D-1F33E",
    "1F468-1F3FB-200D-1F33E",
    "1F468-1F3FC-200D-1F33E",
    "1F468-1F3FD-200D-1F33E",
    "1F468-1F3FE-200D-1F33E",
    "1F468-1F3FF-200D-1F33E",
    "1F469-200D-1F33E",
    "1F469-1F3FB-200D-1F33E",
    "1F469-1F3FC-200D-1F33E",
    "1F469-1F3FD-200D-1F33E",
    "1F469-1F3FE-200D-1F33E",
    "1F469-1F3FF-200D-1F33E",
    "1F9D1-200D-1F373",
    "1F9D1-1F3FB-200D-1F373",
    "1F9D1-1F3FC-200D-1F373",
    "1F9D1-1F3FD-200D-1F373",
    "1F9D1-1F3FE-200D-1F373",
    "1F9D1-1F3FF-200D-1F373",
    "1F468-200D-1F373",
    "1F468-1F3FB-200D-1F373",
    "1F468-1F3FC-200D-1F373",
    "1F468-1F3FD-200D-1F373",
    "1F468-1F3FE-200D-1F373",
    "1F468-1F3FF-200D-1F373",
    "1F469-200D-1F373",
    "1F469-1F3FB-200D-1F373",
    "1F469-1F3FC-200D-1F373",
    "1F469-1F3FD-200D-1F373",
    "1F469-1F3FE-200D-1F373",
    "1F469-1F3FF-200D-1F373",
    "1F9D1-200D-1F527",
    "1F9D1-1F3FB-200D-1F527",
    "1F9D1-1F3FC-200D-1F527",
    "1F9D1-1F3FD-200D-1F527",
    "1F9D1-1F3FE-200D-1F527",
    "1F9D1-1F3FF-200D-1F527",
    "1F468-200D-1F527",
    "1F468-1F3FB-200D-1F527",
    "1F468-1F3FC-200D-1F527",
    "1F468-1F3FD-200D-1F527",
    "1F468-1F3FE-200D-1F527",
    "1F468-1F3FF-200D-1F527",
    "1F469-200D-1F527",
    "1F469-1F3FB-200D-1F527",
    "1F469-1F3FC-200D-1F527",
    "1F469-1F3FD-200D-1F527",
    "1F469-1F3FE-200D-1F527",
    "1F469-1F3FF-200D-1F527",
    "1F9D1-200D-1F3ED",
    "1F9D1-1F3FB-200D-1F3ED",
    "1F9D1-1F3FC-200D-1F3ED",
    "1F9D1-1F3FD-200D-1F3ED",
    "1F9D1-1F3FE-200D-1F3ED",
    "1F9D1-1F3FF-200D-1F3ED",
    "1F468-200D-1F3ED",
    "1F468-1F3FB-200D-1F3ED",
    "1F468-1F3FC-200D-1F3ED",
    "1F468-1F3FD-200D-1F3ED",
    "1F468-1F3FE-200D-1F3ED",
    "1F468-1F3FF-200D-1F3ED",
    "1F469-200D-1F3ED",
    "1F469-1F3FB-200D-1F3ED",
    "1F469-1F3FC-200D-1F3ED",
    "1F469-1F3FD-200D-1F3ED",
    "1F469-1F3FE-200D-1F3ED",
    "1F469-1F3FF-200D-1F3ED",
    "1F9D1-200D-1F4BC",
    "1F9D1-1F3FB-200D-1F4BC",
    "1F9D1-1F3FC-200D-1F4BC",
    "1F9D1-1F3FD-200D-1F4BC",
    "1F9D1-1F3FE-200D-1F4BC",
    "1F9D1-1F3FF-200D-1F4BC",
    "1F468-200D-1F4BC",
    "1F468-1F3FB-200D-1F4BC",
    "1F468-1F3FC-200D-1F4BC",
    "1F468-1F3FD-200D-1F4BC",
    "1F468-1F3FE-200D-1F4BC",
    "1F468-1F3FF-200D-1F4BC",
    "1F469-200D-1F4BC",
    "1F469-1F3FB-200D-1F4BC",
    "1F469-1F3FC-200D-1F4BC",
    "1F469-1F3FD-200D-1F4BC",
    "1F469-1F3FE-200D-1F4BC",
    "1F469-1F3FF-200D-1F4BC",
    "1F9D1-200D-1F52C",
    "1F9D1-1F3FB-200D-1F52C",
    "1F9D1-1F3FC-200D-1F52C",
    "1F9D1-1F3FD-200D-1F52C",
    "1F9D1-1F3FE-200D-1F52C",
    "1F9D1-1F3FF-200D-1F52C",
    "1F468-200D-1F52C",
    "1F468-1F3FB-200D-1F52C",
    "1F468-1F3FC-200D-1F52C",
    "1F468-1F3FD-200D-1F52C",
    "1F468-1F3FE-200D-1F52C",
    "1F468-1F3FF-200D-1F52C",
    "1F469-200D-1F52C",
    "1F469-1F3FB-200D-1F52C",
    "1F469-1F3FC-200D-1F52C",
    "1F469-1F3FD-200D-1F52C",
    "1F469-1F3FE-200D-1F52C",
    "1F469-1F3FF-200D-1F52C",
    "1F9D1-200D-1F4BB",
    "1F9D1-1F3FB-200D-1F4BB",
    "1F9D1-1F3FC-200D-1F4BB",
    "1F9D1-1F3FD-200D-1F4BB",
    "1F9D1-1F3FE-200D-1F4BB",
    "1F9D1-1F3FF-200D-1F4BB",
    "1F468-200D-1F4BB",
    "1F468-1F3FB-200D-1F4BB",
    "1F468-1F3FC-200D-1F4BB",
    "1F468-1F3FD-200D-1F4BB",
    "1F468-1F3FE-200D-1F4BB",
    "1F468-1F3FF-200D-1F4BB",
    "1F469-200D-1F4BB",
    "1F469-1F3FB-200D-1F4BB",
    "1F469-1F3FC-200D-1F4BB",
    "1F469-1F3FD-200D-1F4BB",
    "1F469-1F3FE-200D-1F4BB",
    "1F469-1F3FF-200D-1F4BB",
    "1F9D1-200D-1F3A4",
    "1F9D1-1F3FB-200D-1F3A4",
    "1F9D1-1F3FC-200D-1F3A4",
    "1F9D1-1F3FD-200D-1F3A4",
    "1F9D1-1F3FE-200D-1F3A4",
    "1F9D1-1F3FF-200D-1F3A4",
    "1F468-200D-1F3A4",
    "1F468-1F3FB-200D-1F3A4",
    "1F468-1F3FC-200D-1F3A4",
    "1F468-1F3FD-200D-1F3A4",
    "1F468-1F3FE-200D-1F3A4",
    "1F468-1F3FF-200D-1F3A4",
    "1F469-200D-1F3A4",
    "1F469-1F3FB-200D-1F3A4",
    "1F469-1F3FC-200D-1F3A4",
    "1F469-1F3FD-200D-1F3A4",
    "1F469-1F3FE-200D-1F3A4",
    "1F469-1F3FF-200D-1F3A4",
    "1F9D1-200D-1F3A8",
    "1F9D1-1F3FB-200D-1F3A8",
    "1F9D1-1F3FC-200D-1F3A8",
    "1F9D1-1F3FD-200D-1F3A8",
    "1F9D1-1F3FE-200D-1F3A8",
    "1F9D1-1F3FF-200D-1F3A8",
    "1F468-200D-1F3A8",
    "1F468-1F3FB-200D-1F3A8",
    "1F468-1F3FC-200D-1F3A8",
    "1F468-1F3FD-200D-1F3A8",
    "1F468-1F3FE-200D-1F3A8",
    "1F468-1F3FF-200D-1F3A8",
    "1F469-200D-1F3A8",
    "1F469-1F3FB-200D-1F3A8",
    "1F469-1F3FC-200D-1F3A8",
    "1F469-1F3FD-200D-1F3A8",
    "1F469-1F3FE-200D-1F3A8",
    "1F469-1F3FF-200D-1F3A8",
    "1F9D1-200D-2708-FE0F",
    "1F9D1-200D-2708",
    "1F9D1-1F3FB-200D-2708-FE0F",
    "1F9D1-1F3FB-200D-2708",
    "1F9D1-1F3FC-200D-2708-FE0F",
    "1F9D1-1F3FC-200D-2708",
    "1F9D1-1F3FD-200D-2708-FE0F",
    "1F9D1-1F3FD-200D-2708",
    "1F9D1-1F3FE-200D-2708-FE0F",
    "1F9D1-1F3FE-200D-2708",
    "1F9D1-1F3FF-200D-2708-FE0F",
    "1F9D1-1F3FF-200D-2708",
    "1F468-200D-2708-FE0F",
    "1F468-200D-2708",
    "1F468-1F3FB-200D-2708-FE0F",
    "1F468-1F3FB-200D-2708",
    "1F468-1F3FC-200D-2708-FE0F",
    "1F468-1F3FC-200D-2708",
    "1F468-1F3FD-200D-2708-FE0F",
    "1F468-1F3FD-200D-2708",
    "1F468-1F3FE-200D-2708-FE0F",
    "1F468-1F3FE-200D-2708",
    "1F468-1F3FF-200D-2708-FE0F",
    "1F468-1F3FF-200D-2708",
    "1F469-200D-2708-FE0F",
    "1F469-200D-2708",
    "1F469-1F3FB-200D-2708-FE0F",
    "1F469-1F3FB-200D-2708",
    "1F469-1F3FC-200D-2708-FE0F",
    "1F469-1F3FC-200D-2708",
    "1F469-1F3FD-200D-2708-FE0F",
    "1F469-1F3FD-200D-2708",
    "1F469-1F3FE-200D-2708-FE0F",
    "1F469-1F3FE-200D-2708",
    "1F469-1F3FF-200D-2708-FE0F",
    "1F469-1F3FF-200D-2708",
    "1F9D1-200D-1F680",
    "1F9D1-1F3FB-200D-1F680",
    "1F9D1-1F3FC-200D-1F680",
    "1F9D1-1F3FD-200D-1F680",
    "1F9D1-1F3FE-200D-1F680",
    "1F9D1-1F3FF-200D-1F680",
    "1F468-200D-1F680",
    "1F468-1F3FB-200D-1F680",
    "1F468-1F3FC-200D-1F680",
    "1F468-1F3FD-200D-1F680",
    "1F468-1F3FE-200D-1F680",
    "1F468-1F3FF-200D-1F680",
    "1F469-200D-1F680",
    "1F469-1F3FB-200D-1F680",
    "1F469-1F3FC-200D-1F680",
    "1F469-1F3FD-200D-1F680",
    "1F469-1F3FE-200D-1F680",
    "1F469-1F3FF-200D-1F680",
    "1F9D1-200D-1F692",
    "1F9D1-1F3FB-200D-1F692",
    "1F9D1-1F3FC-200D-1F692",
    "1F9D1-1F3FD-200D-1F692",
    "1F9D1-1F3FE-200D-1F692",
    "1F9D1-1F3FF-200D-1F692",
    "1F468-200D-1F692",
    "1F468-1F3FB-200D-1F692",
    "1F468-1F3FC-200D-1F692",
    "1F468-1F3FD-200D-1F692",
    "1F468-1F3FE-200D-1F692",
    "1F468-1F3FF-200D-1F692",
    "1F469-200D-1F692",
    "1F469-1F3FB-200D-1F692",
    "1F469-1F3FC-200D-1F692",
    "1F469-1F3FD-200D-1F692",
    "1F469-1F3FE-200D-1F692",
    "1F469-1F3FF-200D-1F692",
    "1F46E",
    "1F46E-1F3FB",
    "1F46E-1F3FC",
    "1F46E-1F3FD",
    "1F46E-1F3FE",
    "1F46E-1F3FF",
    "1F46E-200D-2642-FE0F",
    "1F46E-200D-2642",
    "1F46E-1F3FB-200D-2642-FE0F",
    "1F46E-1F3FB-200D-2642",
    "1F46E-1F3FC-200D-2642-FE0F",
    "1F46E-1F3FC-200D-2642",
    "1F46E-1F3FD-200D-2642-FE0F",
    "1F46E-1F3FD-200D-2642",
    "1F46E-1F3FE-200D-2642-FE0F",
    "1F46E-1F3FE-200D-2642",
    "1F46E-1F3FF-200D-2642-FE0F",
    "1F46E-1F3FF-200D-2642",
    "1F46E-200D-2640-FE0F",
    "1F46E-200D-2640",
    "1F46E-1F3FB-200D-2640-FE0F",
    "1F46E-1F3FB-200D-2640",
    "1F46E-1F3FC-200D-2640-FE0F",
    "1F46E-1F3FC-200D-2640",
    "1F46E-1F3FD-200D-2640-FE0F",
    "1F46E-1F3FD-200D-2640",
    "1F46E-1F3FE-200D-2640-FE0F",
    "1F46E-1F3FE-200D-2640",
    "1F46E-1F3FF-200D-2640-FE0F",
    "1F46E-1F3FF-200D-2640",
    "1F575-FE0F",
    "1F575",
    "1F575-1F3FB",
    "1F575-1F3FC",
    "1F575-1F3FD",
    "1F575-1F3FE",
    "1F575-1F3FF",
    "1F575-FE0F-200D-2642-FE0F",
    "1F575-200D-2642-FE0F",
    "1F575-FE0F-200D-2642",
    "1F575-200D-2642",
    "1F575-1F3FB-200D-2642-FE0F",
    "1F575-1F3FB-200D-2642",
    "1F575-1F3FC-200D-2642-FE0F",
    "1F575-1F3FC-200D-2642",
    "1F575-1F3FD-200D-2642-FE0F",
    "1F575-1F3FD-200D-2642",
    "1F575-1F3FE-200D-2642-FE0F",
    "1F575-1F3FE-200D-2642",
    "1F575-1F3FF-200D-2642-FE0F",
    "1F575-1F3FF-200D-2642",
    "1F575-FE0F-200D-2640-FE0F",
    "1F575-200D-2640-FE0F",
    "1F575-FE0F-200D-2640",
    "1F575-200D-2640",
    "1F575-1F3FB-200D-2640-FE0F",
    "1F575-1F3FB-200D-2640",
    "1F575-1F3FC-200D-2640-FE0F",
    "1F575-1F3FC-200D-2640",
    "1F575-1F3FD-200D-2640-FE0F",
    "1F575-1F3FD-200D-2640",
    "1F575-1F3FE-200D-2640-FE0F",
    "1F575-1F3FE-200D-2640",
    "1F575-1F3FF-200D-2640-FE0F",
    "1F575-1F3FF-200D-2640",
    "1F482",
    "1F482-1F3FB",
    "1F482-1F3FC",
    "1F482-1F3FD",
    "1F482-1F3FE",
    "1F482-1F3FF",
    "1F482-200D-2642-FE0F",
    "1F482-200D-2642",
    "1F482-1F3FB-200D-2642-FE0F",
    "1F482-1F3FB-200D-2642",
    "1F482-1F3FC-200D-2642-FE0F",
    "1F482-1F3FC-200D-2642",
    "1F482-1F3FD-200D-2642-FE0F",
    "1F482-1F3FD-200D-2642",
    "1F482-1F3FE-200D-2642-FE0F",
    "1F482-1F3FE-200D-2642",
    "1F482-1F3FF-200D-2642-FE0F",
    "1F482-1F3FF-200D-2642",
    "1F482-200D-2640-FE0F",
    "1F482-200D-2640",
    "1F482-1F3FB-200D-2640-FE0F",
    "1F482-1F3FB-200D-2640",
    "1F482-1F3FC-200D-2640-FE0F",
    "1F482-1F3FC-200D-2640",
    "1F482-1F3FD-200D-2640-FE0F",
    "1F482-1F3FD-200D-2640",
    "1F482-1F3FE-200D-2640-FE0F",
    "1F482-1F3FE-200D-2640",
    "1F482-1F3FF-200D-2640-FE0F",
    "1F482-1F3FF-200D-2640",
    "1F977",
    "1F977-1F3FB",
    "1F977-1F3FC",
    "1F977-1F3FD",
    "1F977-1F3FE",
    "1F977-1F3FF",
    "1F477",
    "1F477-1F3FB",
    "1F477-1F3FC",
    "1F477-1F3FD",
    "1F477-1F3FE",
    "1F477-1F3FF",
    "1F477-200D-2642-FE0F",
    "1F477-200D-2642",
    "1F477-1F3FB-200D-2642-FE0F",
    "1F477-1F3FB-200D-2642",
    "1F477-1F3FC-200D-2642-FE0F",
    "1F477-1F3FC-200D-2642",
    "1F477-1F3FD-200D-2642-FE0F",
    "1F477-1F3FD-200D-2642",
    "1F477-1F3FE-200D-2642-FE0F",
    "1F477-1F3FE-200D-2642",
    "1F477-1F3FF-200D-2642-FE0F",
    "1F477-1F3FF-200D-2642",
    "1F477-200D-2640-FE0F",
    "1F477-200D-2640",
    "1F477-1F3FB-200D-2640-FE0F",
    "1F477-1F3FB-200D-2640",
    "1F477-1F3FC-200D-2640-FE0F",
    "1F477-1F3FC-200D-2640",
    "1F477-1F3FD-200D-2640-FE0F",
    "1F477-1F3FD-200D-2640",
    "1F477-1F3FE-200D-2640-FE0F",
    "1F477-1F3FE-200D-2640",
    "1F477-1F3FF-200D-2640-FE0F",
    "1F477-1F3FF-200D-2640",
    "1FAC5",
    "1FAC5-1F3FB",
    "1FAC5-1F3FC",
    "1FAC5-1F3FD",
    "1FAC5-1F3FE",
    "1FAC5-1F3FF",
    "1F934",
    "1F934-1F3FB",
    "1F934-1F3FC",
    "1F934-1F3FD",
    "1F934-1F3FE",
    "1F934-1F3FF",
    "1F478",
    "1F478-1F3FB",
    "1F478-1F3FC",
    "1F478-1F3FD",
    "1F478-1F3FE",
    "1F478-1F3FF",
    "1F473",
    "1F473-1F3FB",
    "1F473-1F3FC",
    "1F473-1F3FD",
    "1F473-1F3FE",
    "1F473-1F3FF",
    "1F473-200D-2642-FE0F",
    "1F473-200D-2642",
    "1F473-1F3FB-200D-2642-FE0F",
    "1F473-1F3FB-200D-2642",
    "1F473-1F3FC-200D-2642-FE0F",
    "1F473-1F3FC-200D-2642",
    "1F473-1F3FD-200D-2642-FE0F",
    "1F473-1F3FD-200D-2642",
    "1F473-1F3FE-200D-2642-FE0F",
    "1F473-1F3FE-200D-2642",
    "1F473-1F3FF-200D-2642-FE0F",
    "1F473-1F3FF-200D-2642",
    "1F473-200D-2640-FE0F",
    "1F473-200D-2640",
    "1F473-1F3FB-200D-2640-FE0F",
    "1F473-1F3FB-200D-2640",
    "1F473-1F3FC-200D-2640-FE0F",
    "1F473-1F3FC-200D-2640",
    "1F473-1F3FD-200D-2640-FE0F",
    "1F473-1F3FD-200D-2640",
    "1F473-1F3FE-200D-2640-FE0F",
    "1F473-1F3FE-200D-2640",
    "1F473-1F3FF-200D-2640-FE0F",
    "1F473-1F3FF-200D-2640",
    "1F472",
    "1F472-1F3FB",
    "1F472-1F3FC",
    "1F472-1F3FD",
    "1F472-1F3FE",
    "1F472-1F3FF",
    "1F9D5",
    "1F9D5-1F3FB",
    "1F9D5-1F3FC",
    "1F9D5-1F3FD",
    "1F9D5-1F3FE",
    "1F9D5-1F3FF",
    "1F935",
    "1F935-1F3FB",
    "1F935-1F3FC",
    "1F935-1F3FD",
    "1F935-1F3FE",
    "1F935-1F3FF",
    "1F935-200D-2642-FE0F",
    "1F935-200D-2642",
    "1F935-1F3FB-200D-2642-FE0F",
    "1F935-1F3FB-200D-2642",
    "1F935-1F3FC-200D-2642-FE0F",
    "1F935-1F3FC-200D-2642",
    "1F935-1F3FD-200D-2642-FE0F",
    "1F935-1F3FD-200D-2642",
    "1F935-1F3FE-200D-2642-FE0F",
    "1F935-1F3FE-200D-2642",
    "1F935-1F3FF-200D-2642-FE0F",
    "1F935-1F3FF-200D-2642",
    "1F935-200D-2640-FE0F",
    "1F935-200D-2640",
    "1F935-1F3FB-200D-2640-FE0F",
    "1F935-1F3FB-200D-2640",
    "1F935-1F3FC-200D-2640-FE0F",
    "1F935-1F3FC-200D-2640",
    "1F935-1F3FD-200D-2640-FE0F",
    "1F935-1F3FD-200D-2640",
    "1F935-1F3FE-200D-2640-FE0F",
    "1F935-1F3FE-200D-2640",
    "1F935-1F3FF-200D-2640-FE0F",
    "1F935-1F3FF-200D-2640",
    "1F470",
    "1F470-1F3FB",
    "1F470-1F3FC",
    "1F470-1F3FD",
    "1F470-1F3FE",
    "1F470-1F3FF",
    "1F470-200D-2642-FE0F",
    "1F470-200D-2642",
    "1F470-1F3FB-200D-2642-FE0F",
    "1F470-1F3FB-200D-2642",
    "1F470-1F3FC-200D-2642-FE0F",
    "1F470-1F3FC-200D-2642",
    "1F470-1F3FD-200D-2642-FE0F",
    "1F470-1F3FD-200D-2642",
    "1F470-1F3FE-200D-2642-FE0F",
    "1F470-1F3FE-200D-2642",
    "1F470-1F3FF-200D-2642-FE0F",
    "1F470-1F3FF-200D-2642",
    "1F470-200D-2640-FE0F",
    "1F470-200D-2640",
    "1F470-1F3FB-200D-2640-FE0F",
    "1F470-1F3FB-200D-2640",
    "1F470-1F3FC-200D-2640-FE0F",
    "1F470-1F3FC-200D-2640",
    "1F470-1F3FD-200D-2640-FE0F",
    "1F470-1F3FD-200D-2640",
    "1F470-1F3FE-200D-2640-FE0F",
    "1F470-1F3FE-200D-2640",
    "1F470-1F3FF-200D-2640-FE0F",
    "1F470-1F3FF-200D-2640",
    "1F930",
    "1F930-1F3FB",
    "1F930-1F3FC",
    "1F930-1F3FD",
    "1F930-1F3FE",
    "1F930-1F3FF",
    "1FAC3",
    "1FAC3-1F3FB",
    "1FAC3-1F3FC",
    "1FAC3-1F3FD",
    "1FAC3-1F3FE",
    "1FAC3-1F3FF",
    "1FAC4",
    "1FAC4-1F3FB",
    "1FAC4-1F3FC",
    "1FAC4-1F3FD",
    "1FAC4-1F3FE",
    "1FAC4-1F3FF",
    "1F931",
    "1F931-1F3FB",
    "1F931-1F3FC",
    "1F931-1F3FD",
    "1F931-1F3FE",
    "1F931-1F3FF",
    "1F469-200D-1F37C",
    "1F469-1F3FB-200D-1F37C",
    "1F469-1F3FC-200D-1F37C",
    "1F469-1F3FD-200D-1F37C",
    "1F469-1F3FE-200D-1F37C",
    "1F469-1F3FF-200D-1F37C",
    "1F468-200D-1F37C",
    "1F468-1F3FB-200D-1F37C",
    "1F468-1F3FC-200D-1F37C",
    "1F468-1F3FD-200D-1F37C",
    "1F468-1F3FE-200D-1F37C",
    "1F468-1F3FF-200D-1F37C",
    "1F9D1-200D-1F37C",
    "1F9D1-1F3FB-200D-1F37C",
    "1F9D1-1F3FC-200D-1F37C",
    "1F9D1-1F3FD-200D-1F37C",
    "1F9D1-1F3FE-200D-1F37C",
    "1F9D1-1F3FF-200D-1F37C",
    "1F47C",
    "1F47C-1F3FB",
    "1F47C-1F3FC",
    "1F47C-1F3FD",
    "1F47C-1F3FE",
    "1F47C-1F3FF",
    "1F385",
    "1F385-1F3FB",
    "1F385-1F3FC",
    "1F385-1F3FD",
    "1F385-1F3FE",
    "1F385-1F3FF",
    "1F936",
    "1F936-1F3FB",
    "1F936-1F3FC",
    "1F936-1F3FD",
    "1F936-1F3FE",
    "1F936-1F3FF",
    "1F9D1-200D-1F384",
    "1F9D1-1F3FB-200D-1F384",
    "1F9D1-1F3FC-200D-1F384",
    "1F9D1-1F3FD-200D-1F384",
    "1F9D1-1F3FE-200D-1F384",
    "1F9D1-1F3FF-200D-1F384",
    "1F9B8",
    "1F9B8-1F3FB",
    "1F9B8-1F3FC",
    "1F9B8-1F3FD",
    "1F9B8-1F3FE",
    "1F9B8-1F3FF",
    "1F9B8-200D-2642-FE0F",
    "1F9B8-200D-2642",
    "1F9B8-1F3FB-200D-2642-FE0F",
    "1F9B8-1F3FB-200D-2642",
    "1F9B8-1F3FC-200D-2642-FE0F",
    "1F9B8-1F3FC-200D-2642",
    "1F9B8-1F3FD-200D-2642-FE0F",
    "1F9B8-1F3FD-200D-2642",
    "1F9B8-1F3FE-200D-2642-FE0F",
    "1F9B8-1F3FE-200D-2642",
    "1F9B8-1F3FF-200D-2642-FE0F",
    "1F9B8-1F3FF-200D-2642",
    "1F9B8-200D-2640-FE0F",
    "1F9B8-200D-2640",
    "1F9B8-1F3FB-200D-2640-FE0F",
    "1F9B8-1F3FB-200D-2640",
    "1F9B8-1F3FC-200D-2640-FE0F",
    "1F9B8-1F3FC-200D-2640",
    "1F9B8-1F3FD-200D-2640-FE0F",
    "1F9B8-1F3FD-200D-2640",
    "1F9B8-1F3FE-200D-2640-FE0F",
    "1F9B8-1F3FE-200D-2640",
    "1F9B8-1F3FF-200D-2640-FE0F",
    "1F9B8-1F3FF-200D-2640",
    "1F9B9",
    "1F9B9-1F3FB",
    "1F9B9-1F3FC",
    "1F9B9-1F3FD",
    "1F9B9-1F3FE",
    "1F9B9-1F3FF",
    "1F9B9-200D-2642-FE0F",
    "1F9B9-200D-2642",
    "1F9B9-1F3FB-200D-2642-FE0F",
    "1F9B9-1F3FB-200D-2642",
    "1F9B9-1F3FC-200D-2642-FE0F",
    "1F9B9-1F3FC-200D-2642",
    "1F9B9-1F3FD-200D-2642-FE0F",
    "1F9B9-1F3FD-200D-2642",
    "1F9B9-1F3FE-200D-2642-FE0F",
    "1F9B9-1F3FE-200D-2642",
    "1F9B9-1F3FF-200D-2642-FE0F",
    "1F9B9-1F3FF-200D-2642",
    "1F9B9-200D-2640-FE0F",
    "1F9B9-200D-2640",
    "1F9B9-1F3FB-200D-2640-FE0F",
    "1F9B9-1F3FB-200D-2640",
    "1F9B9-1F3FC-200D-2640-FE0F",
    "1F9B9-1F3FC-200D-2640",
    "1F9B9-1F3FD-200D-2640-FE0F",
    "1F9B9-1F3FD-200D-2640",
    "1F9B9-1F3FE-200D-2640-FE0F",
    "1F9B9-1F3FE-200D-2640",
    "1F9B9-1F3FF-200D-2640-FE0F",
    "1F9B9-1F3FF-200D-2640",
    "1F9D9",
    "1F9D9-1F3FB",
    "1F9D9-1F3FC",
    "1F9D9-1F3FD",
    "1F9D9-1F3FE",
    "1F9D9-1F3FF",
    "1F9D9-200D-2642-FE0F",
    "1F9D9-200D-2642",
    "1F9D9-1F3FB-200D-2642-FE0F",
    "1F9D9-1F3FB-200D-2642",
    "1F9D9-1F3FC-200D-2642-FE0F",
    "1F9D9-1F3FC-200D-2642",
    "1F9D9-1F3FD-200D-2642-FE0F",
    "1F9D9-1F3FD-200D-2642",
    "1F9D9-1F3FE-200D-2642-FE0F",
    "1F9D9-1F3FE-200D-2642",
    "1F9D9-1F3FF-200D-2642-FE0F",
    "1F9D9-1F3FF-200D-2642",
    "1F9D9-200D-2640-FE0F",
    "1F9D9-200D-2640",
    "1F9D9-1F3FB-200D-2640-FE0F",
    "1F9D9-1F3FB-200D-2640",
    "1F9D9-1F3FC-200D-2640-FE0F",
    "1F9D9-1F3FC-200D-2640",
    "1F9D9-1F3FD-200D-2640-FE0F",
    "1F9D9-1F3FD-200D-2640",
    "1F9D9-1F3FE-200D-2640-FE0F",
    "1F9D9-1F3FE-200D-2640",
    "1F9D9-1F3FF-200D-2640-FE0F",
    "1F9D9-1F3FF-200D-2640",
    "1F9DA",
    "1F9DA-1F3FB",
    "1F9DA-1F3FC",
    "1F9DA-1F3FD",
    "1F9DA-1F3FE",
    "1F9DA-1F3FF",
    "1F9DA-200D-2642-FE0F",
    "1F9DA-200D-2642",
    "1F9DA-1F3FB-200D-2642-FE0F",
    "1F9DA-1F3FB-200D-2642",
    "1F9DA-1F3FC-200D-2642-FE0F",
    "1F9DA-1F3FC-200D-2642",
    "1F9DA-1F3FD-200D-2642-FE0F",
    "1F9DA-1F3FD-200D-2642",
    "1F9DA-1F3FE-200D-2642-FE0F",
    "1F9DA-1F3FE-200D-2642",
    "1F9DA-1F3FF-200D-2642-FE0F",
    "1F9DA-1F3FF-200D-2642",
    "1F9DA-200D-2640-FE0F",
    "1F9DA-200D-2640",
    "1F9DA-1F3FB-200D-2640-FE0F",
    "1F9DA-1F3FB-200D-2640",
    "1F9DA-1F3FC-200D-2640-FE0F",
    "1F9DA-1F3FC-200D-2640",
    "1F9DA-1F3FD-200D-2640-FE0F",
    "1F9DA-1F3FD-200D-2640",
    "1F9DA-1F3FE-200D-2640-FE0F",
    "1F9DA-1F3FE-200D-2640",
    "1F9DA-1F3FF-200D-2640-FE0F",
    "1F9DA-1F3FF-200D-2640",
    "1F9DB",
    "1F9DB-1F3FB",
    "1F9DB-1F3FC",
    "1F9DB-1F3FD",
    "1F9DB-1F3FE",
    "1F9DB-1F3FF",
    "1F9DB-200D-2642-FE0F",
    "1F9DB-200D-2642",
    "1F9DB-1F3FB-200D-2642-FE0F",
    "1F9DB-1F3FB-200D-2642",
    "1F9DB-1F3FC-200D-2642-FE0F",
    "1F9DB-1F3FC-200D-2642",
    "1F9DB-1F3FD-200D-2642-FE0F",
    "1F9DB-1F3FD-200D-2642",
    "1F9DB-1F3FE-200D-2642-FE0F",
    "1F9DB-1F3FE-200D-2642",
    "1F9DB-1F3FF-200D-2642-FE0F",
    "1F9DB-1F3FF-200D-2642",
    "1F9DB-200D-2640-FE0F",
    "1F9DB-200D-2640",
    "1F9DB-1F3FB-200D-2640-FE0F",
    "1F9DB-1F3FB-200D-2640",
    "1F9DB-1F3FC-200D-2640-FE0F",
    "1F9DB-1F3FC-200D-2640",
    "1F9DB-1F3FD-200D-2640-FE0F",
    "1F9DB-1F3FD-200D-2640",
    "1F9DB-1F3FE-200D-2640-FE0F",
    "1F9DB-1F3FE-200D-2640",
    "1F9DB-1F3FF-200D-2640-FE0F",
    "1F9DB-1F3FF-200D-2640",
    "1F9DC",
    "1F9DC-1F3FB",
    "1F9DC-1F3FC",
    "1F9DC-1F3FD",
    "1F9DC-1F3FE",
    "1F9DC-1F3FF",
    "1F9DC-200D-2642-FE0F",
    "1F9DC-200D-2642",
    "1F9DC-1F3FB-200D-2642-FE0F",
    "1F9DC-1F3FB-200D-2642",
    "1F9DC-1F3FC-200D-2642-FE0F",
    "1F9DC-1F3FC-200D-2642",
    "1F9DC-1F3FD-200D-2642-FE0F",
    "1F9DC-1F3FD-200D-2642",
    "1F9DC-1F3FE-200D-2642-FE0F",
    "1F9DC-1F3FE-200D-2642",
    "1F9DC-1F3FF-200D-2642-FE0F",
    "1F9DC-1F3FF-200D-2642",
    "1F9DC-200D-2640-FE0F",
    "1F9DC-200D-2640",
    "1F9DC-1F3FB-200D-2640-FE0F",
    "1F9DC-1F3FB-200D-2640",
    "1F9DC-1F3FC-200D-2640-FE0F",
    "1F9DC-1F3FC-200D-2640",
    "1F9DC-1F3FD-200D-2640-FE0F",
    "1F9DC-1F3FD-200D-2640",
    "1F9DC-1F3FE-200D-2640-FE0F",
    "1F9DC-1F3FE-200D-2640",
    "1F9DC-1F3FF-200D-2640-FE0F",
    "1F9DC-1F3FF-200D-2640",
    "1F9DD",
    "1F9DD-1F3FB",
    "1F9DD-1F3FC",
    "1F9DD-1F3FD",
    "1F9DD-1F3FE",
    "1F9DD-1F3FF",
    "1F9DD-200D-2642-FE0F",
    "1F9DD-200D-2642",
    "1F9DD-1F3FB-200D-2642-FE0F",
    "1F9DD-1F3FB-200D-2642",
    "1F9DD-1F3FC-200D-2642-FE0F",
    "1F9DD-1F3FC-200D-2642",
    "1F9DD-1F3FD-200D-2642-FE0F",
    "1F9DD-1F3FD-200D-2642",
    "1F9DD-1F3FE-200D-2642-FE0F",
    "1F9DD-1F3FE-200D-2642",
    "1F9DD-1F3FF-200D-2642-FE0F",
    "1F9DD-1F3FF-200D-2642",
    "1F9DD-200D-2640-FE0F",
    "1F9DD-200D-2640",
    "1F9DD-1F3FB-200D-2640-FE0F",
    "1F9DD-1F3FB-200D-2640",
    "1F9DD-1F3FC-200D-2640-FE0F",
    "1F9DD-1F3FC-200D-2640",
    "1F9DD-1F3FD-200D-2640-FE0F",
    "1F9DD-1F3FD-200D-2640",
    "1F9DD-1F3FE-200D-2640-FE0F",
    "1F9DD-1F3FE-200D-2640",
    "1F9DD-1F3FF-200D-2640-FE0F",
    "1F9DD-1F3FF-200D-2640",
    "1F9DE",
    "1F9DE-200D-2642-FE0F",
    "1F9DE-200D-2642",
    "1F9DE-200D-2640-FE0F",
    "1F9DE-200D-2640",
    "1F9DF",
    "1F9DF-200D-2642-FE0F",
    "1F9DF-200D-2642",
    "1F9DF-200D-2640-FE0F",
    "1F9DF-200D-2640",
    "1F9CC",
    "1F486",
    "1F486-1F3FB",
    "1F486-1F3FC",
    "1F486-1F3FD",
    "1F486-1F3FE",
    "1F486-1F3FF",
    "1F486-200D-2642-FE0F",
    "1F486-200D-2642",
    "1F486-1F3FB-200D-2642-FE0F",
    "1F486-1F3FB-200D-2642",
    "1F486-1F3FC-200D-2642-FE0F",
    "1F486-1F3FC-200D-2642",
    "1F486-1F3FD-200D-2642-FE0F",
    "1F486-1F3FD-200D-2642",
    "1F486-1F3FE-200D-2642-FE0F",
    "1F486-1F3FE-200D-2642",
    "1F486-1F3FF-200D-2642-FE0F",
    "1F486-1F3FF-200D-2642",
    "1F486-200D-2640-FE0F",
    "1F486-200D-2640",
    "1F486-1F3FB-200D-2640-FE0F",
    "1F486-1F3FB-200D-2640",
    "1F486-1F3FC-200D-2640-FE0F",
    "1F486-1F3FC-200D-2640",
    "1F486-1F3FD-200D-2640-FE0F",
    "1F486-1F3FD-200D-2640",
    "1F486-1F3FE-200D-2640-FE0F",
    "1F486-1F3FE-200D-2640",
    "1F486-1F3FF-200D-2640-FE0F",
    "1F486-1F3FF-200D-2640",
    "1F487",
    "1F487-1F3FB",
    "1F487-1F3FC",
    "1F487-1F3FD",
    "1F487-1F3FE",
    "1F487-1F3FF",
    "1F487-200D-2642-FE0F",
    "1F487-200D-2642",
    "1F487-1F3FB-200D-2642-FE0F",
    "1F487-1F3FB-200D-2642",
    "1F487-1F3FC-200D-2642-FE0F",
    "1F487-1F3FC-200D-2642",
    "1F487-1F3FD-200D-2642-FE0F",
    "1F487-1F3FD-200D-2642",
    "1F487-1F3FE-200D-2642-FE0F",
    "1F487-1F3FE-200D-2642",
    "1F487-1F3FF-200D-2642-FE0F",
    "1F487-1F3FF-200D-2642",
    "1F487-200D-2640-FE0F",
    "1F487-200D-2640",
    "1F487-1F3FB-200D-2640-FE0F",
    "1F487-1F3FB-200D-2640",
    "1F487-1F3FC-200D-2640-FE0F",
    "1F487-1F3FC-200D-2640",
    "1F487-1F3FD-200D-2640-FE0F",
    "1F487-1F3FD-200D-2640",
    "1F487-1F3FE-200D-2640-FE0F",
    "1F487-1F3FE-200D-2640",
    "1F487-1F3FF-200D-2640-FE0F",
    "1F487-1F3FF-200D-2640",
    "1F6B6",
    "1F6B6-1F3FB",
    "1F6B6-1F3FC",
    "1F6B6-1F3FD",
    "1F6B6-1F3FE",
    "1F6B6-1F3FF",
    "1F6B6-200D-2642-FE0F",
    "1F6B6-200D-2642",
    "1F6B6-1F3FB-200D-2642-FE0F",
    "1F6B6-1F3FB-200D-2642",
    "1F6B6-1F3FC-200D-2642-FE0F",
    "1F6B6-1F3FC-200D-2642",
    "1F6B6-1F3FD-200D-2642-FE0F",
    "1F6B6-1F3FD-200D-2642",
    "1F6B6-1F3FE-200D-2642-FE0F",
    "1F6B6-1F3FE-200D-2642",
    "1F6B6-1F3FF-200D-2642-FE0F",
    "1F6B6-1F3FF-200D-2642",
    "1F6B6-200D-2640-FE0F",
    "1F6B6-200D-2640",
    "1F6B6-1F3FB-200D-2640-FE0F",
    "1F6B6-1F3FB-200D-2640",
    "1F6B6-1F3FC-200D-2640-FE0F",
    "1F6B6-1F3FC-200D-2640",
    "1F6B6-1F3FD-200D-2640-FE0F",
    "1F6B6-1F3FD-200D-2640",
    "1F6B6-1F3FE-200D-2640-FE0F",
    "1F6B6-1F3FE-200D-2640",
    "1F6B6-1F3FF-200D-2640-FE0F",
    "1F6B6-1F3FF-200D-2640",
    "1F6B6-200D-27A1-FE0F",
    "1F6B6-200D-27A1",
    "1F6B6-1F3FB-200D-27A1-FE0F",
    "1F6B6-1F3FB-200D-27A1",
    "1F6B6-1F3FC-200D-27A1-FE0F",
    "1F6B6-1F3FC-200D-27A1",
    "1F6B6-1F3FD-200D-27A1-FE0F",
    "1F6B6-1F3FD-200D-27A1",
    "1F6B6-1F3FE-200D-27A1-FE0F",
    "1F6B6-1F3FE-200D-27A1",
    "1F6B6-1F3FF-200D-27A1-FE0F",
    "1F6B6-1F3FF-200D-27A1",
    "1F6B6-200D-2640-FE0F-200D-27A1-FE0F",
    "1F6B6-200D-2640-200D-27A1-FE0F",
    "1F6B6-200D-2640-FE0F-200D-27A1",
    "1F6B6-200D-2640-200D-27A1",
    "1F6B6-1F3FB-200D-2640-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FB-200D-2640-200D-27A1-FE0F",
    "1F6B6-1F3FB-200D-2640-FE0F-200D-27A1",
    "1F6B6-1F3FB-200D-2640-200D-27A1",
    "1F6B6-1F3FC-200D-2640-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FC-200D-2640-200D-27A1-FE0F",
    "1F6B6-1F3FC-200D-2640-FE0F-200D-27A1",
    "1F6B6-1F3FC-200D-2640-200D-27A1",
    "1F6B6-1F3FD-200D-2640-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FD-200D-2640-200D-27A1-FE0F",
    "1F6B6-1F3FD-200D-2640-FE0F-200D-27A1",
    "1F6B6-1F3FD-200D-2640-200D-27A1",
    "1F6B6-1F3FE-200D-2640-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FE-200D-2640-200D-27A1-FE0F",
    "1F6B6-1F3FE-200D-2640-FE0F-200D-27A1",
    "1F6B6-1F3FE-200D-2640-200D-27A1",
    "1F6B6-1F3FF-200D-2640-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FF-200D-2640-200D-27A1-FE0F",
    "1F6B6-1F3FF-200D-2640-FE0F-200D-27A1",
    "1F6B6-1F3FF-200D-2640-200D-27A1",
    "1F6B6-200D-2642-FE0F-200D-27A1-FE0F",
    "1F6B6-200D-2642-200D-27A1-FE0F",
    "1F6B6-200D-2642-FE0F-200D-27A1",
    "1F6B6-200D-2642-200D-27A1",
    "1F6B6-1F3FB-200D-2642-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FB-200D-2642-200D-27A1-FE0F",
    "1F6B6-1F3FB-200D-2642-FE0F-200D-27A1",
    "1F6B6-1F3FB-200D-2642-200D-27A1",
    "1F6B6-1F3FC-200D-2642-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FC-200D-2642-200D-27A1-FE0F",
    "1F6B6-1F3FC-200D-2642-FE0F-200D-27A1",
    "1F6B6-1F3FC-200D-2642-200D-27A1",
    "1F6B6-1F3FD-200D-2642-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FD-200D-2642-200D-27A1-FE0F",
    "1F6B6-1F3FD-200D-2642-FE0F-200D-27A1",
    "1F6B6-1F3FD-200D-2642-200D-27A1",
    "1F6B6-1F3FE-200D-2642-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FE-200D-2642-200D-27A1-FE0F",
    "1F6B6-1F3FE-200D-2642-FE0F-200D-27A1",
    "1F6B6-1F3FE-200D-2642-200D-27A1",
    "1F6B6-1F3FF-200D-2642-FE0F-200D-27A1-FE0F",
    "1F6B6-1F3FF-200D-2642-200D-27A1-FE0F",
    "1F6B6-1F3FF-200D-2642-FE0F-200D-27A1",
    "1F6B6-1F3FF-200D-2642-200D-27A1",
    "1F9CD",
    "1F9CD-1F3FB",
    "1F9CD-1F3FC",
    "1F9CD-1F3FD",
    "1F9CD-1F3FE",
    "1F9CD-1F3FF",
    "1F9CD-200D-2642-FE0F",
    "1F9CD-200D-2642",
    "1F9CD-1F3FB-200D-2642-FE0F",
    "1F9CD-1F3FB-200D-2642",
    "1F9CD-1F3FC-200D-2642-FE0F",
    "1F9CD-1F3FC-200D-2642",
    "1F9CD-1F3FD-200D-2642-FE0F",
    "1F9CD-1F3FD-200D-2642",
    "1F9CD-1F3FE-200D-2642-FE0F",
    "1F9CD-1F3FE-200D-2642",
    "1F9CD-1F3FF-200D-2642-FE0F",
    "1F9CD-1F3FF-200D-2642",
    "1F9CD-200D-2640-FE0F",
    "1F9CD-200D-2640",
    "1F9CD-1F3FB-200D-2640-FE0F",
    "1F9CD-1F3FB-200D-2640",
    "1F9CD-1F3FC-200D-2640-FE0F",
    "1F9CD-1F3FC-200D-2640",
    "1F9CD-1F3FD-200D-2640-FE0F",
    "1F9CD-1F3FD-200D-2640",
    "1F9CD-1F3FE-200D-2640-FE0F",
    "1F9CD-1F3FE-200D-2640",
    "1F9CD-1F3FF-200D-2640-FE0F",
    "1F9CD-1F3FF-200D-2640",
    "1F9CE",
    "1F9CE-1F3FB",
    "1F9CE-1F3FC",
    "1F9CE-1F3FD",
    "1F9CE-1F3FE",
    "1F9CE-1F3FF",
    "1F9CE-200D-2642-FE0F",
    "1F9CE-200D-2642",
    "1F9CE-1F3FB-200D-2642-FE0F",
    "1F9CE-1F3FB-200D-2642",
    "1F9CE-1F3FC-200D-2642-FE0F",
    "1F9CE-1F3FC-200D-2642",
    "1F9CE-1F3FD-200D-2642-FE0F",
    "1F9CE-1F3FD-200D-2642",
    "1F9CE-1F3FE-200D-2642-FE0F",
    "1F9CE-1F3FE-200D-2642",
    "1F9CE-1F3FF-200D-2642-FE0F",
    "1F9CE-1F3FF-200D-2642",
    "1F9CE-200D-2640-FE0F",
    "1F9CE-200D-2640",
    "1F9CE-1F3FB-200D-2640-FE0F",
    "1F9CE-1F3FB-200D-2640",
    "1F9CE-1F3FC-200D-2640-FE0F",
    "1F9CE-1F3FC-200D-2640",
    "1F9CE-1F3FD-200D-2640-FE0F",
    "1F9CE-1F3FD-200D-2640",
    "1F9CE-1F3FE-200D-2640-FE0F",
    "1F9CE-1F3FE-200D-2640",
    "1F9CE-1F3FF-200D-2640-FE0F",
    "1F9CE-1F3FF-200D-2640",
    "1F9CE-200D-27A1-FE0F",
    "1F9CE-200D-27A1",
    "1F9CE-1F3FB-200D-27A1-FE0F",
    "1F9CE-1F3FB-200D-27A1",
    "1F9CE-1F3FC-200D-27A1-FE0F",
    "1F9CE-1F3FC-200D-27A1",
    "1F9CE-1F3FD-200D-27A1-FE0F",
    "1F9CE-1F3FD-200D-27A1",
    "1F9CE-1F3FE-200D-27A1-FE0F",
    "1F9CE-1F3FE-200D-27A1",
    "1F9CE-1F3FF-200D-27A1-FE0F",
    "1F9CE-1F3FF-200D-27A1",
    "1F9CE-200D-2640-FE0F-200D-27A1-FE0F",
    "1F9CE-200D-2640-200D-27A1-FE0F",
    "1F9CE-200D-2640-FE0F-200D-27A1",
    "1F9CE-200D-2640-200D-27A1",
    "1F9CE-1F3FB-200D-2640-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FB-200D-2640-200D-27A1-FE0F",
    "1F9CE-1F3FB-200D-2640-FE0F-200D-27A1",
    "1F9CE-1F3FB-200D-2640-200D-27A1",
    "1F9CE-1F3FC-200D-2640-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FC-200D-2640-200D-27A1-FE0F",
    "1F9CE-1F3FC-200D-2640-FE0F-200D-27A1",
    "1F9CE-1F3FC-200D-2640-200D-27A1",
    "1F9CE-1F3FD-200D-2640-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FD-200D-2640-200D-27A1-FE0F",
    "1F9CE-1F3FD-200D-2640-FE0F-200D-27A1",
    "1F9CE-1F3FD-200D-2640-200D-27A1",
    "1F9CE-1F3FE-200D-2640-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FE-200D-2640-200D-27A1-FE0F",
    "1F9CE-1F3FE-200D-2640-FE0F-200D-27A1",
    "1F9CE-1F3FE-200D-2640-200D-27A1",
    "1F9CE-1F3FF-200D-2640-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FF-200D-2640-200D-27A1-FE0F",
    "1F9CE-1F3FF-200D-2640-FE0F-200D-27A1",
    "1F9CE-1F3FF-200D-2640-200D-27A1",
    "1F9CE-200D-2642-FE0F-200D-27A1-FE0F",
    "1F9CE-200D-2642-200D-27A1-FE0F",
    "1F9CE-200D-2642-FE0F-200D-27A1",
    "1F9CE-200D-2642-200D-27A1",
    "1F9CE-1F3FB-200D-2642-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FB-200D-2642-200D-27A1-FE0F",
    "1F9CE-1F3FB-200D-2642-FE0F-200D-27A1",
    "1F9CE-1F3FB-200D-2642-200D-27A1",
    "1F9CE-1F3FC-200D-2642-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FC-200D-2642-200D-27A1-FE0F",
    "1F9CE-1F3FC-200D-2642-FE0F-200D-27A1",
    "1F9CE-1F3FC-200D-2642-200D-27A1",
    "1F9CE-1F3FD-200D-2642-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FD-200D-2642-200D-27A1-FE0F",
    "1F9CE-1F3FD-200D-2642-FE0F-200D-27A1",
    "1F9CE-1F3FD-200D-2642-200D-27A1",
    "1F9CE-1F3FE-200D-2642-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FE-200D-2642-200D-27A1-FE0F",
    "1F9CE-1F3FE-200D-2642-FE0F-200D-27A1",
    "1F9CE-1F3FE-200D-2642-200D-27A1",
    "1F9CE-1F3FF-200D-2642-FE0F-200D-27A1-FE0F",
    "1F9CE-1F3FF-200D-2642-200D-27A1-FE0F",
    "1F9CE-1F3FF-200D-2642-FE0F-200D-27A1",
    "1F9CE-1F3FF-200D-2642-200D-27A1",
    "1F9D1-200D-1F9AF",
    "1F9D1-1F3FB-200D-1F9AF",
    "1F9D1-1F3FC-200D-1F9AF",
    "1F9D1-1F3FD-200D-1F9AF",
    "1F9D1-1F3FE-200D-1F9AF",
    "1F9D1-1F3FF-200D-1F9AF",
    "1F9D1-200D-1F9AF-200D-27A1-FE0F",
    "1F9D1-200D-1F9AF-200D-27A1",
    "1F9D1-1F3FB-200D-1F9AF-200D-27A1-FE0F",
    "1F9D1-1F3FB-200D-1F9AF-200D-27A1",
    "1F9D1-1F3FC-200D-1F9AF-200D-27A1-FE0F",
    "1F9D1-1F3FC-200D-1F9AF-200D-27A1",
    "1F9D1-1F3FD-200D-1F9AF-200D-27A1-FE0F",
    "1F9D1-1F3FD-200D-1F9AF-200D-27A1",
    "1F9D1-1F3FE-200D-1F9AF-200D-27A1-FE0F",
    "1F9D1-1F3FE-200D-1F9AF-200D-27A1",
    "1F9D1-1F3FF-200D-1F9AF-200D-27A1-FE0F",
    "1F9D1-1F3FF-200D-1F9AF-200D-27A1",
    "1F468-200D-1F9AF",
    "1F468-1F3FB-200D-1F9AF",
    "1F468-1F3FC-200D-1F9AF",
    "1F468-1F3FD-200D-1F9AF",
    "1F468-1F3FE-200D-1F9AF",
    "1F468-1F3FF-200D-1F9AF",
    "1F468-200D-1F9AF-200D-27A1-FE0F",
    "1F468-200D-1F9AF-200D-27A1",
    "1F468-1F3FB-200D-1F9AF-200D-27A1-FE0F",
    "1F468-1F3FB-200D-1F9AF-200D-27A1",
    "1F468-1F3FC-200D-1F9AF-200D-27A1-FE0F",
    "1F468-1F3FC-200D-1F9AF-200D-27A1",
    "1F468-1F3FD-200D-1F9AF-200D-27A1-FE0F",
    "1F468-1F3FD-200D-1F9AF-200D-27A1",
    "1F468-1F3FE-200D-1F9AF-200D-27A1-FE0F",
    "1F468-1F3FE-200D-1F9AF-200D-27A1",
    "1F468-1F3FF-200D-1F9AF-200D-27A1-FE0F",
    "1F468-1F3FF-200D-1F9AF-200D-27A1",
    "1F469-200D-1F9AF",
    "1F469-1F3FB-200D-1F9AF",
    "1F469-1F3FC-200D-1F9AF",
    "1F469-1F3FD-200D-1F9AF",
    "1F469-1F3FE-200D-1F9AF",
    "1F469-1F3FF-200D-1F9AF",
    "1F469-200D-1F9AF-200D-27A1-FE0F",
    "1F469-200D-1F9AF-200D-27A1",
    "1F469-1F3FB-200D-1F9AF-200D-27A1-FE0F",
    "1F469-1F3FB-200D-1F9AF-200D-27A1",
    "1F469-1F3FC-200D-1F9AF-200D-27A1-FE0F",
    "1F469-1F3FC-200D-1F9AF-200D-27A1",
    "1F469-1F3FD-200D-1F9AF-200D-27A1-FE0F",
    "1F469-1F3FD-200D-1F9AF-200D-27A1",
    "1F469-1F3FE-200D-1F9AF-200D-27A1-FE0F",
    "1F469-1F3FE-200D-1F9AF-200D-27A1",
    "1F469-1F3FF-200D-1F9AF-200D-27A1-FE0F",
    "1F469-1F3FF-200D-1F9AF-200D-27A1",
    "1F9D1-200D-1F9BC",
    "1F9D1-1F3FB-200D-1F9BC",
    "1F9D1-1F3FC-200D-1F9BC",
    "1F9D1-1F3FD-200D-1F9BC",
    "1F9D1-1F3FE-200D-1F9BC",
    "1F9D1-1F3FF-200D-1F9BC",
    "1F9D1-200D-1F9BC-200D-27A1-FE0F",
    "1F9D1-200D-1F9BC-200D-27A1",
    "1F9D1-1F3FB-200D-1F9BC-200D-27A1-FE0F",
    "1F9D1-1F3FB-200D-1F9BC-200D-27A1",
    "1F9D1-1F3FC-200D-1F9BC-200D-27A1-FE0F",
    "1F9D1-1F3FC-200D-1F9BC-200D-27A1",
    "1F9D1-1F3FD-200D-1F9BC-200D-27A1-FE0F",
    "1F9D1-1F3FD-200D-1F9BC-200D-27A1",
    "1F9D1-1F3FE-200D-1F9BC-200D-27A1-FE0F",
    "1F9D1-1F3FE-200D-1F9BC-200D-27A1",
    "1F9D1-1F3FF-200D-1F9BC-200D-27A1-FE0F",
    "1F9D1-1F3FF-200D-1F9BC-200D-27A1",
    "1F468-200D-1F9BC",
    "1F468-1F3FB-200D-1F9BC",
    "1F468-1F3FC-200D-1F9BC",
    "1F468-1F3FD-200D-1F9BC",
    "1F468-1F3FE-200D-1F9BC",
    "1F468-1F3FF-200D-1F9BC",
    "1F468-200D-1F9BC-200D-27A1-FE0F",
    "1F468-200D-1F9BC-200D-27A1",
    "1F468-1F3FB-200D-1F9BC-200D-27A1-FE0F",
    "1F468-1F3FB-200D-1F9BC-200D-27A1",
    "1F468-1F3FC-200D-1F9BC-200D-27A1-FE0F",
    "1F468-1F3FC-200D-1F9BC-200D-27A1",
    "1F468-1F3FD-200D-1F9BC-200D-27A1-FE0F",
    "1F468-1F3FD-200D-1F9BC-200D-27A1",
    "1F468-1F3FE-200D-1F9BC-200D-27A1-FE0F",
    "1F468-1F3FE-200D-1F9BC-200D-27A1",
    "1F468-1F3FF-200D-1F9BC-200D-27A1-FE0F",
    "1F468-1F3FF-200D-1F9BC-200D-27A1",
    "1F469-200D-1F9BC",
    "1F469-1F3FB-200D-1F9BC",
    "1F469-1F3FC-200D-1F9BC",
    "1F469-1F3FD-200D-1F9BC",
    "1F469-1F3FE-200D-1F9BC",
    "1F469-1F3FF-200D-1F9BC",
    "1F469-200D-1F9BC-200D-27A1-FE0F",
    "1F469-200D-1F9BC-200D-27A1",
    "1F469-1F3FB-200D-1F9BC-200D-27A1-FE0F",
    "1F469-1F3FB-200D-1F9BC-200D-27A1",
    "1F469-1F3FC-200D-1F9BC-200D-27A1-FE0F",
    "1F469-1F3FC-200D-1F9BC-200D-27A1",
    "1F469-1F3FD-200D-1F9BC-200D-27A1-FE0F",
    "1F469-1F3FD-200D-1F9BC-200D-27A1",
    "1F469-1F3FE-200D-1F9BC-200D-27A1-FE0F",
    "1F469-1F3FE-200D-1F9BC-200D-27A1",
    "1F469-1F3FF-200D-1F9BC-200D-27A1-FE0F",
    "1F469-1F3FF-200D-1F9BC-200D-27A1",
    "1F9D1-200D-1F9BD",
    "1F9D1-1F3FB-200D-1F9BD",
    "1F9D1-1F3FC-200D-1F9BD",
    "1F9D1-1F3FD-200D-1F9BD",
    "1F9D1-1F3FE-200D-1F9BD",
    "1F9D1-1F3FF-200D-1F9BD",
    "1F9D1-200D-1F9BD-200D-27A1-FE0F",
    "1F9D1-200D-1F9BD-200D-27A1",
    "1F9D1-1F3FB-200D-1F9BD-200D-27A1-FE0F",
    "1F9D1-1F3FB-200D-1F9BD-200D-27A1",
    "1F9D1-1F3FC-200D-1F9BD-200D-27A1-FE0F",
    "1F9D1-1F3FC-200D-1F9BD-200D-27A1",
    "1F9D1-1F3FD-200D-1F9BD-200D-27A1-FE0F",
    "1F9D1-1F3FD-200D-1F9BD-200D-27A1",
    "1F9D1-1F3FE-200D-1F9BD-200D-27A1-FE0F",
    "1F9D1-1F3FE-200D-1F9BD-200D-27A1",
    "1F9D1-1F3FF-200D-1F9BD-200D-27A1-FE0F",
    "1F9D1-1F3FF-200D-1F9BD-200D-27A1",
    "1F468-200D-1F9BD",
    "1F468-1F3FB-200D-1F9BD",
    "1F468-1F3FC-200D-1F9BD",
    "1F468-1F3FD-200D-1F9BD",
    "1F468-1F3FE-200D-1F9BD",
    "1F468-1F3FF-200D-1F9BD",
    "1F468-200D-1F9BD-200D-27A1-FE0F",
    "1F468-200D-1F9BD-200D-27A1",
    "1F468-1F3FB-200D-1F9BD-200D-27A1-FE0F",
    "1F468-1F3FB-200D-1F9BD-200D-27A1",
    "1F468-1F3FC-200D-1F9BD-200D-27A1-FE0F",
    "1F468-1F3FC-200D-1F9BD-200D-27A1",
    "1F468-1F3FD-200D-1F9BD-200D-27A1-FE0F",
    "1F468-1F3FD-200D-1F9BD-200D-27A1",
    "1F468-1F3FE-200D-1F9BD-200D-27A1-FE0F",
    "1F468-1F3FE-200D-1F9BD-200D-27A1",
    "1F468-1F3FF-200D-1F9BD-200D-27A1-FE0F",
    "1F468-1F3FF-200D-1F9BD-200D-27A1",
    "1F469-200D-1F9BD",
    "1F469-1F3FB-200D-1F9BD",
    "1F469-1F3FC-200D-1F9BD",
    "1F469-1F3FD-200D-1F9BD",
    "1F469-1F3FE-200D-1F9BD",
    "1F469-1F3FF-200D-1F9BD",
    "1F469-200D-1F9BD-200D-27A1-FE0F",
    "1F469-200D-1F9BD-200D-27A1",
    "1F469-1F3FB-200D-1F9BD-200D-27A1-FE0F",
    "1F469-1F3FB-200D-1F9BD-200D-27A1",
    "1F469-1F3FC-200D-1F9BD-200D-27A1-FE0F",
    "1F469-1F3FC-200D-1F9BD-200D-27A1",
    "1F469-1F3FD-200D-1F9BD-200D-27A1-FE0F",
    "1F469-1F3FD-200D-1F9BD-200D-27A1",
    "1F469-1F3FE-200D-1F9BD-200D-27A1-FE0F",
    "1F469-1F3FE-200D-1F9BD-200D-27A1",
    "1F469-1F3FF-200D-1F9BD-200D-27A1-FE0F",
    "1F469-1F3FF-200D-1F9BD-200D-27A1",
    "1F3C3",
    "1F3C3-1F3FB",
    "1F3C3-1F3FC",
    "1F3C3-1F3FD",
    "1F3C3-1F3FE",
    "1F3C3-1F3FF",
    "1F3C3-200D-2642-FE0F",
    "1F3C3-200D-2642",
    "1F3C3-1F3FB-200D-2642-FE0F",
    "1F3C3-1F3FB-200D-2642",
    "1F3C3-1F3FC-200D-2642-FE0F",
    "1F3C3-1F3FC-200D-2642",
    "1F3C3-1F3FD-200D-2642-FE0F",
    "1F3C3-1F3FD-200D-2642",
    "1F3C3-1F3FE-200D-2642-FE0F",
    "1F3C3-1F3FE-200D-2642",
    "1F3C3-1F3FF-200D-2642-FE0F",
    "1F3C3-1F3FF-200D-2642",
    "1F3C3-200D-2640-FE0F",
    "1F3C3-200D-2640",
    "1F3C3-1F3FB-200D-2640-FE0F",
    "1F3C3-1F3FB-200D-2640",
    "1F3C3-1F3FC-200D-2640-FE0F",
    "1F3C3-1F3FC-200D-2640",
    "1F3C3-1F3FD-200D-2640-FE0F",
    "1F3C3-1F3FD-200D-2640",
    "1F3C3-1F3FE-200D-2640-FE0F",
    "1F3C3-1F3FE-200D-2640",
    "1F3C3-1F3FF-200D-2640-FE0F",
    "1F3C3-1F3FF-200D-2640",
    "1F3C3-200D-27A1-FE0F",
    "1F3C3-200D-27A1",
    "1F3C3-1F3FB-200D-27A1-FE0F",
    "1F3C3-1F3FB-200D-27A1",
    "1F3C3-1F3FC-200D-27A1-FE0F",
    "1F3C3-1F3FC-200D-27A1",
    "1F3C3-1F3FD-200D-27A1-FE0F",
    "1F3C3-1F3FD-200D-27A1",
    "1F3C3-1F3FE-200D-27A1-FE0F",
    "1F3C3-1F3FE-200D-27A1",
    "1F3C3-1F3FF-200D-27A1-FE0F",
    "1F3C3-1F3FF-200D-27A1",
    "1F3C3-200D-2640-FE0F-200D-27A1-FE0F",
    "1F3C3-200D-2640-200D-27A1-FE0F",
    "1F3C3-200D-2640-FE0F-200D-27A1",
    "1F3C3-200D-2640-200D-27A1",
    "1F3C3-1F3FB-200D-2640-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FB-200D-2640-200D-27A1-FE0F",
    "1F3C3-1F3FB-200D-2640-FE0F-200D-27A1",
    "1F3C3-1F3FB-200D-2640-200D-27A1",
    "1F3C3-1F3FC-200D-2640-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FC-200D-2640-200D-27A1-FE0F",
    "1F3C3-1F3FC-200D-2640-FE0F-200D-27A1",
    "1F3C3-1F3FC-200D-2640-200D-27A1",
    "1F3C3-1F3FD-200D-2640-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FD-200D-2640-200D-27A1-FE0F",
    "1F3C3-1F3FD-200D-2640-FE0F-200D-27A1",
    "1F3C3-1F3FD-200D-2640-200D-27A1",
    "1F3C3-1F3FE-200D-2640-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FE-200D-2640-200D-27A1-FE0F",
    "1F3C3-1F3FE-200D-2640-FE0F-200D-27A1",
    "1F3C3-1F3FE-200D-2640-200D-27A1",
    "1F3C3-1F3FF-200D-2640-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FF-200D-2640-200D-27A1-FE0F",
    "1F3C3-1F3FF-200D-2640-FE0F-200D-27A1",
    "1F3C3-1F3FF-200D-2640-200D-27A1",
    "1F3C3-200D-2642-FE0F-200D-27A1-FE0F",
    "1F3C3-200D-2642-200D-27A1-FE0F",
    "1F3C3-200D-2642-FE0F-200D-27A1",
    "1F3C3-200D-2642-200D-27A1",
    "1F3C3-1F3FB-200D-2642-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FB-200D-2642-200D-27A1-FE0F",
    "1F3C3-1F3FB-200D-2642-FE0F-200D-27A1",
    "1F3C3-1F3FB-200D-2642-200D-27A1",
    "1F3C3-1F3FC-200D-2642-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FC-200D-2642-200D-27A1-FE0F",
    "1F3C3-1F3FC-200D-2642-FE0F-200D-27A1",
    "1F3C3-1F3FC-200D-2642-200D-27A1",
    "1F3C3-1F3FD-200D-2642-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FD-200D-2642-200D-27A1-FE0F",
    "1F3C3-1F3FD-200D-2642-FE0F-200D-27A1",
    "1F3C3-1F3FD-200D-2642-200D-27A1",
    "1F3C3-1F3FE-200D-2642-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FE-200D-2642-200D-27A1-FE0F",
    "1F3C3-1F3FE-200D-2642-FE0F-200D-27A1",
    "1F3C3-1F3FE-200D-2642-200D-27A1",
    "1F3C3-1F3FF-200D-2642-FE0F-200D-27A1-FE0F",
    "1F3C3-1F3FF-200D-2642-200D-27A1-FE0F",
    "1F3C3-1F3FF-200D-2642-FE0F-200D-27A1",
    "1F3C3-1F3FF-200D-2642-200D-27A1",
    "1F483",
    "1F483-1F3FB",
    "1F483-1F3FC",
    "1F483-1F3FD",
    "1F483-1F3FE",
    "1F483-1F3FF",
    "1F57A",
    "1F57A-1F3FB",
    "1F57A-1F3FC",
    "1F57A-1F3FD",
    "1F57A-1F3FE",
    "1F57A-1F3FF",
    "1F574-FE0F",
    "1F574",
    "1F574-1F3FB",
    "1F574-1F3FC",
    "1F574-1F3FD",
    "1F574-1F3FE",
    "1F574-1F3FF",
    "1F46F",
    "1F46F-200D-2642-FE0F",
    "1F46F-200D-2642",
    "1F46F-200D-2640-FE0F",
    "1F46F-200D-2640",
    "1F9D6",
    "1F9D6-1F3FB",
    "1F9D6-1F3FC",
    "1F9D6-1F3FD",
    "1F9D6-1F3FE",
    "1F9D6-1F3FF",
    "1F9D6-200D-2642-FE0F",
    "1F9D6-200D-2642",
    "1F9D6-1F3FB-200D-2642-FE0F",
    "1F9D6-1F3FB-200D-2642",
    "1F9D6-1F3FC-200D-2642-FE0F",
    "1F9D6-1F3FC-200D-2642",
    "1F9D6-1F3FD-200D-2642-FE0F",
    "1F9D6-1F3FD-200D-2642",
    "1F9D6-1F3FE-200D-2642-FE0F",
    "1F9D6-1F3FE-200D-2642",
    "1F9D6-1F3FF-200D-2642-FE0F",
    "1F9D6-1F3FF-200D-2642",
    "1F9D6-200D-2640-FE0F",
    "1F9D6-200D-2640",
    "1F9D6-1F3FB-200D-2640-FE0F",
    "1F9D6-1F3FB-200D-2640",
    "1F9D6-1F3FC-200D-2640-FE0F",
    "1F9D6-1F3FC-200D-2640",
    "1F9D6-1F3FD-200D-2640-FE0F",
    "1F9D6-1F3FD-200D-2640",
    "1F9D6-1F3FE-200D-2640-FE0F",
    "1F9D6-1F3FE-200D-2640",
    "1F9D6-1F3FF-200D-2640-FE0F",
    "1F9D6-1F3FF-200D-2640",
    "1F9D7",
    "1F9D7-1F3FB",
    "1F9D7-1F3FC",
    "1F9D7-1F3FD",
    "1F9D7-1F3FE",
    "1F9D7-1F3FF",
    "1F9D7-200D-2642-FE0F",
    "1F9D7-200D-2642",
    "1F9D7-1F3FB-200D-2642-FE0F",
    "1F9D7-1F3FB-200D-2642",
    "1F9D7-1F3FC-200D-2642-FE0F",
    "1F9D7-1F3FC-200D-2642",
    "1F9D7-1F3FD-200D-2642-FE0F",
    "1F9D7-1F3FD-200D-2642",
    "1F9D7-1F3FE-200D-2642-FE0F",
    "1F9D7-1F3FE-200D-2642",
    "1F9D7-1F3FF-200D-2642-FE0F",
    "1F9D7-1F3FF-200D-2642",
    "1F9D7-200D-2640-FE0F",
    "1F9D7-200D-2640",
    "1F9D7-1F3FB-200D-2640-FE0F",
    "1F9D7-1F3FB-200D-2640",
    "1F9D7-1F3FC-200D-2640-FE0F",
    "1F9D7-1F3FC-200D-2640",
    "1F9D7-1F3FD-200D-2640-FE0F",
    "1F9D7-1F3FD-200D-2640",
    "1F9D7-1F3FE-200D-2640-FE0F",
    "1F9D7-1F3FE-200D-2640",
    "1F9D7-1F3FF-200D-2640-FE0F",
    "1F9D7-1F3FF-200D-2640",
    "1F93A",
    "1F3C7",
    "1F3C7-1F3FB",
    "1F3C7-1F3FC",
    "1F3C7-1F3FD",
    "1F3C7-1F3FE",
    "1F3C7-1F3FF",
    "26F7-FE0F",
    "26F7",
    "1F3C2",
    "1F3C2-1F3FB",
    "1F3C2-1F3FC",
    "1F3C2-1F3FD",
    "1F3C2-1F3FE",
    "1F3C2-1F3FF",
    "1F3CC-FE0F",
    "1F3CC",
    "1F3CC-1F3FB",
    "1F3CC-1F3FC",
    "1F3CC-1F3FD",
    "1F3CC-1F3FE",
    "1F3CC-1F3FF",
    "1F3CC-FE0F-200D-2642-FE0F",
    "1F3CC-200D-2642-FE0F",
    "1F3CC-FE0F-200D-2642",
    "1F3CC-200D-2642",
    "1F3CC-1F3FB-200D-2642-FE0F",
    "1F3CC-1F3FB-200D-2642",
    "1F3CC-1F3FC-200D-2642-FE0F",
    "1F3CC-1F3FC-200D-2642",
    "1F3CC-1F3FD-200D-2642-FE0F",
    "1F3CC-1F3FD-200D-2642",
    "1F3CC-1F3FE-200D-2642-FE0F",
    "1F3CC-1F3FE-200D-2642",
    "1F3CC-1F3FF-200D-2642-FE0F",
    "1F3CC-1F3FF-200D-2642",
    "1F3CC-FE0F-200D-2640-FE0F",
    "1F3CC-200D-2640-FE0F",
    "1F3CC-FE0F-200D-2640",
    "1F3CC-200D-2640",
    "1F3CC-1F3FB-200D-2640-FE0F",
    "1F3CC-1F3FB-200D-2640",
    "1F3CC-1F3FC-200D-2640-FE0F",
    "1F3CC-1F3FC-200D-2640",
    "1F3CC-1F3FD-200D-2640-FE0F",
    "1F3CC-1F3FD-200D-2640",
    "1F3CC-1F3FE-200D-2640-FE0F",
    "1F3CC-1F3FE-200D-2640",
    "1F3CC-1F3FF-200D-2640-FE0F",
    "1F3CC-1F3FF-200D-2640",
    "1F3C4",
    "1F3C4-1F3FB",
    "1F3C4-1F3FC",
    "1F3C4-1F3FD",
    "1F3C4-1F3FE",
    "1F3C4-1F3FF",
    "1F3C4-200D-2642-FE0F",
    "1F3C4-200D-2642",
    "1F3C4-1F3FB-200D-2642-FE0F",
    "1F3C4-1F3FB-200D-2642",
    "1F3C4-1F3FC-200D-2642-FE0F",
    "1F3C4-1F3FC-200D-2642",
    "1F3C4-1F3FD-200D-2642-FE0F",
    "1F3C4-1F3FD-200D-2642",
    "1F3C4-1F3FE-200D-2642-FE0F",
    "1F3C4-1F3FE-200D-2642",
    "1F3C4-1F3FF-200D-2642-FE0F",
    "1F3C4-1F3FF-200D-2642",
    "1F3C4-200D-2640-FE0F",
    "1F3C4-200D-2640",
    "1F3C4-1F3FB-200D-2640-FE0F",
    "1F3C4-1F3FB-200D-2640",
    "1F3C4-1F3FC-200D-2640-FE0F",
    "1F3C4-1F3FC-200D-2640",
    "1F3C4-1F3FD-200D-2640-FE0F",
    "1F3C4-1F3FD-200D-2640",
    "1F3C4-1F3FE-200D-2640-FE0F",
    "1F3C4-1F3FE-200D-2640",
    "1F3C4-1F3FF-200D-2640-FE0F",
    "1F3C4-1F3FF-200D-2640",
    "1F6A3",
    "1F6A3-1F3FB",
    "1F6A3-1F3FC",
    "1F6A3-1F3FD",
    "1F6A3-1F3FE",
    "1F6A3-1F3FF",
    "1F6A3-200D-2642-FE0F",
    "1F6A3-200D-2642",
    "1F6A3-1F3FB-200D-2642-FE0F",
    "1F6A3-1F3FB-200D-2642",
    "1F6A3-1F3FC-200D-2642-FE0F",
    "1F6A3-1F3FC-200D-2642",
    "1F6A3-1F3FD-200D-2642-FE0F",
    "1F6A3-1F3FD-200D-2642",
    "1F6A3-1F3FE-200D-2642-FE0F",
    "1F6A3-1F3FE-200D-2642",
    "1F6A3-1F3FF-200D-2642-FE0F",
    "1F6A3-1F3FF-200D-2642",
    "1F6A3-200D-2640-FE0F",
    "1F6A3-200D-2640",
    "1F6A3-1F3FB-200D-2640-FE0F",
    "1F6A3-1F3FB-200D-2640",
    "1F6A3-1F3FC-200D-2640-FE0F",
    "1F6A3-1F3FC-200D-2640",
    "1F6A3-1F3FD-200D-2640-FE0F",
    "1F6A3-1F3FD-200D-2640",
    "1F6A3-1F3FE-200D-2640-FE0F",
    "1F6A3-1F3FE-200D-2640",
    "1F6A3-1F3FF-200D-2640-FE0F",
    "1F6A3-1F3FF-200D-2640",
    "1F3CA",
    "1F3CA-1F3FB",
    "1F3CA-1F3FC",
    "1F3CA-1F3FD",
    "1F3CA-1F3FE",
    "1F3CA-1F3FF",
    "1F3CA-200D-2642-FE0F",
    "1F3CA-200D-2642",
    "1F3CA-1F3FB-200D-2642-FE0F",
    "1F3CA-1F3FB-200D-2642",
    "1F3CA-1F3FC-200D-2642-FE0F",
    "1F3CA-1F3FC-200D-2642",
    "1F3CA-1F3FD-200D-2642-FE0F",
    "1F3CA-1F3FD-200D-2642",
    "1F3CA-1F3FE-200D-2642-FE0F",
    "1F3CA-1F3FE-200D-2642",
    "1F3CA-1F3FF-200D-2642-FE0F",
    "1F3CA-1F3FF-200D-2642",
    "1F3CA-200D-2640-FE0F",
    "1F3CA-200D-2640",
    "1F3CA-1F3FB-200D-2640-FE0F",
    "1F3CA-1F3FB-200D-2640",
    "1F3CA-1F3FC-200D-2640-FE0F",
    "1F3CA-1F3FC-200D-2640",
    "1F3CA-1F3FD-200D-2640-FE0F",
    "1F3CA-1F3FD-200D-2640",
    "1F3CA-1F3FE-200D-2640-FE0F",
    "1F3CA-1F3FE-200D-2640",
    "1F3CA-1F3FF-200D-2640-FE0F",
    "1F3CA-1F3FF-200D-2640",
    "26F9-FE0F",
    "26F9",
    "26F9-1F3FB",
    "26F9-1F3FC",
    "26F9-1F3FD",
    "26F9-1F3FE",
    "26F9-1F3FF",
    "26F9-FE0F-200D-2642-FE0F",
    "26F9-200D-2642-FE0F",
    "26F9-FE0F-200D-2642",
    "26F9-200D-2642",
    "26F9-1F3FB-200D-2642-FE0F",
    "26F9-1F3FB-200D-2642",
    "26F9-1F3FC-200D-2642-FE0F",
    "26F9-1F3FC-200D-2642",
    "26F9-1F3FD-200D-2642-FE0F",
    "26F9-1F3FD-200D-2642",
    "26F9-1F3FE-200D-2642-FE0F",
    "26F9-1F3FE-200D-2642",
    "26F9-1F3FF-200D-2642-FE0F",
    "26F9-1F3FF-200D-2642",
    "26F9-FE0F-200D-2640-FE0F",
    "26F9-200D-2640-FE0F",
    "26F9-FE0F-200D-2640",
    "26F9-200D-2640",
    "26F9-1F3FB-200D-2640-FE0F",
    "26F9-1F3FB-200D-2640",
    "26F9-1F3FC-200D-2640-FE0F",
    "26F9-1F3FC-200D-2640",
    "26F9-1F3FD-200D-2640-FE0F",
    "26F9-1F3FD-200D-2640",
    "26F9-1F3FE-200D-2640-FE0F",
    "26F9-1F3FE-200D-2640",
    "26F9-1F3FF-200D-2640-FE0F",
    "26F9-1F3FF-200D-2640",
    "1F3CB-FE0F",
    "1F3CB",
    "1F3CB-1F3FB",
    "1F3CB-1F3FC",
    "1F3CB-1F3FD",
    "1F3CB-1F3FE",
    "1F3CB-1F3FF",
    "1F3CB-FE0F-200D-2642-FE0F",
    "1F3CB-200D-2642-FE0F",
    "1F3CB-FE0F-200D-2642",
    "1F3CB-200D-2642",
    "1F3CB-1F3FB-200D-2642-FE0F",
    "1F3CB-1F3FB-200D-2642",
    "1F3CB-1F3FC-200D-2642-FE0F",
    "1F3CB-1F3FC-200D-2642",
    "1F3CB-1F3FD-200D-2642-FE0F",
    "1F3CB-1F3FD-200D-2642",
    "1F3CB-1F3FE-200D-2642-FE0F",
    "1F3CB-1F3FE-200D-2642",
    "1F3CB-1F3FF-200D-2642-FE0F",
    "1F3CB-1F3FF-200D-2642",
    "1F3CB-FE0F-200D-2640-FE0F",
    "1F3CB-200D-2640-FE0F",
    "1F3CB-FE0F-200D-2640",
    "1F3CB-200D-2640",
    "1F3CB-1F3FB-200D-2640-FE0F",
    "1F3CB-1F3FB-200D-2640",
    "1F3CB-1F3FC-200D-2640-FE0F",
    "1F3CB-1F3FC-200D-2640",
    "1F3CB-1F3FD-200D-2640-FE0F",
    "1F3CB-1F3FD-200D-2640",
    "1F3CB-1F3FE-200D-2640-FE0F",
    "1F3CB-1F3FE-200D-2640",
    "1F3CB-1F3FF-200D-2640-FE0F",
    "1F3CB-1F3FF-200D-2640",
    "1F6B4",
    "1F6B4-1F3FB",
    "1F6B4-1F3FC",
    "1F6B4-1F3FD",
    "1F6B4-1F3FE",
    "1F6B4-1F3FF",
    "1F6B4-200D-2642-FE0F",
    "1F6B4-200D-2642",
    "1F6B4-1F3FB-200D-2642-FE0F",
    "1F6B4-1F3FB-200D-2642",
    "1F6B4-1F3FC-200D-2642-FE0F",
    "1F6B4-1F3FC-200D-2642",
    "1F6B4-1F3FD-200D-2642-FE0F",
    "1F6B4-1F3FD-200D-2642",
    "1F6B4-1F3FE-200D-2642-FE0F",
    "1F6B4-1F3FE-200D-2642",
    "1F6B4-1F3FF-200D-2642-FE0F",
    "1F6B4-1F3FF-200D-2642",
    "1F6B4-200D-2640-FE0F",
    "1F6B4-200D-2640",
    "1F6B4-1F3FB-200D-2640-FE0F",
    "1F6B4-1F3FB-200D-2640",
    "1F6B4-1F3FC-200D-2640-FE0F",
    "1F6B4-1F3FC-200D-2640",
    "1F6B4-1F3FD-200D-2640-FE0F",
    "1F6B4-1F3FD-200D-2640",
    "1F6B4-1F3FE-200D-2640-FE0F",
    "1F6B4-1F3FE-200D-2640",
    "1F6B4-1F3FF-200D-2640-FE0F",
    "1F6B4-1F3FF-200D-2640",
    "1F6B5",
    "1F6B5-1F3FB",
    "1F6B5-1F3FC",
    "1F6B5-1F3FD",
    "1F6B5-1F3FE",
    "1F6B5-1F3FF",
    "1F6B5-200D-2642-FE0F",
    "1F6B5-200D-2642",
    "1F6B5-1F3FB-200D-2642-FE0F",
    "1F6B5-1F3FB-200D-2642",
    "1F6B5-1F3FC-200D-2642-FE0F",
    "1F6B5-1F3FC-200D-2642",
    "1F6B5-1F3FD-200D-2642-FE0F",
    "1F6B5-1F3FD-200D-2642",
    "1F6B5-1F3FE-200D-2642-FE0F",
    "1F6B5-1F3FE-200D-2642",
    "1F6B5-1F3FF-200D-2642-FE0F",
    "1F6B5-1F3FF-200D-2642",
    "1F6B5-200D-2640-FE0F",
    "1F6B5-200D-2640",
    "1F6B5-1F3FB-200D-2640-FE0F",
    "1F6B5-1F3FB-200D-2640",
    "1F6B5-1F3FC-200D-2640-FE0F",
    "1F6B5-1F3FC-200D-2640",
    "1F6B5-1F3FD-200D-2640-FE0F",
    "1F6B5-1F3FD-200D-2640",
    "1F6B5-1F3FE-200D-2640-FE0F",
    "1F6B5-1F3FE-200D-2640",
    "1F6B5-1F3FF-200D-2640-FE0F",
    "1F6B5-1F3FF-200D-2640",
    "1F938",
    "1F938-1F3FB",
    "1F938-1F3FC",
    "1F938-1F3FD",
    "1F938-1F3FE",
    "1F938-1F3FF",
    "1F938-200D-2642-FE0F",
    "1F938-200D-2642",
    "1F938-1F3FB-200D-2642-FE0F",
    "1F938-1F3FB-200D-2642",
    "1F938-1F3FC-200D-2642-FE0F",
    "1F938-1F3FC-200D-2642",
    "1F938-1F3FD-200D-2642-FE0F",
    "1F938-1F3FD-200D-2642",
    "1F938-1F3FE-200D-2642-FE0F",
    "1F938-1F3FE-200D-2642",
    "1F938-1F3FF-200D-2642-FE0F",
    "1F938-1F3FF-200D-2642",
    "1F938-200D-2640-FE0F",
    "1F938-200D-2640",
    "1F938-1F3FB-200D-2640-FE0F",
    "1F938-1F3FB-200D-2640",
    "1F938-1F3FC-200D-2640-FE0F",
    "1F938-1F3FC-200D-2640",
    "1F938-1F3FD-200D-2640-FE0F",
    "1F938-1F3FD-200D-2640",
    "1F938-1F3FE-200D-2640-FE0F",
    "1F938-1F3FE-200D-2640",
    "1F938-1F3FF-200D-2640-FE0F",
    "1F938-1F3FF-200D-2640",
    "1F93C",
    "1F93C-200D-2642-FE0F",
    "1F93C-200D-2642",
    "1F93C-200D-2640-FE0F",
    "1F93C-200D-2640",
    "1F93D",
    "1F93D-1F3FB",
    "1F93D-1F3FC",
    "1F93D-1F3FD",
    "1F93D-1F3FE",
    "1F93D-1F3FF",
    "1F93D-200D-2642-FE0F",
    "1F93D-200D-2642",
    "1F93D-1F3FB-200D-2642-FE0F",
    "1F93D-1F3FB-200D-2642",
    "1F93D-1F3FC-200D-2642-FE0F",
    "1F93D-1F3FC-200D-2642",
    "1F93D-1F3FD-200D-2642-FE0F",
    "1F93D-1F3FD-200D-2642",
    "1F93D-1F3FE-200D-2642-FE0F",
    "1F93D-1F3FE-200D-2642",
    "1F93D-1F3FF-200D-2642-FE0F",
    "1F93D-1F3FF-200D-2642",
    "1F93D-200D-2640-FE0F",
    "1F93D-200D-2640",
    "1F93D-1F3FB-200D-2640-FE0F",
    "1F93D-1F3FB-200D-2640",
    "1F93D-1F3FC-200D-2640-FE0F",
    "1F93D-1F3FC-200D-2640",
    "1F93D-1F3FD-200D-2640-FE0F",
    "1F93D-1F3FD-200D-2640",
    "1F93D-1F3FE-200D-2640-FE0F",
    "1F93D-1F3FE-200D-2640",
    "1F93D-1F3FF-200D-2640-FE0F",
    "1F93D-1F3FF-200D-2640",
    "1F93E",
    "1F93E-1F3FB",
    "1F93E-1F3FC",
    "1F93E-1F3FD",
    "1F93E-1F3FE",
    "1F93E-1F3FF",
    "1F93E-200D-2642-FE0F",
    "1F93E-200D-2642",
    "1F93E-1F3FB-200D-2642-FE0F",
    "1F93E-1F3FB-200D-2642",
    "1F93E-1F3FC-200D-2642-FE0F",
    "1F93E-1F3FC-200D-2642",
    "1F93E-1F3FD-200D-2642-FE0F",
    "1F93E-1F3FD-200D-2642",
    "1F93E-1F3FE-200D-2642-FE0F",
    "1F93E-1F3FE-200D-2642",
    "1F93E-1F3FF-200D-2642-FE0F",
    "1F93E-1F3FF-200D-2642",
    "1F93E-200D-2640-FE0F",
    "1F93E-200D-2640",
    "1F93E-1F3FB-200D-2640-FE0F",
    "1F93E-1F3FB-200D-2640",
    "1F93E-1F3FC-200D-2640-FE0F",
    "1F93E-1F3FC-200D-2640",
    "1F93E-1F3FD-200D-2640-FE0F",
    "1F93E-1F3FD-200D-2640",
    "1F93E-1F3FE-200D-2640-FE0F",
    "1F93E-1F3FE-200D-2640",
    "1F93E-1F3FF-200D-2640-FE0F",
    "1F93E-1F3FF-200D-2640",
    "1F939",
    "1F939-1F3FB",
    "1F939-1F3FC",
    "1F939-1F3FD",
    "1F939-1F3FE",
    "1F939-1F3FF",
    "1F939-200D-2642-FE0F",
    "1F939-200D-2642",
    "1F939-1F3FB-200D-2642-FE0F",
    "1F939-1F3FB-200D-2642",
    "1F939-1F3FC-200D-2642-FE0F",
    "1F939-1F3FC-200D-2642",
    "1F939-1F3FD-200D-2642-FE0F",
    "1F939-1F3FD-200D-2642",
    "1F939-1F3FE-200D-2642-FE0F",
    "1F939-1F3FE-200D-2642",
    "1F939-1F3FF-200D-2642-FE0F",
    "1F939-1F3FF-200D-2642",
    "1F939-200D-2640-FE0F",
    "1F939-200D-2640",
    "1F939-1F3FB-200D-2640-FE0F",
    "1F939-1F3FB-200D-2640",
    "1F939-1F3FC-200D-2640-FE0F",
    "1F939-1F3FC-200D-2640",
    "1F939-1F3FD-200D-2640-FE0F",
    "1F939-1F3FD-200D-2640",
    "1F939-1F3FE-200D-2640-FE0F",
    "1F939-1F3FE-200D-2640",
    "1F939-1F3FF-200D-2640-FE0F",
    "1F939-1F3FF-200D-2640",
    "1F9D8",
    "1F9D8-1F3FB",
    "1F9D8-1F3FC",
    "1F9D8-1F3FD",
    "1F9D8-1F3FE",
    "1F9D8-1F3FF",
    "1F9D8-200D-2642-FE0F",
    "1F9D8-200D-2642",
    "1F9D8-1F3FB-200D-2642-FE0F",
    "1F9D8-1F3FB-200D-2642",
    "1F9D8-1F3FC-200D-2642-FE0F",
    "1F9D8-1F3FC-200D-2642",
    "1F9D8-1F3FD-200D-2642-FE0F",
    "1F9D8-1F3FD-200D-2642",
    "1F9D8-1F3FE-200D-2642-FE0F",
    "1F9D8-1F3FE-200D-2642",
    "1F9D8-1F3FF-200D-2642-FE0F",
    "1F9D8-1F3FF-200D-2642",
    "1F9D8-200D-2640-FE0F",
    "1F9D8-200D-2640",
    "1F9D8-1F3FB-200D-2640-FE0F",
    "1F9D8-1F3FB-200D-2640",
    "1F9D8-1F3FC-200D-2640-FE0F",
    "1F9D8-1F3FC-200D-2640",
    "1F9D8-1F3FD-200D-2640-FE0F",
    "1F9D8-1F3FD-200D-2640",
    "1F9D8-1F3FE-200D-2640-FE0F",
    "1F9D8-1F3FE-200D-2640",
    "1F9D8-1F3FF-200D-2640-FE0F",
    "1F9D8-1F3FF-200D-2640",
    "1F6C0",
    "1F6C0-1F3FB",
    "1F6C0-1F3FC",
    "1F6C0-1F3FD",
    "1F6C0-1F3FE",
    "1F6C0-1F3FF",
    "1F6CC",
    "1F6CC-1F3FB",
    "1F6CC-1F3FC",
    "1F6CC-1F3FD",
    "1F6CC-1F3FE",
    "1F6CC-1F3FF",
    "1F9D1-200D-1F91D-200D-1F9D1",
    "1F9D1-1F3FB-200D-1F91D-200D-1F9D1-1F3FB",
    "1F9D1-1F3FB-200D-1F91D-200D-1F9D1-1F3FC",
    "1F9D1-1F3FB-200D-1F91D-200D-1F9D1-1F3FD",
    "1F9D1-1F3FB-200D-1F91D-200D-1F9D1-1F3FE",
    "1F9D1-1F3FB-200D-1F91D-200D-1F9D1-1F3FF",
    "1F9D1-1F3FC-200D-1F91D-200D-1F9D1-1F3FB",
    "1F9D1-1F3FC-200D-1F91D-200D-1F9D1-1F3FC",
    "1F9D1-1F3FC-200D-1F91D-200D-1F9D1-1F3FD",
    "1F9D1-1F3FC-200D-1F91D-200D-1F9D1-1F3FE",
    "1F9D1-1F3FC-200D-1F91D-200D-1F9D1-1F3FF",
    "1F9D1-1F3FD-200D-1F91D-200D-1F9D1-1F3FB",
    "1F9D1-1F3FD-200D-1F91D-200D-1F9D1-1F3FC",
    "1F9D1-1F3FD-200D-1F91D-200D-1F9D1-1F3FD",
    "1F9D1-1F3FD-200D-1F91D-200D-1F9D1-1F3FE",
    "1F9D1-1F3FD-200D-1F91D-200D-1F9D1-1F3FF",
    "1F9D1-1F3FE-200D-1F91D-200D-1F9D1-1F3FB",
    "1F9D1-1F3FE-200D-1F91D-200D-1F9D1-1F3FC",
    "1F9D1-1F3FE-200D-1F91D-200D-1F9D1-1F3FD",
    "1F9D1-1F3FE-200D-1F91D-200D-1F9D1-1F3FE",
    "1F9D1-1F3FE-200D-1F91D-200D-1F9D1-1F3FF",
    "1F9D1-1F3FF-200D-1F91D-200D-1F9D1-1F3FB",
    "1F9D1-1F3FF-200D-1F91D-200D-1F9D1-1F3FC",
    "1F9D1-1F3FF-200D-1F91D-200D-1F9D1-1F3FD",
    "1F9D1-1F3FF-200D-1F91D-200D-1F9D1-1F3FE",
    "1F9D1-1F3FF-200D-1F91D-200D-1F9D1-1F3FF",
    "1F46D",
    "1F46D-1F3FB",
    "1F469-1F3FB-200D-1F91D-200D-1F469-1F3FC",
    "1F469-1F3FB-200D-1F91D-200D-1F469-1F3FD",
    "1F469-1F3FB-200D-1F91D-200D-1F469-1F3FE",
    "1F469-1F3FB-200D-1F91D-200D-1F469-1F3FF",
    "1F469-1F3FC-200D-1F91D-200D-1F469-1F3FB",
    "1F46D-1F3FC",
    "1F469-1F3FC-200D-1F91D-200D-1F469-1F3FD",
    "1F469-1F3FC-200D-1F91D-200D-1F469-1F3FE",
    "1F469-1F3FC-200D-1F91D-200D-1F469-1F3FF",
    "1F469-1F3FD-200D-1F91D-200D-1F469-1F3FB",
    "1F469-1F3FD-200D-1F91D-200D-1F469-1F3FC",
    "1F46D-1F3FD",
    "1F469-1F3FD-200D-1F91D-200D-1F469-1F3FE",
    "1F469-1F3FD-200D-1F91D-200D-1F469-1F3FF",
    "1F469-1F3FE-200D-1F91D-200D-1F469-1F3FB",
    "1F469-1F3FE-200D-1F91D-200D-1F469-1F3FC",
    "1F469-1F3FE-200D-1F91D-200D-1F469-1F3FD",
    "1F46D-1F3FE",
    "1F469-1F3FE-200D-1F91D-200D-1F469-1F3FF",
    "1F469-1F3FF-200D-1F91D-200D-1F469-1F3FB",
    "1F469-1F3FF-200D-1F91D-200D-1F469-1F3FC",
    "1F469-1F3FF-200D-1F91D-200D-1F469-1F3FD",
    "1F469-1F3FF-200D-1F91D-200D-1F469-1F3FE",
    "1F46D-1F3FF",
    "1F46B",
    "1F46B-1F3FB",
    "1F469-1F3FB-200D-1F91D-200D-1F468-1F3FC",
    "1F469-1F3FB-200D-1F91D-200D-1F468-1F3FD",
    "1F469-1F3FB-200D-1F91D-200D-1F468-1F3FE",
    "1F469-1F3FB-200D-1F91D-200D-1F468-1F3FF",
    "1F469-1F3FC-200D-1F91D-200D-1F468-1F3FB",
    "1F46B-1F3FC",
    "1F469-1F3FC-200D-1F91D-200D-1F468-1F3FD",
    "1F469-1F3FC-200D-1F91D-200D-1F468-1F3FE",
    "1F469-1F3FC-200D-1F91D-200D-1F468-1F3FF",
    "1F469-1F3FD-200D-1F91D-200D-1F468-1F3FB",
    "1F469-1F3FD-200D-1F91D-200D-1F468-1F3FC",
    "1F46B-1F3FD",
    "1F469-1F3FD-200D-1F91D-200D-1F468-1F3FE",
    "1F469-1F3FD-200D-1F91D-200D-1F468-1F3FF",
    "1F469-1F3FE-200D-1F91D-200D-1F468-1F3FB",
    "1F469-1F3FE-200D-1F91D-200D-1F468-1F3FC",
    "1F469-1F3FE-200D-1F91D-200D-1F468-1F3FD",
    "1F46B-1F3FE",
    "1F469-1F3FE-200D-1F91D-200D-1F468-1F3FF",
    "1F469-1F3FF-200D-1F91D-200D-1F468-1F3FB",
    "1F469-1F3FF-200D-1F91D-200D-1F468-1F3FC",
    "1F469-1F3FF-200D-1F91D-200D-1F468-1F3FD",
    "1F469-1F3FF-200D-1F91D-200D-1F468-1F3FE",
    "1F46B-1F3FF",
    "1F46C",
    "1F46C-1F3FB",
    "1F468-1F3FB-200D-1F91D-200D-1F468-1F3FC",
    "1F468-1F3FB-200D-1F91D-200D-1F468-1F3FD",
    "1F468-1F3FB-200D-1F91D-200D-1F468-1F3FE",
    "1F468-1F3FB-200D-1F91D-200D-1F468-1F3FF",
    "1F468-1F3FC-200D-1F91D-200D-1F468-1F3FB",
    "1F46C-1F3FC",
    "1F468-1F3FC-200D-1F91D-200D-1F468-1F3FD",
    "1F468-1F3FC-200D-1F91D-200D-1F468-1F3FE",
    "1F468-1F3FC-200D-1F91D-200D-1F468-1F3FF",
    "1F468-1F3FD-200D-1F91D-200D-1F468-1F3FB",
    "1F468-1F3FD-200D-1F91D-200D-1F468-1F3FC",
    "1F46C-1F3FD",
    "1F468-1F3FD-200D-1F91D-200D-1F468-1F3FE",
    "1F468-1F3FD-200D-1F91D-200D-1F468-1F3FF",
    "1F468-1F3FE-200D-1F91D-200D-1F468-1F3FB",
    "1F468-1F3FE-200D-1F91D-200D-1F468-1F3FC",
    "1F468-1F3FE-200D-1F91D-200D-1F468-1F3FD",
    "1F46C-1F3FE",
    "1F468-1F3FE-200D-1F91D-200D-1F468-1F3FF",
    "1F468-1F3FF-200D-1F91D-200D-1F468-1F3FB",
    "1F468-1F3FF-200D-1F91D-200D-1F468-1F3FC",
    "1F468-1F3FF-200D-1F91D-200D-1F468-1F3FD",
    "1F468-1F3FF-200D-1F91D-200D-1F468-1F3FE",
    "1F46C-1F3FF",
    "1F48F",
    "1F48F-1F3FB",
    "1F48F-1F3FC",
    "1F48F-1F3FD",
    "1F48F-1F3FE",
    "1F48F-1F3FF",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FB-200D-2764-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FB-200D-2764-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FE",
    "1F9D1-1F3FB-200D-2764-200D-1F48B-200D-1F9D1-1F3FE",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FB-200D-2764-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FC-200D-2764-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FC-200D-2764-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FE",
    "1F9D1-1F3FC-200D-2764-200D-1F48B-200D-1F9D1-1F3FE",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FC-200D-2764-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FD-200D-2764-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FD-200D-2764-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FE",
    "1F9D1-1F3FD-200D-2764-200D-1F48B-200D-1F9D1-1F3FE",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FD-200D-2764-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FE-200D-2764-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FE-200D-2764-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FE-200D-2764-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FE-200D-2764-200D-1F48B-200D-1F9D1-1F3FF",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FF-200D-2764-200D-1F48B-200D-1F9D1-1F3FB",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FF-200D-2764-200D-1F48B-200D-1F9D1-1F3FC",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FF-200D-2764-200D-1F48B-200D-1F9D1-1F3FD",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F9D1-1F3FE",
    "1F9D1-1F3FF-200D-2764-200D-1F48B-200D-1F9D1-1F3FE",
    "1F469-200D-2764-FE0F-200D-1F48B-200D-1F468",
    "1F469-200D-2764-200D-1F48B-200D-1F468",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F468-200D-2764-FE0F-200D-1F48B-200D-1F468",
    "1F468-200D-2764-200D-1F48B-200D-1F468",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FB-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FC-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FD-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FE-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FB",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FC",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FD",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FE",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F468-1F3FF",
    "1F468-1F3FF-200D-2764-200D-1F48B-200D-1F468-1F3FF",
    "1F469-200D-2764-FE0F-200D-1F48B-200D-1F469",
    "1F469-200D-2764-200D-1F48B-200D-1F469",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FB-200D-2764-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FC-200D-2764-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FD-200D-2764-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FE-200D-2764-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F469-1F3FB",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F469-1F3FC",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F469-1F3FD",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F469-1F3FE",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F48B-200D-1F469-1F3FF",
    "1F469-1F3FF-200D-2764-200D-1F48B-200D-1F469-1F3FF",
    "1F491",
    "1F491-1F3FB",
    "1F491-1F3FC",
    "1F491-1F3FD",
    "1F491-1F3FE",
    "1F491-1F3FF",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F9D1-1F3FC",
    "1F9D1-1F3FB-200D-2764-200D-1F9D1-1F3FC",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F9D1-1F3FD",
    "1F9D1-1F3FB-200D-2764-200D-1F9D1-1F3FD",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F9D1-1F3FE",
    "1F9D1-1F3FB-200D-2764-200D-1F9D1-1F3FE",
    "1F9D1-1F3FB-200D-2764-FE0F-200D-1F9D1-1F3FF",
    "1F9D1-1F3FB-200D-2764-200D-1F9D1-1F3FF",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F9D1-1F3FB",
    "1F9D1-1F3FC-200D-2764-200D-1F9D1-1F3FB",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F9D1-1F3FD",
    "1F9D1-1F3FC-200D-2764-200D-1F9D1-1F3FD",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F9D1-1F3FE",
    "1F9D1-1F3FC-200D-2764-200D-1F9D1-1F3FE",
    "1F9D1-1F3FC-200D-2764-FE0F-200D-1F9D1-1F3FF",
    "1F9D1-1F3FC-200D-2764-200D-1F9D1-1F3FF",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F9D1-1F3FB",
    "1F9D1-1F3FD-200D-2764-200D-1F9D1-1F3FB",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F9D1-1F3FC",
    "1F9D1-1F3FD-200D-2764-200D-1F9D1-1F3FC",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F9D1-1F3FE",
    "1F9D1-1F3FD-200D-2764-200D-1F9D1-1F3FE",
    "1F9D1-1F3FD-200D-2764-FE0F-200D-1F9D1-1F3FF",
    "1F9D1-1F3FD-200D-2764-200D-1F9D1-1F3FF",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F9D1-1F3FB",
    "1F9D1-1F3FE-200D-2764-200D-1F9D1-1F3FB",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F9D1-1F3FC",
    "1F9D1-1F3FE-200D-2764-200D-1F9D1-1F3FC",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F9D1-1F3FD",
    "1F9D1-1F3FE-200D-2764-200D-1F9D1-1F3FD",
    "1F9D1-1F3FE-200D-2764-FE0F-200D-1F9D1-1F3FF",
    "1F9D1-1F3FE-200D-2764-200D-1F9D1-1F3FF",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F9D1-1F3FB",
    "1F9D1-1F3FF-200D-2764-200D-1F9D1-1F3FB",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F9D1-1F3FC",
    "1F9D1-1F3FF-200D-2764-200D-1F9D1-1F3FC",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F9D1-1F3FD",
    "1F9D1-1F3FF-200D-2764-200D-1F9D1-1F3FD",
    "1F9D1-1F3FF-200D-2764-FE0F-200D-1F9D1-1F3FE",
    "1F9D1-1F3FF-200D-2764-200D-1F9D1-1F3FE",
    "1F469-200D-2764-FE0F-200D-1F468",
    "1F469-200D-2764-200D-1F468",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F469-1F3FB-200D-2764-200D-1F468-1F3FB",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F469-1F3FB-200D-2764-200D-1F468-1F3FC",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F469-1F3FB-200D-2764-200D-1F468-1F3FD",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F469-1F3FB-200D-2764-200D-1F468-1F3FE",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F469-1F3FB-200D-2764-200D-1F468-1F3FF",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F469-1F3FC-200D-2764-200D-1F468-1F3FB",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F469-1F3FC-200D-2764-200D-1F468-1F3FC",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F469-1F3FC-200D-2764-200D-1F468-1F3FD",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F469-1F3FC-200D-2764-200D-1F468-1F3FE",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F469-1F3FC-200D-2764-200D-1F468-1F3FF",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F469-1F3FD-200D-2764-200D-1F468-1F3FB",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F469-1F3FD-200D-2764-200D-1F468-1F3FC",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F469-1F3FD-200D-2764-200D-1F468-1F3FD",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F469-1F3FD-200D-2764-200D-1F468-1F3FE",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F469-1F3FD-200D-2764-200D-1F468-1F3FF",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F469-1F3FE-200D-2764-200D-1F468-1F3FB",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F469-1F3FE-200D-2764-200D-1F468-1F3FC",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F469-1F3FE-200D-2764-200D-1F468-1F3FD",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F469-1F3FE-200D-2764-200D-1F468-1F3FE",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F469-1F3FE-200D-2764-200D-1F468-1F3FF",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F469-1F3FF-200D-2764-200D-1F468-1F3FB",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F469-1F3FF-200D-2764-200D-1F468-1F3FC",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F469-1F3FF-200D-2764-200D-1F468-1F3FD",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F469-1F3FF-200D-2764-200D-1F468-1F3FE",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F469-1F3FF-200D-2764-200D-1F468-1F3FF",
    "1F468-200D-2764-FE0F-200D-1F468",
    "1F468-200D-2764-200D-1F468",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F468-1F3FB-200D-2764-200D-1F468-1F3FB",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F468-1F3FB-200D-2764-200D-1F468-1F3FC",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F468-1F3FB-200D-2764-200D-1F468-1F3FD",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F468-1F3FB-200D-2764-200D-1F468-1F3FE",
    "1F468-1F3FB-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F468-1F3FB-200D-2764-200D-1F468-1F3FF",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F468-1F3FC-200D-2764-200D-1F468-1F3FB",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F468-1F3FC-200D-2764-200D-1F468-1F3FC",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F468-1F3FC-200D-2764-200D-1F468-1F3FD",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F468-1F3FC-200D-2764-200D-1F468-1F3FE",
    "1F468-1F3FC-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F468-1F3FC-200D-2764-200D-1F468-1F3FF",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F468-1F3FD-200D-2764-200D-1F468-1F3FB",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F468-1F3FD-200D-2764-200D-1F468-1F3FC",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F468-1F3FD-200D-2764-200D-1F468-1F3FD",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F468-1F3FD-200D-2764-200D-1F468-1F3FE",
    "1F468-1F3FD-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F468-1F3FD-200D-2764-200D-1F468-1F3FF",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F468-1F3FE-200D-2764-200D-1F468-1F3FB",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F468-1F3FE-200D-2764-200D-1F468-1F3FC",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F468-1F3FE-200D-2764-200D-1F468-1F3FD",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F468-1F3FE-200D-2764-200D-1F468-1F3FE",
    "1F468-1F3FE-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F468-1F3FE-200D-2764-200D-1F468-1F3FF",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F468-1F3FB",
    "1F468-1F3FF-200D-2764-200D-1F468-1F3FB",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F468-1F3FC",
    "1F468-1F3FF-200D-2764-200D-1F468-1F3FC",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F468-1F3FD",
    "1F468-1F3FF-200D-2764-200D-1F468-1F3FD",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F468-1F3FE",
    "1F468-1F3FF-200D-2764-200D-1F468-1F3FE",
    "1F468-1F3FF-200D-2764-FE0F-200D-1F468-1F3FF",
    "1F468-1F3FF-200D-2764-200D-1F468-1F3FF",
    "1F469-200D-2764-FE0F-200D-1F469",
    "1F469-200D-2764-200D-1F469",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F469-1F3FB",
    "1F469-1F3FB-200D-2764-200D-1F469-1F3FB",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F469-1F3FC",
    "1F469-1F3FB-200D-2764-200D-1F469-1F3FC",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F469-1F3FD",
    "1F469-1F3FB-200D-2764-200D-1F469-1F3FD",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F469-1F3FE",
    "1F469-1F3FB-200D-2764-200D-1F469-1F3FE",
    "1F469-1F3FB-200D-2764-FE0F-200D-1F469-1F3FF",
    "1F469-1F3FB-200D-2764-200D-1F469-1F3FF",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F469-1F3FB",
    "1F469-1F3FC-200D-2764-200D-1F469-1F3FB",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F469-1F3FC",
    "1F469-1F3FC-200D-2764-200D-1F469-1F3FC",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F469-1F3FD",
    "1F469-1F3FC-200D-2764-200D-1F469-1F3FD",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F469-1F3FE",
    "1F469-1F3FC-200D-2764-200D-1F469-1F3FE",
    "1F469-1F3FC-200D-2764-FE0F-200D-1F469-1F3FF",
    "1F469-1F3FC-200D-2764-200D-1F469-1F3FF",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F469-1F3FB",
    "1F469-1F3FD-200D-2764-200D-1F469-1F3FB",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F469-1F3FC",
    "1F469-1F3FD-200D-2764-200D-1F469-1F3FC",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F469-1F3FD",
    "1F469-1F3FD-200D-2764-200D-1F469-1F3FD",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F469-1F3FE",
    "1F469-1F3FD-200D-2764-200D-1F469-1F3FE",
    "1F469-1F3FD-200D-2764-FE0F-200D-1F469-1F3FF",
    "1F469-1F3FD-200D-2764-200D-1F469-1F3FF",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F469-1F3FB",
    "1F469-1F3FE-200D-2764-200D-1F469-1F3FB",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F469-1F3FC",
    "1F469-1F3FE-200D-2764-200D-1F469-1F3FC",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F469-1F3FD",
    "1F469-1F3FE-200D-2764-200D-1F469-1F3FD",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F469-1F3FE",
    "1F469-1F3FE-200D-2764-200D-1F469-1F3FE",
    "1F469-1F3FE-200D-2764-FE0F-200D-1F469-1F3FF",
    "1F469-1F3FE-200D-2764-200D-1F469-1F3FF",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F469-1F3FB",
    "1F469-1F3FF-200D-2764-200D-1F469-1F3FB",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F469-1F3FC",
    "1F469-1F3FF-200D-2764-200D-1F469-1F3FC",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F469-1F3FD",
    "1F469-1F3FF-200D-2764-200D-1F469-1F3FD",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F469-1F3FE",
    "1F469-1F3FF-200D-2764-200D-1F469-1F3FE",
    "1F469-1F3FF-200D-2764-FE0F-200D-1F469-1F3FF",
    "1F469-1F3FF-200D-2764-200D-1F469-1F3FF",
    "1F468-200D-1F469-200D-1F466",
    "1F468-200D-1F469-200D-1F467",
    "1F468-200D-1F469-200D-1F467-200D-1F466",
    "1F468-200D-1F469-200D-1F466-200D-1F466",
    "1F468-200D-1F469-200D-1F467-200D-1F467",
    "1F468-200D-1F468-200D-1F466",
    "1F468-200D-1F468-200D-1F467",
    "1F468-200D-1F468-200D-1F467-200D-1F466",
    "1F468-200D-1F468-200D-1F466-200D-1F466",
    "1F468-200D-1F468-200D-1F467-200D-1F467",
    "1F469-200D-1F469-200D-1F466",
    "1F469-200D-1F469-200D-1F467",
    "1F469-200D-1F469-200D-1F467-200D-1F466",
    "1F469-200D-1F469-200D-1F466-200D-1F466",
    "1F469-200D-1F469-200D-1F467-200D-1F467",
    "1F468-200D-1F466",
    "1F468-200D-1F466-200D-1F466",
    "1F468-200D-1F467",
    "1F468-200D-1F467-200D-1F466",
    "1F468-200D-1F467-200D-1F467",
    "1F469-200D-1F466",
    "1F469-200D-1F466-200D-1F466",
    "1F469-200D-1F467",
    "1F469-200D-1F467-200D-1F466",
    "1F469-200D-1F467-200D-1F467",
    "1F5E3-FE0F",
    "1F5E3",
    "1F464",
    "1F465",
    "1FAC2",
    "1F46A",
    "1F9D1-200D-1F9D1-200D-1F9D2",
    "1F9D1-200D-1F9D1-200D-1F9D2-200D-1F9D2",
    "1F9D1-200D-1F9D2",
    "1F9D1-200D-1F9D2-200D-1F9D2",
    "1F463",
    "1FAC6"
  ],
  Component,
  "Animals & Nature": [
    "1F435",
    "1F412",
    "1F98D",
    "1F9A7",
    "1F436",
    "1F415",
    "1F9AE",
    "1F415-200D-1F9BA",
    "1F429",
    "1F43A",
    "1F98A",
    "1F99D",
    "1F431",
    "1F408",
    "1F408-200D-2B1B",
    "1F981",
    "1F42F",
    "1F405",
    "1F406",
    "1F434",
    "1FACE",
    "1FACF",
    "1F40E",
    "1F984",
    "1F993",
    "1F98C",
    "1F9AC",
    "1F42E",
    "1F402",
    "1F403",
    "1F404",
    "1F437",
    "1F416",
    "1F417",
    "1F43D",
    "1F40F",
    "1F411",
    "1F410",
    "1F42A",
    "1F42B",
    "1F999",
    "1F992",
    "1F418",
    "1F9A3",
    "1F98F",
    "1F99B",
    "1F42D",
    "1F401",
    "1F400",
    "1F439",
    "1F430",
    "1F407",
    "1F43F-FE0F",
    "1F43F",
    "1F9AB",
    "1F994",
    "1F987",
    "1F43B",
    "1F43B-200D-2744-FE0F",
    "1F43B-200D-2744",
    "1F428",
    "1F43C",
    "1F9A5",
    "1F9A6",
    "1F9A8",
    "1F998",
    "1F9A1",
    "1F43E",
    "1F983",
    "1F414",
    "1F413",
    "1F423",
    "1F424",
    "1F425",
    "1F426",
    "1F427",
    "1F54A-FE0F",
    "1F54A",
    "1F985",
    "1F986",
    "1F9A2",
    "1F989",
    "1F9A4",
    "1FAB6",
    "1F9A9",
    "1F99A",
    "1F99C",
    "1FABD",
    "1F426-200D-2B1B",
    "1FABF",
    "1F426-200D-1F525",
    "1F438",
    "1F40A",
    "1F422",
    "1F98E",
    "1F40D",
    "1F432",
    "1F409",
    "1F995",
    "1F996",
    "1F433",
    "1F40B",
    "1F42C",
    "1F9AD",
    "1F41F",
    "1F420",
    "1F421",
    "1F988",
    "1F419",
    "1F41A",
    "1FAB8",
    "1FABC",
    "1F980",
    "1F99E",
    "1F990",
    "1F991",
    "1F9AA",
    "1F40C",
    "1F98B",
    "1F41B",
    "1F41C",
    "1F41D",
    "1FAB2",
    "1F41E",
    "1F997",
    "1FAB3",
    "1F577-FE0F",
    "1F577",
    "1F578-FE0F",
    "1F578",
    "1F982",
    "1F99F",
    "1FAB0",
    "1FAB1",
    "1F9A0",
    "1F490",
    "1F338",
    "1F4AE",
    "1FAB7",
    "1F3F5-FE0F",
    "1F3F5",
    "1F339",
    "1F940",
    "1F33A",
    "1F33B",
    "1F33C",
    "1F337",
    "1FABB",
    "1F331",
    "1FAB4",
    "1F332",
    "1F333",
    "1F334",
    "1F335",
    "1F33E",
    "1F33F",
    "2618-FE0F",
    "2618",
    "1F340",
    "1F341",
    "1F342",
    "1F343",
    "1FAB9",
    "1FABA",
    "1F344",
    "1FABE"
  ],
  "Food & Drink": [
    "1F347",
    "1F348",
    "1F349",
    "1F34A",
    "1F34B",
    "1F34B-200D-1F7E9",
    "1F34C",
    "1F34D",
    "1F96D",
    "1F34E",
    "1F34F",
    "1F350",
    "1F351",
    "1F352",
    "1F353",
    "1FAD0",
    "1F95D",
    "1F345",
    "1FAD2",
    "1F965",
    "1F951",
    "1F346",
    "1F954",
    "1F955",
    "1F33D",
    "1F336-FE0F",
    "1F336",
    "1FAD1",
    "1F952",
    "1F96C",
    "1F966",
    "1F9C4",
    "1F9C5",
    "1F95C",
    "1FAD8",
    "1F330",
    "1FADA",
    "1FADB",
    "1F344-200D-1F7EB",
    "1FADC",
    "1F35E",
    "1F950",
    "1F956",
    "1FAD3",
    "1F968",
    "1F96F",
    "1F95E",
    "1F9C7",
    "1F9C0",
    "1F356",
    "1F357",
    "1F969",
    "1F953",
    "1F354",
    "1F35F",
    "1F355",
    "1F32D",
    "1F96A",
    "1F32E",
    "1F32F",
    "1FAD4",
    "1F959",
    "1F9C6",
    "1F95A",
    "1F373",
    "1F958",
    "1F372",
    "1FAD5",
    "1F963",
    "1F957",
    "1F37F",
    "1F9C8",
    "1F9C2",
    "1F96B",
    "1F371",
    "1F358",
    "1F359",
    "1F35A",
    "1F35B",
    "1F35C",
    "1F35D",
    "1F360",
    "1F362",
    "1F363",
    "1F364",
    "1F365",
    "1F96E",
    "1F361",
    "1F95F",
    "1F960",
    "1F961",
    "1F366",
    "1F367",
    "1F368",
    "1F369",
    "1F36A",
    "1F382",
    "1F370",
    "1F9C1",
    "1F967",
    "1F36B",
    "1F36C",
    "1F36D",
    "1F36E",
    "1F36F",
    "1F37C",
    "1F95B",
    "2615",
    "1FAD6",
    "1F375",
    "1F376",
    "1F37E",
    "1F377",
    "1F378",
    "1F379",
    "1F37A",
    "1F37B",
    "1F942",
    "1F943",
    "1FAD7",
    "1F964",
    "1F9CB",
    "1F9C3",
    "1F9C9",
    "1F9CA",
    "1F962",
    "1F37D-FE0F",
    "1F37D",
    "1F374",
    "1F944",
    "1F52A",
    "1FAD9",
    "1F3FA"
  ],
  "Travel & Places": [
    "1F30D",
    "1F30E",
    "1F30F",
    "1F310",
    "1F5FA-FE0F",
    "1F5FA",
    "1F5FE",
    "1F9ED",
    "1F3D4-FE0F",
    "1F3D4",
    "26F0-FE0F",
    "26F0",
    "1F30B",
    "1F5FB",
    "1F3D5-FE0F",
    "1F3D5",
    "1F3D6-FE0F",
    "1F3D6",
    "1F3DC-FE0F",
    "1F3DC",
    "1F3DD-FE0F",
    "1F3DD",
    "1F3DE-FE0F",
    "1F3DE",
    "1F3DF-FE0F",
    "1F3DF",
    "1F3DB-FE0F",
    "1F3DB",
    "1F3D7-FE0F",
    "1F3D7",
    "1F9F1",
    "1FAA8",
    "1FAB5",
    "1F6D6",
    "1F3D8-FE0F",
    "1F3D8",
    "1F3DA-FE0F",
    "1F3DA",
    "1F3E0",
    "1F3E1",
    "1F3E2",
    "1F3E3",
    "1F3E4",
    "1F3E5",
    "1F3E6",
    "1F3E8",
    "1F3E9",
    "1F3EA",
    "1F3EB",
    "1F3EC",
    "1F3ED",
    "1F3EF",
    "1F3F0",
    "1F492",
    "1F5FC",
    "1F5FD",
    "26EA",
    "1F54C",
    "1F6D5",
    "1F54D",
    "26E9-FE0F",
    "26E9",
    "1F54B",
    "26F2",
    "26FA",
    "1F301",
    "1F303",
    "1F3D9-FE0F",
    "1F3D9",
    "1F304",
    "1F305",
    "1F306",
    "1F307",
    "1F309",
    "2668-FE0F",
    "2668",
    "1F3A0",
    "1F6DD",
    "1F3A1",
    "1F3A2",
    "1F488",
    "1F3AA",
    "1F682",
    "1F683",
    "1F684",
    "1F685",
    "1F686",
    "1F687",
    "1F688",
    "1F689",
    "1F68A",
    "1F69D",
    "1F69E",
    "1F68B",
    "1F68C",
    "1F68D",
    "1F68E",
    "1F690",
    "1F691",
    "1F692",
    "1F693",
    "1F694",
    "1F695",
    "1F696",
    "1F697",
    "1F698",
    "1F699",
    "1F6FB",
    "1F69A",
    "1F69B",
    "1F69C",
    "1F3CE-FE0F",
    "1F3CE",
    "1F3CD-FE0F",
    "1F3CD",
    "1F6F5",
    "1F9BD",
    "1F9BC",
    "1F6FA",
    "1F6B2",
    "1F6F4",
    "1F6F9",
    "1F6FC",
    "1F68F",
    "1F6E3-FE0F",
    "1F6E3",
    "1F6E4-FE0F",
    "1F6E4",
    "1F6E2-FE0F",
    "1F6E2",
    "26FD",
    "1F6DE",
    "1F6A8",
    "1F6A5",
    "1F6A6",
    "1F6D1",
    "1F6A7",
    "2693",
    "1F6DF",
    "26F5",
    "1F6F6",
    "1F6A4",
    "1F6F3-FE0F",
    "1F6F3",
    "26F4-FE0F",
    "26F4",
    "1F6E5-FE0F",
    "1F6E5",
    "1F6A2",
    "2708-FE0F",
    "2708",
    "1F6E9-FE0F",
    "1F6E9",
    "1F6EB",
    "1F6EC",
    "1FA82",
    "1F4BA",
    "1F681",
    "1F69F",
    "1F6A0",
    "1F6A1",
    "1F6F0-FE0F",
    "1F6F0",
    "1F680",
    "1F6F8",
    "1F6CE-FE0F",
    "1F6CE",
    "1F9F3",
    "231B",
    "23F3",
    "231A",
    "23F0",
    "23F1-FE0F",
    "23F1",
    "23F2-FE0F",
    "23F2",
    "1F570-FE0F",
    "1F570",
    "1F55B",
    "1F567",
    "1F550",
    "1F55C",
    "1F551",
    "1F55D",
    "1F552",
    "1F55E",
    "1F553",
    "1F55F",
    "1F554",
    "1F560",
    "1F555",
    "1F561",
    "1F556",
    "1F562",
    "1F557",
    "1F563",
    "1F558",
    "1F564",
    "1F559",
    "1F565",
    "1F55A",
    "1F566",
    "1F311",
    "1F312",
    "1F313",
    "1F314",
    "1F315",
    "1F316",
    "1F317",
    "1F318",
    "1F319",
    "1F31A",
    "1F31B",
    "1F31C",
    "1F321-FE0F",
    "1F321",
    "2600-FE0F",
    "2600",
    "1F31D",
    "1F31E",
    "1FA90",
    "2B50",
    "1F31F",
    "1F320",
    "1F30C",
    "2601-FE0F",
    "2601",
    "26C5",
    "26C8-FE0F",
    "26C8",
    "1F324-FE0F",
    "1F324",
    "1F325-FE0F",
    "1F325",
    "1F326-FE0F",
    "1F326",
    "1F327-FE0F",
    "1F327",
    "1F328-FE0F",
    "1F328",
    "1F329-FE0F",
    "1F329",
    "1F32A-FE0F",
    "1F32A",
    "1F32B-FE0F",
    "1F32B",
    "1F32C-FE0F",
    "1F32C",
    "1F300",
    "1F308",
    "1F302",
    "2602-FE0F",
    "2602",
    "2614",
    "26F1-FE0F",
    "26F1",
    "26A1",
    "2744-FE0F",
    "2744",
    "2603-FE0F",
    "2603",
    "26C4",
    "2604-FE0F",
    "2604",
    "1F525",
    "1F4A7",
    "1F30A"
  ],
  Activities,
  Objects,
  Symbols,
  Flags
};
function EmojiPicker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let onClose = fallback($$props["onClose"], () => {
    });
    let onSubmit = fallback($$props["onSubmit"], (name) => {
    });
    let side = fallback($$props["side"], "top");
    let align = fallback($$props["align"], "start");
    let user = fallback($$props["user"], null);
    let show = false;
    let emojis = emojiShortCodes;
    let search = "";
    let flattenedEmojis = [];
    let emojiRows = [];
    const ROW_HEIGHT = 48;
    {
      if (search) {
        emojis = Object.keys(emojiShortCodes).reduce(
          (acc, key) => {
            if (key.includes(search.toLowerCase())) {
              acc[key] = emojiShortCodes[key];
            } else {
              if (Array.isArray(emojiShortCodes[key])) {
                const filtered = emojiShortCodes[key].filter((emoji) => emoji.includes(search.toLowerCase()));
                if (filtered.length) {
                  acc[key] = filtered;
                }
              } else {
                if (emojiShortCodes[key].includes(search.toLowerCase())) {
                  acc[key] = emojiShortCodes[key];
                }
              }
            }
            return acc;
          },
          {}
        );
      } else {
        emojis = emojiShortCodes;
      }
    }
    {
      flattenedEmojis = [];
      Object.keys(emojiGroups).forEach((group) => {
        const groupEmojis = emojiGroups[group].filter((emoji) => emojis[emoji]);
        if (groupEmojis.length > 0) {
          flattenedEmojis.push({ type: "group", label: group });
          flattenedEmojis.push(...groupEmojis.map((emoji) => ({
            type: "emoji",
            name: emoji,
            shortCodes: typeof emojiShortCodes[emoji] === "string" ? [emojiShortCodes[emoji]] : emojiShortCodes[emoji]
          })));
        }
      });
      emojiRows = [];
      let currentRow = [];
      flattenedEmojis.forEach((item) => {
        if (item.type === "emoji") {
          currentRow.push(item);
          if (currentRow.length === 8) {
            emojiRows.push(currentRow);
            currentRow = [];
          }
        } else if (item.type === "group") {
          if (currentRow.length > 0) {
            emojiRows.push(currentRow);
            currentRow = [];
          }
          emojiRows.push([item]);
        }
      });
      if (currentRow.length > 0) {
        emojiRows.push(currentRow);
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Menu($$renderer3, {
        closeFocus: false,
        onOpenChange: (state) => {
          if (!state) {
            search = "";
            onClose();
          }
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
          $$renderer4.push(`<!----> `);
          Menu_content($$renderer4, {
            class: "max-w-full w-80 border border-gray-100  dark:border-gray-800   bg-white dark:bg-gray-850  rounded-3xl z-9999 shadow-lg dark:text-white",
            sideOffset: 8,
            side,
            align,
            transition: flyAndScale,
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="mb-1 px-4 pt-2.5 pb-2"><input type="text" class="w-full text-sm bg-transparent outline-hidden"${attr("placeholder", store_get($$store_subs ??= {}, "$i18n", i18n).t("Search all emojis"))}${attr("value", search)}/></div> <div class="w-full flex justify-start h-96 overflow-y-auto px-3 pb-3 text-sm">`);
              if (emojiRows.length === 0) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<div class="text-center text-xs text-gray-500 dark:text-gray-400">${escape_html(store_get($$store_subs ??= {}, "$i18n", i18n).t("No results"))}</div>`);
              } else {
                $$renderer5.push("<!--[!-->");
                $$renderer5.push(`<div class="w-full flex ml-0.5">`);
                VirtualList($$renderer5, {
                  rowHeight: ROW_HEIGHT,
                  items: emojiRows,
                  height: 384,
                  children: invalid_default_snippet,
                  $$slots: {
                    default: ($$renderer6, { item }) => {
                      $$renderer6.push(`<div class="w-full">`);
                      if (item.length === 1 && item[0].type === "group") {
                        $$renderer6.push("<!--[-->");
                        $$renderer6.push(`<div class="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">${escape_html(item[0].label)}</div>`);
                      } else {
                        $$renderer6.push("<!--[!-->");
                        $$renderer6.push(`<div class="flex items-center gap-1.5 w-full"><!--[-->`);
                        const each_array = ensure_array_like(item);
                        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                          let emojiItem = each_array[$$index];
                          Tooltip($$renderer6, {
                            content: emojiItem.shortCodes.map((code) => `:${code}:`).join(", "),
                            placement: "top",
                            children: ($$renderer7) => {
                              $$renderer7.push(`<button class="p-1.5 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"><img${attr("src", `${stringify(WEBUI_BASE_URL)}/assets/emojis/${stringify(emojiItem.name.toLowerCase())}.svg`)}${attr("alt", emojiItem.name)} class="size-5" loading="lazy"/></button>`);
                            },
                            $$slots: { default: true }
                          });
                        }
                        $$renderer6.push(`<!--]--></div>`);
                      }
                      $$renderer6.push(`<!--]--></div>`);
                    }
                  }
                });
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
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onClose, onSubmit, side, align, user });
  });
}
export {
  Drawer as D,
  EmojiPicker as E,
  Pane as P,
  generateId as a,
  getCursorStyle as b,
  getSessionUser as c,
  Pane_group as d,
  getCtx as g,
  styleToString as s
};
//# sourceMappingURL=EmojiPicker.js.map
