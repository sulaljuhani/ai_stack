import { s as store_get, a as attr, o as stringify, c as attr_class, d as clsx, f as attr_style, h as slot, u as unsubscribe_stores, b as bind_props, l as rest_props, j as escape_html, k as sanitize_props, e as ensure_array_like, g as spread_props, p as store_set, m as attributes, v as sanitize_slots } from "./index.js";
import { o as onDestroy } from "./client.js";
import { k as get, w as writable, r as readable, i as derived } from "./exports.js";
import { t as theme, u as user, m as models } from "./index2.js";
import { a as WEBUI_API_BASE_URL } from "./constants.js";
import { Y as fallback, Z as getContext, W as setContext, $ as hasContext } from "./context.js";
import { P as ProfileImage } from "./FileItem.js";
import { T as Tooltip } from "./Tooltip.js";
import cc from "classcat";
import { Position, ConnectionMode, areConnectionMapsEqual, handleConnectionChange, errorMessages, getBezierPath, getSmoothStepPath, getStraightPath, infiniteExtent, adoptUserNodes, updateConnectionLookup, getInternalNodesBounds, getViewportForBounds, SelectionMode, initialConnection, ConnectionLineType, devWarn, isEdgeVisible, getEdgePosition, getElevatedEdgeZIndex, getNodesInside, getElementsToRemove, pointToRendererPoint, createMarkerIds, addEdge, updateNodeInternals, getFitViewNodes, fitView, panBy, nodeHasDimensions, getMarkerId, MarkerType, isNumeric, isMacOs, getConnectionStatus, PanOnScrollMode, isNodeBase, isRectObject, nodeToRect, getOverlappingArea, rendererPointToPoint, getNodesBounds, evaluateAbsolutePosition } from "@xyflow/system";
import "clsx";
import { X as XMark } from "./XMark.js";
function Handle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isTarget, isConnectable, handleId, connectionInProcess, connectingFrom, connectingTo, isPossibleEndHandle, valid;
    let id = fallback($$props["id"], void 0);
    let type = fallback($$props["type"], "source");
    let position = fallback($$props["position"], () => Position.Top, true);
    let style = fallback($$props["style"], void 0);
    let isValidConnection = fallback($$props["isValidConnection"], void 0);
    let onconnect = fallback($$props["onconnect"], void 0);
    let ondisconnect = fallback($$props["ondisconnect"], void 0);
    let isConnectableProp = fallback($$props["isConnectable"], void 0);
    let className = fallback($$props["class"], void 0);
    const nodeId = getContext("svelteflow__node_id");
    const connectable = getContext("svelteflow__node_connectable");
    const store = useStore();
    const {
      connectionMode,
      domNode,
      nodeLookup,
      connectionRadius,
      viewport,
      isValidConnection: isValidConnectionStore,
      lib,
      addEdge: addEdge2,
      onedgecreate,
      panBy: panBy2,
      cancelConnection,
      updateConnection,
      autoPanOnConnect,
      edges,
      connectionLookup,
      onconnect: onConnectAction,
      onconnectstart: onConnectStartAction,
      onconnectend: onConnectEndAction,
      flowId,
      connection
    } = store;
    let prevConnections = null;
    let connections;
    isTarget = type === "target";
    isConnectable = isConnectableProp !== void 0 ? isConnectableProp : store_get($$store_subs ??= {}, "$connectable", connectable);
    handleId = id || null;
    if (onconnect || ondisconnect) {
      store_get($$store_subs ??= {}, "$edges", edges);
      connections = store_get($$store_subs ??= {}, "$connectionLookup", connectionLookup).get(`${nodeId}-${type}-${id || null}`);
    }
    {
      if (prevConnections && !areConnectionMapsEqual(connections, prevConnections)) {
        const _connections = connections ?? /* @__PURE__ */ new Map();
        handleConnectionChange(prevConnections, _connections, ondisconnect);
        handleConnectionChange(_connections, prevConnections, onconnect);
      }
      prevConnections = connections ?? /* @__PURE__ */ new Map();
    }
    connectionInProcess = !!store_get($$store_subs ??= {}, "$connection", connection).fromHandle;
    connectingFrom = store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.nodeId === nodeId && store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.type === type && store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.id === handleId;
    connectingTo = store_get($$store_subs ??= {}, "$connection", connection).toHandle?.nodeId === nodeId && store_get($$store_subs ??= {}, "$connection", connection).toHandle?.type === type && store_get($$store_subs ??= {}, "$connection", connection).toHandle?.id === handleId;
    isPossibleEndHandle = store_get($$store_subs ??= {}, "$connectionMode", connectionMode) === ConnectionMode.Strict ? store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.type !== type : nodeId !== store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.nodeId || handleId !== store_get($$store_subs ??= {}, "$connection", connection).fromHandle?.id;
    valid = connectingTo && store_get($$store_subs ??= {}, "$connection", connection).isValid;
    $$renderer2.push(`<div${attr("data-handleid", handleId)}${attr("data-nodeid", nodeId)}${attr("data-handlepos", position)}${attr("data-id", `${stringify(store_get($$store_subs ??= {}, "$flowId", flowId))}-${stringify(nodeId)}-${stringify(id || null)}-${stringify(type)}`)}${attr_class(
      clsx(cc([
        "svelte-flow__handle",
        `svelte-flow__handle-${position}`,
        "nodrag",
        "nopan",
        position,
        className
      ])),
      void 0,
      {
        "valid": valid,
        "connectingto": connectingTo,
        "connectingfrom": connectingFrom,
        "source": !isTarget,
        "target": isTarget,
        "connectablestart": isConnectable,
        "connectableend": isConnectable,
        "connectable": isConnectable,
        "connectionindicator": isConnectable && (!connectionInProcess || isPossibleEndHandle)
      }
    )}${attr_style(style)} role="button" tabindex="-1"><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      type,
      position,
      style,
      isValidConnection,
      onconnect,
      ondisconnect,
      isConnectable: isConnectableProp,
      class: className
    });
  });
}
function DefaultNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, ["data", "targetPosition", "sourcePosition"]);
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => ({ label: "Node" }), true);
    let targetPosition = fallback($$props["targetPosition"], void 0);
    let sourcePosition = fallback($$props["sourcePosition"], void 0);
    Handle($$renderer2, { type: "target", position: targetPosition ?? Position.Top });
    $$renderer2.push(`<!----> ${escape_html(data?.label)} `);
    Handle($$renderer2, { type: "source", position: sourcePosition ?? Position.Bottom });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data, targetPosition, sourcePosition });
  });
}
function InputNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, ["data", "sourcePosition"]);
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => ({ label: "Node" }), true);
    let sourcePosition = fallback($$props["sourcePosition"], void 0);
    $$renderer2.push(`<!---->${escape_html(data?.label)} `);
    Handle($$renderer2, { type: "source", position: sourcePosition ?? Position.Bottom });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data, sourcePosition });
  });
}
function OutputNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, ["data", "targetPosition"]);
  $$renderer.component(($$renderer2) => {
    let data = fallback($$props["data"], () => ({ label: "Node" }), true);
    let targetPosition = fallback($$props["targetPosition"], void 0);
    $$renderer2.push(`<!---->${escape_html(data?.label)} `);
    Handle($$renderer2, { type: "target", position: targetPosition ?? Position.Top });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { data, targetPosition });
  });
}
function GroupNode($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, []);
}
function EdgeLabelRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    useStore();
    $$renderer2.push(`<div><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
  });
}
function useHandleEdgeSelect() {
  const { edgeLookup, selectionRect, selectionRectMode, multiselectionKeyPressed, addSelectedEdges, unselectNodesAndEdges, elementsSelectable } = useStore();
  return (id) => {
    const edge = get(edgeLookup).get(id);
    if (!edge) {
      console.warn("012", errorMessages["error012"](id));
      return;
    }
    const selectable = edge.selectable || get(elementsSelectable) && typeof edge.selectable === "undefined";
    if (selectable) {
      selectionRect.set(null);
      selectionRectMode.set(null);
      if (!edge.selected) {
        addSelectedEdges([id]);
      } else if (edge.selected && get(multiselectionKeyPressed)) {
        unselectNodesAndEdges({ nodes: [], edges: [edge] });
      }
    }
  };
}
function EdgeLabel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let style = fallback($$props["style"], void 0);
    let x = fallback($$props["x"], void 0);
    let y = fallback($$props["y"], void 0);
    useHandleEdgeSelect();
    getContext("svelteflow__edge_id");
    EdgeLabelRenderer($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="svelte-flow__edge-label"${attr_style("pointer-events: all;" + style, {
          transform: `translate(-50%, -50%) translate(${stringify(x)}px,${stringify(y)}px)`
        })} role="button" tabindex="-1"><!--[-->`);
        slot($$renderer3, $$props, "default", {}, null);
        $$renderer3.push(`<!--]--></div>`);
      },
      $$slots: { default: true }
    });
    bind_props($$props, { style, x, y });
  });
}
function BaseEdge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let id = fallback($$props["id"], void 0);
    let path = $$props["path"];
    let label = fallback($$props["label"], void 0);
    let labelX = fallback($$props["labelX"], void 0);
    let labelY = fallback($$props["labelY"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let style = fallback($$props["style"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], 20);
    let className = fallback($$props["class"], void 0);
    let interactionWidthValue = interactionWidth === void 0 ? 20 : interactionWidth;
    $$renderer2.push(`<path${attr("id", id)}${attr("d", path)}${attr_class(clsx(cc(["svelte-flow__edge-path", className])))}${attr("marker-start", markerStart)}${attr("marker-end", markerEnd)} fill="none"${attr_style(style)}></path>`);
    if (interactionWidthValue) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<path${attr("d", path)}${attr("stroke-opacity", 0)}${attr("stroke-width", interactionWidthValue)} fill="none" class="svelte-flow__edge-interaction"></path>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if (label) {
      $$renderer2.push("<!--[-->");
      EdgeLabel($$renderer2, {
        x: labelX,
        y: labelY,
        style: labelStyle,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(label)}`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      id,
      path,
      label,
      labelX,
      labelY,
      labelStyle,
      markerStart,
      markerEnd,
      style,
      interactionWidth,
      class: className
    });
  });
}
function BezierEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "sourcePosition",
    "targetX",
    "targetY",
    "targetPosition"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let targetPosition = $$props["targetPosition"];
    [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition
    });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
  });
}
function SmoothStepEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "sourcePosition",
    "targetX",
    "targetY",
    "targetPosition"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let targetPosition = $$props["targetPosition"];
    [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition
    });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
  });
}
function StraightEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "targetX",
    "targetY"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      targetX,
      targetY
    });
  });
}
function StepEdgeInternal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  rest_props($$sanitized_props, [
    "label",
    "labelStyle",
    "style",
    "markerStart",
    "markerEnd",
    "interactionWidth",
    "sourceX",
    "sourceY",
    "sourcePosition",
    "targetX",
    "targetY",
    "targetPosition"
  ]);
  $$renderer.component(($$renderer2) => {
    let path, labelX, labelY;
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let style = fallback($$props["style"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let targetPosition = $$props["targetPosition"];
    [path, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 0
    });
    BaseEdge($$renderer2, {
      path,
      labelX,
      labelY,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      interactionWidth,
      style
    });
    bind_props($$props, {
      label,
      labelStyle,
      style,
      markerStart,
      markerEnd,
      interactionWidth,
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition
    });
  });
}
function syncNodeStores(nodesStore, userNodesStore) {
  const nodesStoreSetter = nodesStore.set;
  const userNodesStoreSetter = userNodesStore.set;
  const currentNodesStore = get(nodesStore);
  const currentUserNodesStore = get(userNodesStore);
  const initWithUserNodes = currentNodesStore.length === 0 && currentUserNodesStore.length > 0;
  let val = initWithUserNodes ? currentUserNodesStore : currentNodesStore;
  nodesStore.set(val);
  const _set = (nds) => {
    const updatedNodes = nodesStoreSetter(nds);
    val = updatedNodes;
    userNodesStoreSetter(val);
    return updatedNodes;
  };
  nodesStore.set = userNodesStore.set = _set;
  nodesStore.update = userNodesStore.update = (fn) => _set(fn(val));
}
function syncEdgeStores(edgesStore, userEdgesStore) {
  const nodesStoreSetter = edgesStore.set;
  const userEdgesStoreSetter = userEdgesStore.set;
  let val = get(userEdgesStore);
  edgesStore.set(val);
  const _set = (eds) => {
    nodesStoreSetter(eds);
    userEdgesStoreSetter(eds);
    val = eds;
  };
  edgesStore.set = userEdgesStore.set = _set;
  edgesStore.update = userEdgesStore.update = (fn) => _set(fn(val));
}
const syncViewportStores = (panZoomStore, viewportStore, userViewportStore) => {
  if (!userViewportStore) {
    return;
  }
  const panZoom = get(panZoomStore);
  const viewportStoreSetter = viewportStore.set;
  const userViewportStoreSetter = userViewportStore.set;
  let val = userViewportStore ? get(userViewportStore) : { x: 0, y: 0, zoom: 1 };
  viewportStore.set(val);
  viewportStore.set = (vp) => {
    viewportStoreSetter(vp);
    userViewportStoreSetter(vp);
    val = vp;
    return vp;
  };
  userViewportStore.set = (vp) => {
    panZoom?.syncViewport(vp);
    viewportStoreSetter(vp);
    userViewportStoreSetter(vp);
    val = vp;
    return vp;
  };
  viewportStore.update = (fn) => {
    viewportStore.set(fn(val));
  };
  userViewportStore.update = (fn) => {
    userViewportStore.set(fn(val));
  };
};
const createNodesStore = (nodes, nodeLookup, parentLookup, nodeOrigin = [0, 0], nodeExtent = infiniteExtent) => {
  const { subscribe, set, update } = writable([]);
  let value = nodes;
  let defaults = {};
  let elevateNodesOnSelect = true;
  const _set = (nds) => {
    adoptUserNodes(nds, nodeLookup, parentLookup, {
      elevateNodesOnSelect,
      nodeOrigin,
      nodeExtent,
      defaults,
      checkEquality: false
    });
    value = nds;
    set(value);
    return value;
  };
  const _update = (fn) => _set(fn(value));
  const setDefaultOptions = (options) => {
    defaults = options;
  };
  const setOptions = (options) => {
    elevateNodesOnSelect = options.elevateNodesOnSelect ?? elevateNodesOnSelect;
  };
  _set(value);
  return {
    subscribe,
    set: _set,
    update: _update,
    setDefaultOptions,
    setOptions
  };
};
const createEdgesStore = (edges, connectionLookup, edgeLookup, defaultOptions) => {
  const { subscribe, set, update } = writable([]);
  let value = edges;
  let defaults = {};
  const _set = (eds) => {
    const nextEdges = defaults ? eds.map((edge) => ({ ...defaults, ...edge })) : eds;
    updateConnectionLookup(connectionLookup, edgeLookup, nextEdges);
    value = nextEdges;
    set(value);
  };
  const _update = (fn) => _set(fn(value));
  const setDefaultOptions = (options) => {
    defaults = options;
  };
  _set(value);
  return {
    subscribe,
    set: _set,
    update: _update,
    setDefaultOptions
  };
};
const initialNodeTypes = {
  input: InputNode,
  output: OutputNode,
  default: DefaultNode,
  group: GroupNode
};
const initialEdgeTypes = {
  straight: StraightEdgeInternal,
  smoothstep: SmoothStepEdgeInternal,
  default: BezierEdgeInternal,
  step: StepEdgeInternal
};
const getInitialStore = ({ nodes = [], edges = [], width, height, fitView: fitView2, nodeOrigin, nodeExtent }) => {
  const nodeLookup = /* @__PURE__ */ new Map();
  const parentLookup = /* @__PURE__ */ new Map();
  const connectionLookup = /* @__PURE__ */ new Map();
  const edgeLookup = /* @__PURE__ */ new Map();
  const storeNodeOrigin = nodeOrigin ?? [0, 0];
  const storeNodeExtent = nodeExtent ?? infiniteExtent;
  adoptUserNodes(nodes, nodeLookup, parentLookup, {
    nodeExtent: storeNodeExtent,
    nodeOrigin: storeNodeOrigin,
    elevateNodesOnSelect: false,
    checkEquality: false
  });
  updateConnectionLookup(connectionLookup, edgeLookup, edges);
  let viewport = { x: 0, y: 0, zoom: 1 };
  if (fitView2 && width && height) {
    const bounds = getInternalNodesBounds(nodeLookup, {
      filter: (node) => !!((node.width || node.initialWidth) && (node.height || node.initialHeight))
    });
    viewport = getViewportForBounds(bounds, width, height, 0.5, 2, 0.1);
  }
  return {
    flowId: writable(null),
    nodes: createNodesStore(nodes, nodeLookup, parentLookup, storeNodeOrigin, storeNodeExtent),
    nodeLookup: readable(nodeLookup),
    parentLookup: readable(parentLookup),
    edgeLookup: readable(edgeLookup),
    visibleNodes: readable([]),
    edges: createEdgesStore(edges, connectionLookup, edgeLookup),
    visibleEdges: readable([]),
    connectionLookup: readable(connectionLookup),
    height: writable(500),
    width: writable(500),
    minZoom: writable(0.5),
    maxZoom: writable(2),
    nodeOrigin: writable(storeNodeOrigin),
    nodeDragThreshold: writable(1),
    nodeExtent: writable(storeNodeExtent),
    translateExtent: writable(infiniteExtent),
    autoPanOnNodeDrag: writable(true),
    autoPanOnConnect: writable(true),
    fitViewOnInit: writable(false),
    fitViewOnInitDone: writable(false),
    fitViewOptions: writable(void 0),
    panZoom: writable(null),
    snapGrid: writable(null),
    dragging: writable(false),
    selectionRect: writable(null),
    selectionKeyPressed: writable(false),
    multiselectionKeyPressed: writable(false),
    deleteKeyPressed: writable(false),
    panActivationKeyPressed: writable(false),
    zoomActivationKeyPressed: writable(false),
    selectionRectMode: writable(null),
    selectionMode: writable(SelectionMode.Partial),
    nodeTypes: writable(initialNodeTypes),
    edgeTypes: writable(initialEdgeTypes),
    viewport: writable(viewport),
    connectionMode: writable(ConnectionMode.Strict),
    domNode: writable(null),
    connection: readable(initialConnection),
    connectionLineType: writable(ConnectionLineType.Bezier),
    connectionRadius: writable(20),
    isValidConnection: writable(() => true),
    nodesDraggable: writable(true),
    nodesConnectable: writable(true),
    elementsSelectable: writable(true),
    selectNodesOnDrag: writable(true),
    markers: readable([]),
    defaultMarkerColor: writable("#b1b1b7"),
    lib: readable("svelte"),
    onlyRenderVisibleElements: writable(false),
    onerror: writable(devWarn),
    ondelete: writable(void 0),
    onedgecreate: writable(void 0),
    onconnect: writable(void 0),
    onconnectstart: writable(void 0),
    onconnectend: writable(void 0),
    onbeforedelete: writable(void 0),
    nodesInitialized: writable(false),
    edgesInitialized: writable(false),
    viewportInitialized: writable(false),
    initialized: readable(false)
  };
};
function getVisibleEdges(store) {
  const visibleEdges = derived([
    store.edges,
    store.nodes,
    store.nodeLookup,
    store.onlyRenderVisibleElements,
    store.viewport,
    store.width,
    store.height
  ], ([edges, , nodeLookup, onlyRenderVisibleElements, viewport, width, height]) => {
    const visibleEdges2 = onlyRenderVisibleElements && width && height ? edges.filter((edge) => {
      const sourceNode = nodeLookup.get(edge.source);
      const targetNode = nodeLookup.get(edge.target);
      return sourceNode && targetNode && isEdgeVisible({
        sourceNode,
        targetNode,
        width,
        height,
        transform: [viewport.x, viewport.y, viewport.zoom]
      });
    }) : edges;
    return visibleEdges2;
  });
  return derived([visibleEdges, store.nodes, store.nodeLookup, store.connectionMode, store.onerror], ([visibleEdges2, , nodeLookup, connectionMode, onerror]) => {
    const layoutedEdges = visibleEdges2.reduce((res, edge) => {
      const sourceNode = nodeLookup.get(edge.source);
      const targetNode = nodeLookup.get(edge.target);
      if (!sourceNode || !targetNode) {
        return res;
      }
      const edgePosition = getEdgePosition({
        id: edge.id,
        sourceNode,
        targetNode,
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
        connectionMode,
        onError: onerror
      });
      if (edgePosition) {
        res.push({
          ...edge,
          zIndex: getElevatedEdgeZIndex({
            selected: edge.selected,
            zIndex: edge.zIndex,
            sourceNode,
            targetNode,
            elevateOnSelect: false
          }),
          ...edgePosition
        });
      }
      return res;
    }, []);
    return layoutedEdges;
  });
}
function getVisibleNodes(store) {
  return derived([
    store.nodeLookup,
    store.onlyRenderVisibleElements,
    store.width,
    store.height,
    store.viewport,
    store.nodes
  ], ([nodeLookup, onlyRenderVisibleElements, width, height, viewport]) => {
    const transform = [viewport.x, viewport.y, viewport.zoom];
    return onlyRenderVisibleElements ? getNodesInside(nodeLookup, { x: 0, y: 0, width, height }, transform, true) : Array.from(nodeLookup.values());
  });
}
const key = Symbol();
function createStore({ nodes, edges, width, height, fitView: fitViewOnCreate, nodeOrigin, nodeExtent }) {
  const store = getInitialStore({
    nodes,
    edges,
    width,
    height,
    fitView: fitViewOnCreate,
    nodeOrigin,
    nodeExtent
  });
  function setNodeTypes(nodeTypes) {
    store.nodeTypes.set({
      ...initialNodeTypes,
      ...nodeTypes
    });
  }
  function setEdgeTypes(edgeTypes) {
    store.edgeTypes.set({
      ...initialEdgeTypes,
      ...edgeTypes
    });
  }
  function addEdge$1(edgeParams) {
    const edges2 = get(store.edges);
    store.edges.set(addEdge(edgeParams, edges2));
  }
  const updateNodePositions = (nodeDragItems, dragging = false) => {
    const nodeLookup = get(store.nodeLookup);
    for (const [id, dragItem] of nodeDragItems) {
      const node = nodeLookup.get(id)?.internals.userNode;
      if (!node) {
        continue;
      }
      node.position = dragItem.position;
      node.dragging = dragging;
    }
    store.nodes.update((nds) => nds);
  };
  function updateNodeInternals$1(updates) {
    const nodeLookup = get(store.nodeLookup);
    const { changes, updatedInternals } = updateNodeInternals(updates, nodeLookup, get(store.parentLookup), get(store.domNode), get(store.nodeOrigin));
    if (!updatedInternals) {
      return;
    }
    if (!get(store.fitViewOnInitDone) && get(store.fitViewOnInit)) {
      const fitViewOptions = get(store.fitViewOptions);
      const fitViewOnInitDone = fitViewSync({
        ...fitViewOptions,
        nodes: fitViewOptions?.nodes
      });
      store.fitViewOnInitDone.set(fitViewOnInitDone);
    }
    for (const change of changes) {
      const node = nodeLookup.get(change.id)?.internals.userNode;
      if (!node) {
        continue;
      }
      switch (change.type) {
        case "dimensions": {
          const measured = { ...node.measured, ...change.dimensions };
          if (change.setAttributes) {
            node.width = change.dimensions?.width ?? node.width;
            node.height = change.dimensions?.height ?? node.height;
          }
          node.measured = measured;
          break;
        }
        case "position":
          node.position = change.position ?? node.position;
          break;
      }
    }
    store.nodes.update((nds) => nds);
    if (!get(store.nodesInitialized)) {
      store.nodesInitialized.set(true);
    }
  }
  function fitView$1(options) {
    const panZoom = get(store.panZoom);
    if (!panZoom) {
      return Promise.resolve(false);
    }
    const fitViewNodes = getFitViewNodes(get(store.nodeLookup), options);
    return fitView({
      nodes: fitViewNodes,
      width: get(store.width),
      height: get(store.height),
      minZoom: get(store.minZoom),
      maxZoom: get(store.maxZoom),
      panZoom
    }, options);
  }
  function fitViewSync(options) {
    const panZoom = get(store.panZoom);
    if (!panZoom) {
      return false;
    }
    const fitViewNodes = getFitViewNodes(get(store.nodeLookup), options);
    fitView({
      nodes: fitViewNodes,
      width: get(store.width),
      height: get(store.height),
      minZoom: get(store.minZoom),
      maxZoom: get(store.maxZoom),
      panZoom
    }, options);
    return fitViewNodes.size > 0;
  }
  function zoomBy(factor, options) {
    const panZoom = get(store.panZoom);
    if (!panZoom) {
      return Promise.resolve(false);
    }
    return panZoom.scaleBy(factor, options);
  }
  function zoomIn(options) {
    return zoomBy(1.2, options);
  }
  function zoomOut(options) {
    return zoomBy(1 / 1.2, options);
  }
  function setMinZoom(minZoom) {
    const panZoom = get(store.panZoom);
    if (panZoom) {
      panZoom.setScaleExtent([minZoom, get(store.maxZoom)]);
      store.minZoom.set(minZoom);
    }
  }
  function setMaxZoom(maxZoom) {
    const panZoom = get(store.panZoom);
    if (panZoom) {
      panZoom.setScaleExtent([get(store.minZoom), maxZoom]);
      store.maxZoom.set(maxZoom);
    }
  }
  function setTranslateExtent(extent) {
    const panZoom = get(store.panZoom);
    if (panZoom) {
      panZoom.setTranslateExtent(extent);
      store.translateExtent.set(extent);
    }
  }
  function resetSelectedElements(elements) {
    let elementsChanged = false;
    elements.forEach((element) => {
      if (element.selected) {
        element.selected = false;
        elementsChanged = true;
      }
    });
    return elementsChanged;
  }
  function setPaneClickDistance(distance) {
    get(store.panZoom)?.setClickDistance(distance);
  }
  function unselectNodesAndEdges(params) {
    const resetNodes = resetSelectedElements(params?.nodes || get(store.nodes));
    if (resetNodes)
      store.nodes.set(get(store.nodes));
    const resetEdges = resetSelectedElements(params?.edges || get(store.edges));
    if (resetEdges)
      store.edges.set(get(store.edges));
  }
  store.deleteKeyPressed.subscribe(async (deleteKeyPressed) => {
    if (deleteKeyPressed) {
      const nodes2 = get(store.nodes);
      const edges2 = get(store.edges);
      const selectedNodes = nodes2.filter((node) => node.selected);
      const selectedEdges = edges2.filter((edge) => edge.selected);
      const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
        nodesToRemove: selectedNodes,
        edgesToRemove: selectedEdges,
        nodes: nodes2,
        edges: edges2,
        onBeforeDelete: get(store.onbeforedelete)
      });
      if (matchingNodes.length || matchingEdges.length) {
        store.nodes.update((nds) => nds.filter((node) => !matchingNodes.some((mN) => mN.id === node.id)));
        store.edges.update((eds) => eds.filter((edge) => !matchingEdges.some((mE) => mE.id === edge.id)));
        get(store.ondelete)?.({
          nodes: matchingNodes,
          edges: matchingEdges
        });
      }
    }
  });
  function addSelectedNodes(ids) {
    const isMultiSelection = get(store.multiselectionKeyPressed);
    store.nodes.update((ns) => ns.map((node) => {
      const nodeWillBeSelected = ids.includes(node.id);
      const selected = isMultiSelection ? node.selected || nodeWillBeSelected : nodeWillBeSelected;
      node.selected = selected;
      return node;
    }));
    if (!isMultiSelection) {
      store.edges.update((es) => es.map((edge) => {
        edge.selected = false;
        return edge;
      }));
    }
  }
  function addSelectedEdges(ids) {
    const isMultiSelection = get(store.multiselectionKeyPressed);
    store.edges.update((edges2) => edges2.map((edge) => {
      const edgeWillBeSelected = ids.includes(edge.id);
      const selected = isMultiSelection ? edge.selected || edgeWillBeSelected : edgeWillBeSelected;
      edge.selected = selected;
      return edge;
    }));
    if (!isMultiSelection) {
      store.nodes.update((ns) => ns.map((node) => {
        node.selected = false;
        return node;
      }));
    }
  }
  function handleNodeSelection(id) {
    const node = get(store.nodes)?.find((n) => n.id === id);
    if (!node) {
      console.warn("012", errorMessages["error012"](id));
      return;
    }
    store.selectionRect.set(null);
    store.selectionRectMode.set(null);
    if (!node.selected) {
      addSelectedNodes([id]);
    } else if (node.selected && get(store.multiselectionKeyPressed)) {
      unselectNodesAndEdges({ nodes: [node], edges: [] });
    }
  }
  function panBy$1(delta) {
    const viewport = get(store.viewport);
    return panBy({
      delta,
      panZoom: get(store.panZoom),
      transform: [viewport.x, viewport.y, viewport.zoom],
      translateExtent: get(store.translateExtent),
      width: get(store.width),
      height: get(store.height)
    });
  }
  const _connection = writable(initialConnection);
  const updateConnection = (newConnection) => {
    _connection.set({ ...newConnection });
  };
  function cancelConnection() {
    _connection.set(initialConnection);
  }
  function reset() {
    store.fitViewOnInitDone.set(false);
    store.selectionRect.set(null);
    store.selectionRectMode.set(null);
    store.snapGrid.set(null);
    store.isValidConnection.set(() => true);
    unselectNodesAndEdges();
    cancelConnection();
  }
  return {
    // state
    ...store,
    // derived state
    visibleEdges: getVisibleEdges(store),
    visibleNodes: getVisibleNodes(store),
    connection: derived([_connection, store.viewport], ([connection, viewport]) => {
      return connection.inProgress ? {
        ...connection,
        to: pointToRendererPoint(connection.to, [viewport.x, viewport.y, viewport.zoom])
      } : { ...connection };
    }),
    markers: derived([store.edges, store.defaultMarkerColor, store.flowId], ([edges2, defaultColor, id]) => createMarkerIds(edges2, { defaultColor, id })),
    initialized: (() => {
      let initialized = false;
      const initialNodesLength = get(store.nodes).length;
      const initialEdgesLength = get(store.edges).length;
      return derived([store.nodesInitialized, store.edgesInitialized, store.viewportInitialized], ([nodesInitialized, edgesInitialized, viewportInitialized]) => {
        if (initialized)
          return initialized;
        if (initialNodesLength === 0) {
          initialized = viewportInitialized;
        } else if (initialEdgesLength === 0) {
          initialized = viewportInitialized && nodesInitialized;
        } else {
          initialized = viewportInitialized && nodesInitialized && edgesInitialized;
        }
        return initialized;
      });
    })(),
    // actions
    syncNodeStores: (nodes2) => syncNodeStores(store.nodes, nodes2),
    syncEdgeStores: (edges2) => syncEdgeStores(store.edges, edges2),
    syncViewport: (viewport) => syncViewportStores(store.panZoom, store.viewport, viewport),
    setNodeTypes,
    setEdgeTypes,
    addEdge: addEdge$1,
    updateNodePositions,
    updateNodeInternals: updateNodeInternals$1,
    zoomIn,
    zoomOut,
    fitView: (options) => fitView$1(options),
    setMinZoom,
    setMaxZoom,
    setTranslateExtent,
    setPaneClickDistance,
    unselectNodesAndEdges,
    addSelectedNodes,
    addSelectedEdges,
    handleNodeSelection,
    panBy: panBy$1,
    updateConnection,
    cancelConnection,
    reset
  };
}
function useStore() {
  const store = getContext(key);
  if (!store) {
    throw new Error("In order to use useStore you need to wrap your component in a <SvelteFlowProvider />");
  }
  return store.getStore();
}
function createStoreContext({ nodes, edges, width, height, fitView: fitView2, nodeOrigin, nodeExtent }) {
  const store = createStore({ nodes, edges, width, height, fitView: fitView2, nodeOrigin, nodeExtent });
  setContext(key, {
    getStore: () => store
  });
  return store;
}
function Zoom($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let initialViewport = fallback($$props["initialViewport"], void 0);
    let onMoveStart = fallback($$props["onMoveStart"], void 0);
    let onMove = fallback($$props["onMove"], void 0);
    let onMoveEnd = fallback($$props["onMoveEnd"], void 0);
    let panOnScrollMode = $$props["panOnScrollMode"];
    let preventScrolling = $$props["preventScrolling"];
    let zoomOnScroll = $$props["zoomOnScroll"];
    let zoomOnDoubleClick = $$props["zoomOnDoubleClick"];
    let zoomOnPinch = $$props["zoomOnPinch"];
    let panOnDrag = $$props["panOnDrag"];
    let panOnScroll = $$props["panOnScroll"];
    let paneClickDistance = $$props["paneClickDistance"];
    const {
      viewport,
      panZoom,
      selectionRect,
      minZoom,
      maxZoom,
      dragging,
      translateExtent,
      lib,
      panActivationKeyPressed,
      zoomActivationKeyPressed,
      viewportInitialized
    } = useStore();
    store_get($$store_subs ??= {}, "$panActivationKeyPressed", panActivationKeyPressed) || panOnDrag;
    store_get($$store_subs ??= {}, "$panActivationKeyPressed", panActivationKeyPressed) || panOnScroll;
    $$renderer2.push(`<div class="svelte-flow__zoom svelte-1vl0uat"><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      initialViewport,
      onMoveStart,
      onMove,
      onMoveEnd,
      panOnScrollMode,
      preventScrolling,
      zoomOnScroll,
      zoomOnDoubleClick,
      zoomOnPinch,
      panOnDrag,
      panOnScroll,
      paneClickDistance
    });
  });
}
function Pane($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let _panOnDrag, isSelecting;
    let panOnDrag = fallback($$props["panOnDrag"], void 0);
    let selectionOnDrag = fallback($$props["selectionOnDrag"], void 0);
    const {
      nodes,
      nodeLookup,
      edges,
      viewport,
      dragging,
      elementsSelectable,
      selectionRect,
      selectionRectMode,
      selectionKeyPressed,
      selectionMode,
      panActivationKeyPressed,
      unselectNodesAndEdges
    } = useStore();
    _panOnDrag = store_get($$store_subs ??= {}, "$panActivationKeyPressed", panActivationKeyPressed) || panOnDrag;
    isSelecting = store_get($$store_subs ??= {}, "$selectionKeyPressed", selectionKeyPressed) || store_get($$store_subs ??= {}, "$selectionRect", selectionRect) || selectionOnDrag && _panOnDrag !== true;
    store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable) && (isSelecting || store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "user");
    $$renderer2.push(`<div${attr_class("svelte-flow__pane svelte-j55c5z", void 0, {
      "draggable": panOnDrag === true || Array.isArray(panOnDrag) && panOnDrag.includes(0),
      "dragging": store_get($$store_subs ??= {}, "$dragging", dragging),
      "selection": isSelecting
    })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { panOnDrag, selectionOnDrag });
  });
}
function Viewport($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { viewport } = useStore();
    $$renderer2.push(`<div class="svelte-flow__viewport xyflow__viewport svelte-tjeeg3"${attr_style(`transform: translate(${stringify(store_get($$store_subs ??= {}, "$viewport", viewport).x)}px, ${stringify(store_get($$store_subs ??= {}, "$viewport", viewport).y)}px) scale(${stringify(store_get($$store_subs ??= {}, "$viewport", viewport).zoom)})`)}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function getNodeInlineStyleDimensions({ width, height, initialWidth, initialHeight, measuredWidth, measuredHeight }) {
  if (measuredWidth === void 0 && measuredHeight === void 0) {
    const styleWidth = width ?? initialWidth;
    const styleHeight = height ?? initialHeight;
    return {
      width: styleWidth ? `width:${styleWidth}px;` : "",
      height: styleHeight ? `height:${styleHeight}px;` : ""
    };
  }
  return {
    width: width ? `width:${width}px;` : "",
    height: height ? `height:${height}px;` : ""
  };
}
function NodeWrapper($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let nodeType, nodeTypeValid, nodeComponent, inlineStyleDimensions;
    let node = $$props["node"];
    let id = $$props["id"];
    let data = fallback($$props["data"], () => ({}), true);
    let selected = fallback($$props["selected"], false);
    let draggable = fallback($$props["draggable"], void 0);
    let selectable = fallback($$props["selectable"], void 0);
    let connectable = fallback($$props["connectable"], true);
    let deletable = fallback($$props["deletable"], true);
    let hidden = fallback($$props["hidden"], false);
    let dragging = fallback($$props["dragging"], false);
    let resizeObserver = fallback($$props["resizeObserver"], null);
    let style = fallback($$props["style"], void 0);
    let type = fallback($$props["type"], "default");
    let isParent = fallback($$props["isParent"], false);
    let positionX = $$props["positionX"];
    let positionY = $$props["positionY"];
    let sourcePosition = fallback($$props["sourcePosition"], void 0);
    let targetPosition = fallback($$props["targetPosition"], void 0);
    let zIndex = $$props["zIndex"];
    let measuredWidth = fallback($$props["measuredWidth"], void 0);
    let measuredHeight = fallback($$props["measuredHeight"], void 0);
    let initialWidth = fallback($$props["initialWidth"], void 0);
    let initialHeight = fallback($$props["initialHeight"], void 0);
    let width = fallback($$props["width"], void 0);
    let height = fallback($$props["height"], void 0);
    let dragHandle = fallback($$props["dragHandle"], void 0);
    let initialized = fallback($$props["initialized"], false);
    let parentId = fallback($$props["parentId"], void 0);
    let nodeClickDistance = fallback($$props["nodeClickDistance"], void 0);
    let className = fallback($$props["class"], "");
    const store = useStore();
    const {
      nodeTypes,
      nodeDragThreshold,
      selectNodesOnDrag,
      handleNodeSelection,
      updateNodeInternals: updateNodeInternals2
    } = store;
    let nodeRef;
    let prevNodeRef = null;
    const connectableStore = writable(connectable);
    let prevType = void 0;
    let prevSourcePosition = void 0;
    let prevTargetPosition = void 0;
    setContext("svelteflow__node_id", id);
    setContext("svelteflow__node_connectable", connectableStore);
    onDestroy(() => {
      if (prevNodeRef) {
        resizeObserver?.unobserve(prevNodeRef);
      }
    });
    nodeType = type || "default";
    nodeTypeValid = !!store_get($$store_subs ??= {}, "$nodeTypes", nodeTypes)[nodeType];
    nodeComponent = store_get($$store_subs ??= {}, "$nodeTypes", nodeTypes)[nodeType] || DefaultNode;
    {
      if (!nodeTypeValid) {
        console.warn("003", errorMessages["error003"](type));
      }
    }
    inlineStyleDimensions = getNodeInlineStyleDimensions({
      width,
      height,
      initialWidth,
      initialHeight,
      measuredWidth,
      measuredHeight
    });
    {
      connectableStore.set(!!connectable);
    }
    {
      const doUpdate = prevType && nodeType !== prevType || prevSourcePosition && sourcePosition !== prevSourcePosition || prevTargetPosition && targetPosition !== prevTargetPosition;
      if (doUpdate) {
        requestAnimationFrame(() => updateNodeInternals2(/* @__PURE__ */ new Map([[id, { id, nodeElement: nodeRef, force: true }]])));
      }
      prevType = nodeType;
      prevSourcePosition = sourcePosition;
      prevTargetPosition = targetPosition;
    }
    {
      if (resizeObserver && (nodeRef !== prevNodeRef || !initialized)) {
        prevNodeRef && resizeObserver.unobserve(prevNodeRef);
        prevNodeRef = nodeRef;
      }
    }
    if (
      // this handler gets called by XYDrag on drag start when selectNodesOnDrag=true
      // here we only need to call it when selectNodesOnDrag=false
      !hidden
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("data-id", id)}${attr_class(
        clsx(cc([
          "svelte-flow__node",
          `svelte-flow__node-${nodeType}`,
          className
        ])),
        void 0,
        {
          "dragging": dragging,
          "selected": selected,
          "draggable": draggable,
          "connectable": connectable,
          "selectable": selectable,
          "nopan": draggable,
          "parent": isParent
        }
      )}${attr_style(`${stringify(style ?? "")};${stringify(inlineStyleDimensions.width)}${stringify(inlineStyleDimensions.height)}`, {
        "z-index": zIndex,
        transform: `translate(${stringify(positionX)}px, ${stringify(positionY)}px)`,
        visibility: initialized ? "visible" : "hidden"
      })}><!---->`);
      nodeComponent?.($$renderer2, {
        data,
        id,
        selected,
        selectable,
        deletable,
        sourcePosition,
        targetPosition,
        zIndex,
        dragging,
        draggable,
        dragHandle,
        parentId,
        type: nodeType,
        isConnectable: store_get($$store_subs ??= {}, "$connectableStore", connectableStore),
        positionAbsoluteX: positionX,
        positionAbsoluteY: positionY,
        width,
        height
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      node,
      id,
      data,
      selected,
      draggable,
      selectable,
      connectable,
      deletable,
      hidden,
      dragging,
      resizeObserver,
      style,
      type,
      isParent,
      positionX,
      positionY,
      sourcePosition,
      targetPosition,
      zIndex,
      measuredWidth,
      measuredHeight,
      initialWidth,
      initialHeight,
      width,
      height,
      dragHandle,
      initialized,
      parentId,
      nodeClickDistance,
      class: className
    });
  });
}
function NodeRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let nodeClickDistance = fallback($$props["nodeClickDistance"], 0);
    const {
      visibleNodes,
      nodesDraggable,
      nodesConnectable,
      elementsSelectable,
      updateNodeInternals: updateNodeInternals2,
      parentLookup
    } = useStore();
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver((entries) => {
      const updates = /* @__PURE__ */ new Map();
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("data-id");
        updates.set(id, { id, nodeElement: entry.target, force: true });
      });
      updateNodeInternals2(updates);
    });
    onDestroy(() => {
      resizeObserver?.disconnect();
    });
    $$renderer2.push(`<div class="svelte-flow__nodes svelte-v0zrhd"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$visibleNodes", visibleNodes));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let node = each_array[$$index];
      NodeWrapper($$renderer2, {
        node,
        id: node.id,
        data: node.data,
        selected: !!node.selected,
        hidden: !!node.hidden,
        draggable: !!(node.draggable || store_get($$store_subs ??= {}, "$nodesDraggable", nodesDraggable) && typeof node.draggable === "undefined"),
        selectable: !!(node.selectable || store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable) && typeof node.selectable === "undefined"),
        connectable: !!(node.connectable || store_get($$store_subs ??= {}, "$nodesConnectable", nodesConnectable) && typeof node.connectable === "undefined"),
        deletable: node.deletable ?? true,
        positionX: node.internals.positionAbsolute.x,
        positionY: node.internals.positionAbsolute.y,
        isParent: store_get($$store_subs ??= {}, "$parentLookup", parentLookup).has(node.id),
        style: node.style,
        class: node.class,
        type: node.type ?? "default",
        sourcePosition: node.sourcePosition,
        targetPosition: node.targetPosition,
        dragging: node.dragging,
        zIndex: node.internals.z ?? 0,
        dragHandle: node.dragHandle,
        initialized: nodeHasDimensions(node),
        width: node.width,
        height: node.height,
        initialWidth: node.initialWidth,
        initialHeight: node.initialHeight,
        measuredWidth: node.measured.width,
        measuredHeight: node.measured.height,
        parentId: node.parentId,
        resizeObserver,
        nodeClickDistance
      });
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { nodeClickDistance });
  });
}
function EdgeWrapper($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let edgeType, edgeComponent, markerStartUrl, markerEndUrl, isSelectable;
    let id = $$props["id"];
    let type = fallback($$props["type"], "default");
    let source = fallback($$props["source"], "");
    let target = fallback($$props["target"], "");
    let data = fallback($$props["data"], () => ({}), true);
    let style = fallback($$props["style"], void 0);
    let zIndex = fallback($$props["zIndex"], void 0);
    let animated = fallback($$props["animated"], false);
    let selected = fallback($$props["selected"], false);
    let selectable = fallback($$props["selectable"], void 0);
    let deletable = fallback($$props["deletable"], void 0);
    let hidden = fallback($$props["hidden"], false);
    let label = fallback($$props["label"], void 0);
    let labelStyle = fallback($$props["labelStyle"], void 0);
    let markerStart = fallback($$props["markerStart"], void 0);
    let markerEnd = fallback($$props["markerEnd"], void 0);
    let sourceHandle = fallback($$props["sourceHandle"], void 0);
    let targetHandle = fallback($$props["targetHandle"], void 0);
    let sourceX = $$props["sourceX"];
    let sourceY = $$props["sourceY"];
    let targetX = $$props["targetX"];
    let targetY = $$props["targetY"];
    let sourcePosition = $$props["sourcePosition"];
    let targetPosition = $$props["targetPosition"];
    let ariaLabel = fallback($$props["ariaLabel"], void 0);
    let interactionWidth = fallback($$props["interactionWidth"], void 0);
    let className = fallback($$props["class"], "");
    setContext("svelteflow__edge_id", id);
    const { edgeLookup, edgeTypes, flowId, elementsSelectable } = useStore();
    useHandleEdgeSelect();
    edgeType = type || "default";
    edgeComponent = store_get($$store_subs ??= {}, "$edgeTypes", edgeTypes)[edgeType] || BezierEdgeInternal;
    markerStartUrl = markerStart ? `url('#${getMarkerId(markerStart, store_get($$store_subs ??= {}, "$flowId", flowId))}')` : void 0;
    markerEndUrl = markerEnd ? `url('#${getMarkerId(markerEnd, store_get($$store_subs ??= {}, "$flowId", flowId))}')` : void 0;
    isSelectable = selectable ?? store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable);
    if (!hidden) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<svg${attr_style("", { "z-index": zIndex })}><g${attr_class(clsx(cc(["svelte-flow__edge", className])), void 0, {
        "animated": animated,
        "selected": selected,
        "selectable": isSelectable
      })}${attr("data-id", id)}${attr("aria-label", ariaLabel === null ? void 0 : ariaLabel ? ariaLabel : `Edge from ${source} to ${target}`)} role="img"><!---->`);
      edgeComponent?.($$renderer2, {
        id,
        source,
        target,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        animated,
        selected,
        label,
        labelStyle,
        data,
        style,
        interactionWidth,
        selectable: isSelectable,
        deletable: deletable ?? true,
        type: edgeType,
        sourceHandleId: sourceHandle,
        targetHandleId: targetHandle,
        markerStart: markerStartUrl,
        markerEnd: markerEndUrl
      });
      $$renderer2.push(`<!----></g></svg>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      type,
      source,
      target,
      data,
      style,
      zIndex,
      animated,
      selected,
      selectable,
      deletable,
      hidden,
      label,
      labelStyle,
      markerStart,
      markerEnd,
      sourceHandle,
      targetHandle,
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      ariaLabel,
      interactionWidth,
      class: className
    });
  });
}
function CallOnMount($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let _onMount = fallback($$props["onMount"], void 0);
    let _onDestroy = fallback($$props["onDestroy"], void 0);
    bind_props($$props, { onMount: _onMount, onDestroy: _onDestroy });
  });
}
function MarkerDefinition($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { markers } = useStore();
    $$renderer2.push(`<defs><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$markers", markers));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let marker = each_array[$$index];
      Marker($$renderer2, spread_props([marker]));
    }
    $$renderer2.push(`<!--]--></defs>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Marker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let id = $$props["id"];
    let type = $$props["type"];
    let width = fallback($$props["width"], 12.5);
    let height = fallback($$props["height"], 12.5);
    let markerUnits = fallback($$props["markerUnits"], "strokeWidth");
    let orient = fallback($$props["orient"], "auto-start-reverse");
    let color = fallback($$props["color"], void 0);
    let strokeWidth = fallback($$props["strokeWidth"], void 0);
    $$renderer2.push(`<marker class="svelte-flow__arrowhead"${attr("id", id)}${attr("markerWidth", `${width}`)}${attr("markerHeight", `${height}`)} viewBox="-10 -10 20 20"${attr("markerUnits", markerUnits)}${attr("orient", orient)} refX="0" refY="0">`);
    if (type === MarkerType.Arrow) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<polyline${attr("stroke", color)} stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} fill="none" points="-5,-4 0,0 -5,4"></polyline>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (type === MarkerType.ArrowClosed) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<polyline${attr("stroke", color)} stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)}${attr("fill", color)} points="-5,-4 0,0 -5,4 -5,-4"></polyline>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></marker>`);
    bind_props($$props, {
      id,
      type,
      width,
      height,
      markerUnits,
      orient,
      color,
      strokeWidth
    });
  });
}
function EdgeRenderer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let defaultEdgeOptions = $$props["defaultEdgeOptions"];
    const {
      visibleEdges,
      edgesInitialized,
      edges: { setDefaultOptions },
      elementsSelectable
    } = useStore();
    $$renderer2.push(`<div class="svelte-flow__edges"><svg class="svelte-flow__marker">`);
    MarkerDefinition($$renderer2);
    $$renderer2.push(`<!----></svg> <!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$visibleEdges", visibleEdges));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let edge = each_array[$$index];
      EdgeWrapper($$renderer2, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.data,
        style: edge.style,
        animated: edge.animated,
        selected: edge.selected,
        selectable: edge.selectable ?? store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable),
        deletable: edge.deletable,
        hidden: edge.hidden,
        label: edge.label,
        labelStyle: edge.labelStyle,
        markerStart: edge.markerStart,
        markerEnd: edge.markerEnd,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        sourceX: edge.sourceX,
        sourceY: edge.sourceY,
        targetX: edge.targetX,
        targetY: edge.targetY,
        sourcePosition: edge.sourcePosition,
        targetPosition: edge.targetPosition,
        ariaLabel: edge.ariaLabel,
        interactionWidth: edge.interactionWidth,
        class: edge.class,
        type: edge.type || "default",
        zIndex: edge.zIndex
      });
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$visibleEdges", visibleEdges).length > 0) {
      $$renderer2.push("<!--[-->");
      CallOnMount($$renderer2, {
        onMount: () => {
          store_set(edgesInitialized, true);
        },
        onDestroy: () => {
          store_set(edgesInitialized, false);
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { defaultEdgeOptions });
  });
}
function Selection($$renderer, $$props) {
  let x = fallback($$props["x"], 0);
  let y = fallback($$props["y"], 0);
  let width = fallback($$props["width"], 0);
  let height = fallback($$props["height"], 0);
  let isVisible = fallback($$props["isVisible"], true);
  if (isVisible) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="svelte-flow__selection svelte-1vr3gfi"${attr_style("", {
      width: typeof width === "string" ? width : `${width}px`,
      height: typeof height === "string" ? height : `${height}px`,
      transform: `translate(${x}px, ${y}px)`
    })}></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
  bind_props($$props, { x, y, width, height, isVisible });
}
function UserSelection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const { selectionRect, selectionRectMode } = useStore();
    Selection($$renderer2, {
      isVisible: !!(store_get($$store_subs ??= {}, "$selectionRect", selectionRect) && store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "user"),
      width: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.width,
      height: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.height,
      x: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.x,
      y: store_get($$store_subs ??= {}, "$selectionRect", selectionRect)?.y
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function NodeSelection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const store = useStore();
    const { selectionRectMode, nodes, nodeLookup } = store;
    let bounds = null;
    if (store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "nodes") {
      bounds = getInternalNodesBounds(store_get($$store_subs ??= {}, "$nodeLookup", nodeLookup), { filter: (node) => !!node.selected });
      store_get($$store_subs ??= {}, "$nodes", nodes);
    }
    if (store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) === "nodes" && bounds && isNumeric(bounds.x) && isNumeric(bounds.y)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="selection-wrapper nopan svelte-sf2y5e"${attr_style(`width: ${stringify(bounds.width)}px; height: ${stringify(bounds.height)}px; transform: translate(${stringify(bounds.x)}px, ${stringify(bounds.y)}px)`)} role="button" tabindex="-1">`);
      Selection($$renderer2, { width: "100%", height: "100%", x: 0, y: 0 });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function KeyHandler($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectionKey = fallback($$props["selectionKey"], "Shift");
    let multiSelectionKey = fallback($$props["multiSelectionKey"], () => isMacOs() ? "Meta" : "Control", true);
    let deleteKey = fallback($$props["deleteKey"], "Backspace");
    let panActivationKey = fallback($$props["panActivationKey"], " ");
    let zoomActivationKey = fallback($$props["zoomActivationKey"], () => isMacOs() ? "Meta" : "Control", true);
    useStore();
    bind_props($$props, {
      selectionKey,
      multiSelectionKey,
      deleteKey,
      panActivationKey,
      zoomActivationKey
    });
  });
}
function ConnectionLine($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let containerStyle = fallback($$props["containerStyle"], "");
    let style = fallback($$props["style"], "");
    let isCustomComponent = fallback($$props["isCustomComponent"], false);
    const { width, height, connection, connectionLineType } = useStore();
    let path = null;
    if (store_get($$store_subs ??= {}, "$connection", connection).inProgress && !isCustomComponent) {
      const { from, to, fromPosition, toPosition } = store_get($$store_subs ??= {}, "$connection", connection);
      const pathParams = {
        sourceX: from.x,
        sourceY: from.y,
        sourcePosition: fromPosition,
        targetX: to.x,
        targetY: to.y,
        targetPosition: toPosition
      };
      switch (store_get($$store_subs ??= {}, "$connectionLineType", connectionLineType)) {
        case ConnectionLineType.Bezier:
          [path] = getBezierPath(pathParams);
          break;
        case ConnectionLineType.Step:
          [path] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
          break;
        case ConnectionLineType.SmoothStep:
          [path] = getSmoothStepPath(pathParams);
          break;
        default:
          [path] = getStraightPath(pathParams);
      }
    }
    if (store_get($$store_subs ??= {}, "$connection", connection).inProgress) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<svg${attr("width", store_get($$store_subs ??= {}, "$width", width))}${attr("height", store_get($$store_subs ??= {}, "$height", height))} class="svelte-flow__connectionline"${attr_style(containerStyle)}><g${attr_class(clsx(cc([
        "svelte-flow__connection",
        getConnectionStatus(store_get($$store_subs ??= {}, "$connection", connection).isValid)
      ])))}><!--[-->`);
      slot($$renderer2, $$props, "connectionLine", {}, null);
      $$renderer2.push(`<!--]-->`);
      if (!isCustomComponent) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<path${attr("d", path)}${attr_style(style)} fill="none" class="svelte-flow__connection-path"></path>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></g></svg>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { containerStyle, style, isCustomComponent });
  });
}
function Panel($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["position", "style", "class"]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let positionClasses;
    let position = fallback($$props["position"], "top-right");
    let style = fallback($$props["style"], void 0);
    let className = fallback($$props["class"], void 0);
    const { selectionRectMode } = useStore();
    positionClasses = `${position}`.split("-");
    $$renderer2.push(`<div${attributes(
      {
        class: clsx(cc(["svelte-flow__panel", className, ...positionClasses])),
        style,
        ...$$restProps
      },
      void 0,
      void 0,
      {
        "pointer-events": store_get($$store_subs ??= {}, "$selectionRectMode", selectionRectMode) ? "none" : ""
      }
    )}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { position, style, class: className });
  });
}
function Attribution($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let proOptions = fallback($$props["proOptions"], void 0);
    let position = fallback($$props["position"], "bottom-right");
    if (!proOptions?.hideAttribution) {
      $$renderer2.push("<!--[-->");
      Panel($$renderer2, {
        position,
        class: "svelte-flow__attribution",
        "data-message": "Feel free to remove the attribution or check out how you could support us: https://svelteflow.dev/support-us",
        children: ($$renderer3) => {
          $$renderer3.push(`<a href="https://svelteflow.dev" target="_blank" rel="noopener noreferrer" aria-label="Svelte Flow attribution">Svelte Flow</a>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { proOptions, position });
  });
}
function updateStore(store, { nodeTypes, edgeTypes, minZoom, maxZoom, translateExtent, paneClickDistance }) {
  if (nodeTypes !== void 0) {
    store.setNodeTypes(nodeTypes);
  }
  if (edgeTypes !== void 0) {
    store.setEdgeTypes(edgeTypes);
  }
  if (minZoom !== void 0) {
    store.setMinZoom(minZoom);
  }
  if (maxZoom !== void 0) {
    store.setMaxZoom(maxZoom);
  }
  if (translateExtent !== void 0) {
    store.setTranslateExtent(translateExtent);
  }
  if (paneClickDistance !== void 0) {
    store.setPaneClickDistance(paneClickDistance);
  }
}
const getKeys = (obj) => Object.keys(obj);
function updateStoreByKeys(store, keys) {
  getKeys(keys).forEach((prop) => {
    const update = keys[prop];
    if (update !== void 0) {
      store[prop].set(update);
    }
  });
}
function getMediaQuery() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return null;
  }
  return window.matchMedia("(prefers-color-scheme: dark)");
}
function useColorModeClass(colorMode = "light") {
  const colorModeClass = readable("light", (set) => {
    if (colorMode !== "system") {
      set(colorMode);
      return;
    }
    const mediaQuery = getMediaQuery();
    const updateColorModeClass = () => set(mediaQuery?.matches ? "dark" : "light");
    set(mediaQuery?.matches ? "dark" : "light");
    mediaQuery?.addEventListener("change", updateColorModeClass);
    return () => {
      mediaQuery?.removeEventListener("change", updateColorModeClass);
    };
  });
  return colorModeClass;
}
function SvelteFlow($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "id",
    "nodes",
    "edges",
    "fitView",
    "fitViewOptions",
    "minZoom",
    "maxZoom",
    "initialViewport",
    "viewport",
    "nodeTypes",
    "edgeTypes",
    "selectionKey",
    "selectionMode",
    "panActivationKey",
    "multiSelectionKey",
    "zoomActivationKey",
    "nodesDraggable",
    "nodesConnectable",
    "nodeDragThreshold",
    "elementsSelectable",
    "snapGrid",
    "deleteKey",
    "connectionRadius",
    "connectionLineType",
    "connectionMode",
    "connectionLineStyle",
    "connectionLineContainerStyle",
    "onMoveStart",
    "onMove",
    "onMoveEnd",
    "isValidConnection",
    "translateExtent",
    "nodeExtent",
    "onlyRenderVisibleElements",
    "panOnScrollMode",
    "preventScrolling",
    "zoomOnScroll",
    "zoomOnDoubleClick",
    "zoomOnPinch",
    "panOnScroll",
    "panOnDrag",
    "selectionOnDrag",
    "autoPanOnConnect",
    "autoPanOnNodeDrag",
    "onerror",
    "ondelete",
    "onedgecreate",
    "attributionPosition",
    "proOptions",
    "defaultEdgeOptions",
    "width",
    "height",
    "colorMode",
    "onconnect",
    "onconnectstart",
    "onconnectend",
    "onbeforedelete",
    "oninit",
    "nodeOrigin",
    "paneClickDistance",
    "nodeClickDistance",
    "defaultMarkerColor",
    "style",
    "class"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let colorModeClass;
    let id = fallback($$props["id"], "1");
    let nodes = $$props["nodes"];
    let edges = $$props["edges"];
    let fitView2 = fallback($$props["fitView"], void 0);
    let fitViewOptions = fallback($$props["fitViewOptions"], void 0);
    let minZoom = fallback($$props["minZoom"], void 0);
    let maxZoom = fallback($$props["maxZoom"], void 0);
    let initialViewport = fallback($$props["initialViewport"], void 0);
    let viewport = fallback($$props["viewport"], void 0);
    let nodeTypes = fallback($$props["nodeTypes"], void 0);
    let edgeTypes = fallback($$props["edgeTypes"], void 0);
    let selectionKey = fallback($$props["selectionKey"], void 0);
    let selectionMode = fallback($$props["selectionMode"], void 0);
    let panActivationKey = fallback($$props["panActivationKey"], void 0);
    let multiSelectionKey = fallback($$props["multiSelectionKey"], void 0);
    let zoomActivationKey = fallback($$props["zoomActivationKey"], void 0);
    let nodesDraggable = fallback($$props["nodesDraggable"], void 0);
    let nodesConnectable = fallback($$props["nodesConnectable"], void 0);
    let nodeDragThreshold = fallback($$props["nodeDragThreshold"], void 0);
    let elementsSelectable = fallback($$props["elementsSelectable"], void 0);
    let snapGrid = fallback($$props["snapGrid"], void 0);
    let deleteKey = fallback($$props["deleteKey"], void 0);
    let connectionRadius = fallback($$props["connectionRadius"], void 0);
    let connectionLineType = fallback($$props["connectionLineType"], void 0);
    let connectionMode = fallback($$props["connectionMode"], () => ConnectionMode.Strict, true);
    let connectionLineStyle = fallback($$props["connectionLineStyle"], "");
    let connectionLineContainerStyle = fallback($$props["connectionLineContainerStyle"], "");
    let onMoveStart = fallback($$props["onMoveStart"], void 0);
    let onMove = fallback($$props["onMove"], void 0);
    let onMoveEnd = fallback($$props["onMoveEnd"], void 0);
    let isValidConnection = fallback($$props["isValidConnection"], void 0);
    let translateExtent = fallback($$props["translateExtent"], void 0);
    let nodeExtent = fallback($$props["nodeExtent"], void 0);
    let onlyRenderVisibleElements = fallback($$props["onlyRenderVisibleElements"], void 0);
    let panOnScrollMode = fallback($$props["panOnScrollMode"], () => PanOnScrollMode.Free, true);
    let preventScrolling = fallback($$props["preventScrolling"], true);
    let zoomOnScroll = fallback($$props["zoomOnScroll"], true);
    let zoomOnDoubleClick = fallback($$props["zoomOnDoubleClick"], true);
    let zoomOnPinch = fallback($$props["zoomOnPinch"], true);
    let panOnScroll = fallback($$props["panOnScroll"], false);
    let panOnDrag = fallback($$props["panOnDrag"], true);
    let selectionOnDrag = fallback($$props["selectionOnDrag"], void 0);
    let autoPanOnConnect = fallback($$props["autoPanOnConnect"], true);
    let autoPanOnNodeDrag = fallback($$props["autoPanOnNodeDrag"], true);
    let onerror = fallback($$props["onerror"], void 0);
    let ondelete = fallback($$props["ondelete"], void 0);
    let onedgecreate = fallback($$props["onedgecreate"], void 0);
    let attributionPosition = fallback($$props["attributionPosition"], void 0);
    let proOptions = fallback($$props["proOptions"], void 0);
    let defaultEdgeOptions = fallback($$props["defaultEdgeOptions"], void 0);
    let width = fallback($$props["width"], void 0);
    let height = fallback($$props["height"], void 0);
    let colorMode = fallback($$props["colorMode"], "light");
    let onconnect = fallback($$props["onconnect"], void 0);
    let onconnectstart = fallback($$props["onconnectstart"], void 0);
    let onconnectend = fallback($$props["onconnectend"], void 0);
    let onbeforedelete = fallback($$props["onbeforedelete"], void 0);
    let oninit = fallback($$props["oninit"], void 0);
    let nodeOrigin = fallback($$props["nodeOrigin"], void 0);
    let paneClickDistance = fallback($$props["paneClickDistance"], 0);
    let nodeClickDistance = fallback($$props["nodeClickDistance"], 0);
    let defaultMarkerColor = fallback($$props["defaultMarkerColor"], "#b1b1b7");
    let style = fallback($$props["style"], void 0);
    let className = fallback($$props["class"], void 0);
    const initViewport = store_get($$store_subs ??= {}, "$viewport", viewport) || initialViewport;
    const store = hasContext(key) ? useStore() : createStoreContext({
      nodes: get(nodes),
      edges: get(edges),
      width,
      height,
      fitView: fitView2,
      nodeOrigin,
      nodeExtent
    });
    const { initialized } = store;
    let onInitCalled = false;
    {
      if (!onInitCalled && store_get($$store_subs ??= {}, "$initialized", initialized)) {
        oninit?.();
        onInitCalled = true;
      }
    }
    {
      const updatableProps = {
        flowId: id,
        connectionLineType,
        connectionRadius,
        selectionMode,
        snapGrid,
        defaultMarkerColor,
        nodesDraggable,
        nodesConnectable,
        elementsSelectable,
        onlyRenderVisibleElements,
        isValidConnection,
        autoPanOnConnect,
        autoPanOnNodeDrag,
        onerror,
        ondelete,
        onedgecreate,
        connectionMode,
        nodeDragThreshold,
        onconnect,
        onconnectstart,
        onconnectend,
        onbeforedelete,
        nodeOrigin
      };
      updateStoreByKeys(store, updatableProps);
    }
    updateStore(store, {
      nodeTypes,
      edgeTypes,
      minZoom,
      maxZoom,
      translateExtent,
      paneClickDistance
    });
    colorModeClass = useColorModeClass(colorMode);
    $$renderer2.push(`<div${attributes(
      {
        style,
        class: clsx(cc([
          "svelte-flow",
          className,
          store_get($$store_subs ??= {}, "$colorModeClass", colorModeClass)
        ])),
        "data-testid": "svelte-flow__wrapper",
        ...$$restProps,
        role: "application"
      },
      "svelte-4xqsnx"
    )}>`);
    KeyHandler($$renderer2, {
      selectionKey,
      deleteKey,
      panActivationKey,
      multiSelectionKey,
      zoomActivationKey
    });
    $$renderer2.push(`<!----> `);
    Zoom($$renderer2, {
      initialViewport: initViewport,
      onMoveStart,
      onMove,
      onMoveEnd,
      panOnScrollMode: panOnScrollMode === void 0 ? PanOnScrollMode.Free : panOnScrollMode,
      preventScrolling: preventScrolling === void 0 ? true : preventScrolling,
      zoomOnScroll: zoomOnScroll === void 0 ? true : zoomOnScroll,
      zoomOnDoubleClick: zoomOnDoubleClick === void 0 ? true : zoomOnDoubleClick,
      zoomOnPinch: zoomOnPinch === void 0 ? true : zoomOnPinch,
      panOnScroll: panOnScroll === void 0 ? false : panOnScroll,
      panOnDrag: panOnDrag === void 0 ? true : panOnDrag,
      paneClickDistance: paneClickDistance === void 0 ? 0 : paneClickDistance,
      children: ($$renderer3) => {
        Pane($$renderer3, {
          panOnDrag: panOnDrag === void 0 ? true : panOnDrag,
          selectionOnDrag,
          children: ($$renderer4) => {
            Viewport($$renderer4, {
              children: ($$renderer5) => {
                EdgeRenderer($$renderer5, { defaultEdgeOptions });
                $$renderer5.push(`<!----> `);
                ConnectionLine($$renderer5, {
                  containerStyle: connectionLineContainerStyle,
                  style: connectionLineStyle,
                  isCustomComponent: $$slots.connectionLine,
                  $$slots: {
                    connectionLine: ($$renderer6) => {
                      $$renderer6.push(`<!--[-->`);
                      slot($$renderer6, $$props, "connectionLine", {}, null);
                      $$renderer6.push(`<!--]-->`);
                    }
                  }
                });
                $$renderer5.push(`<!----> <div class="svelte-flow__edgelabel-renderer"></div> <div class="svelte-flow__viewport-portal"></div> `);
                NodeRenderer($$renderer5, { nodeClickDistance });
                $$renderer5.push(`<!----> `);
                NodeSelection($$renderer5);
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            UserSelection($$renderer4);
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Attribution($$renderer2, { proOptions, position: attributionPosition });
    $$renderer2.push(`<!----> <!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      nodes,
      edges,
      fitView: fitView2,
      fitViewOptions,
      minZoom,
      maxZoom,
      initialViewport,
      viewport,
      nodeTypes,
      edgeTypes,
      selectionKey,
      selectionMode,
      panActivationKey,
      multiSelectionKey,
      zoomActivationKey,
      nodesDraggable,
      nodesConnectable,
      nodeDragThreshold,
      elementsSelectable,
      snapGrid,
      deleteKey,
      connectionRadius,
      connectionLineType,
      connectionMode,
      connectionLineStyle,
      connectionLineContainerStyle,
      onMoveStart,
      onMove,
      onMoveEnd,
      isValidConnection,
      translateExtent,
      nodeExtent,
      onlyRenderVisibleElements,
      panOnScrollMode,
      preventScrolling,
      zoomOnScroll,
      zoomOnDoubleClick,
      zoomOnPinch,
      panOnScroll,
      panOnDrag,
      selectionOnDrag,
      autoPanOnConnect,
      autoPanOnNodeDrag,
      onerror,
      ondelete,
      onedgecreate,
      attributionPosition,
      proOptions,
      defaultEdgeOptions,
      width,
      height,
      colorMode,
      onconnect,
      onconnectstart,
      onconnectend,
      onbeforedelete,
      oninit,
      nodeOrigin,
      paneClickDistance,
      nodeClickDistance,
      defaultMarkerColor,
      style,
      class: className
    });
  });
}
function SvelteFlowProvider($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let initialNodes = fallback($$props["initialNodes"], void 0);
    let initialEdges = fallback($$props["initialEdges"], void 0);
    let initialWidth = fallback($$props["initialWidth"], void 0);
    let initialHeight = fallback($$props["initialHeight"], void 0);
    let fitView2 = fallback($$props["fitView"], void 0);
    let nodeOrigin = fallback($$props["nodeOrigin"], void 0);
    const store = createStore({
      nodes: initialNodes,
      edges: initialEdges,
      width: initialWidth,
      height: initialHeight,
      nodeOrigin,
      fitView: fitView2
    });
    setContext(key, { getStore: () => store });
    onDestroy(() => {
      store.reset();
    });
    $$renderer2.push(`<!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      initialNodes,
      initialEdges,
      initialWidth,
      initialHeight,
      fitView: fitView2,
      nodeOrigin
    });
  });
}
function ControlButton($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["class"]);
  $$renderer.component(($$renderer2) => {
    let className = fallback($$props["class"], void 0);
    let bgColor = void 0;
    let bgColorHover = void 0;
    let color = void 0;
    let colorHover = void 0;
    let borderColor = void 0;
    $$renderer2.push(`<button${attributes(
      {
        type: "button",
        class: clsx(cc(["svelte-flow__controls-button", className])),
        ...$$restProps
      },
      void 0,
      void 0,
      {
        "--xy-controls-button-background-color-props": bgColor,
        "--xy-controls-button-background-color-hover-props": bgColorHover,
        "--xy-controls-button-color-props": color,
        "--xy-controls-button-color-hover-props": colorHover,
        "--xy-controls-button-border-color-props": borderColor
      }
    )}><!--[-->`);
    slot($$renderer2, $$props, "default", { class: "button-svg" }, null);
    $$renderer2.push(`<!--]--></button>`);
    bind_props($$props, { class: className });
  });
}
function Plus($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"></path></svg>`);
}
function Minus($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5"><path d="M0 0h32v4.2H0z"></path></svg>`);
}
function Fit($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30"><path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z"></path></svg>`);
}
function Lock($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z"></path></svg>`);
}
function Unlock($$renderer) {
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z"></path></svg>`);
}
function Controls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isInteractive, minZoomReached, maxZoomReached, orientationClass;
    let position = fallback($$props["position"], "bottom-left");
    let showZoom = fallback($$props["showZoom"], true);
    let showFitView = fallback($$props["showFitView"], true);
    let showLock = fallback($$props["showLock"], true);
    let buttonBgColor = fallback($$props["buttonBgColor"], void 0);
    let buttonBgColorHover = fallback($$props["buttonBgColorHover"], void 0);
    let buttonColor = fallback($$props["buttonColor"], void 0);
    let buttonColorHover = fallback($$props["buttonColorHover"], void 0);
    let buttonBorderColor = fallback($$props["buttonBorderColor"], void 0);
    let ariaLabel = fallback($$props["ariaLabel"], void 0);
    let style = fallback($$props["style"], void 0);
    let orientation = fallback($$props["orientation"], "vertical");
    let fitViewOptions = fallback($$props["fitViewOptions"], void 0);
    let className = fallback($$props["class"], "");
    const {
      zoomIn,
      zoomOut,
      fitView: fitView2,
      viewport,
      minZoom,
      maxZoom,
      nodesDraggable,
      nodesConnectable,
      elementsSelectable
    } = useStore();
    const buttonProps = {
      bgColor: buttonBgColor,
      bgColorHover: buttonBgColorHover,
      color: buttonColor,
      colorHover: buttonColorHover,
      borderColor: buttonBorderColor
    };
    isInteractive = store_get($$store_subs ??= {}, "$nodesDraggable", nodesDraggable) || store_get($$store_subs ??= {}, "$nodesConnectable", nodesConnectable) || store_get($$store_subs ??= {}, "$elementsSelectable", elementsSelectable);
    minZoomReached = store_get($$store_subs ??= {}, "$viewport", viewport).zoom <= store_get($$store_subs ??= {}, "$minZoom", minZoom);
    maxZoomReached = store_get($$store_subs ??= {}, "$viewport", viewport).zoom >= store_get($$store_subs ??= {}, "$maxZoom", maxZoom);
    orientationClass = orientation === "horizontal" ? "horizontal" : "vertical";
    Panel($$renderer2, {
      class: cc(["svelte-flow__controls", orientationClass, className]),
      position,
      "data-testid": "svelte-flow__controls",
      "aria-label": ariaLabel ?? "Svelte Flow controls",
      style,
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        slot($$renderer3, $$props, "before", {}, null);
        $$renderer3.push(`<!--]--> `);
        if (showZoom) {
          $$renderer3.push("<!--[-->");
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-zoomin",
              title: "zoom in",
              "aria-label": "zoom in",
              disabled: maxZoomReached
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                Plus($$renderer4);
              },
              $$slots: { default: true }
            }
          ]));
          $$renderer3.push(`<!----> `);
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-zoomout",
              title: "zoom out",
              "aria-label": "zoom out",
              disabled: minZoomReached
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                Minus($$renderer4);
              },
              $$slots: { default: true }
            }
          ]));
          $$renderer3.push(`<!---->`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (showFitView) {
          $$renderer3.push("<!--[-->");
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-fitview",
              title: "fit view",
              "aria-label": "fit view"
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                Fit($$renderer4);
              },
              $$slots: { default: true }
            }
          ]));
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        if (showLock) {
          $$renderer3.push("<!--[-->");
          ControlButton($$renderer3, spread_props([
            {
              class: "svelte-flow__controls-interactive",
              title: "toggle interactivity",
              "aria-label": "toggle interactivity"
            },
            buttonProps,
            {
              children: ($$renderer4) => {
                if (isInteractive) {
                  $$renderer4.push("<!--[-->");
                  Unlock($$renderer4);
                } else {
                  $$renderer4.push("<!--[!-->");
                  Lock($$renderer4);
                }
                $$renderer4.push(`<!--]-->`);
              },
              $$slots: { default: true }
            }
          ]));
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <!--[-->`);
        slot($$renderer3, $$props, "default", {}, null);
        $$renderer3.push(`<!--]--> <!--[-->`);
        slot($$renderer3, $$props, "after", {}, null);
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      position,
      showZoom,
      showFitView,
      showLock,
      buttonBgColor,
      buttonBgColorHover,
      buttonColor,
      buttonColorHover,
      buttonBorderColor,
      ariaLabel,
      style,
      orientation,
      fitViewOptions,
      class: className
    });
  });
}
var BackgroundVariant;
(function(BackgroundVariant2) {
  BackgroundVariant2["Lines"] = "lines";
  BackgroundVariant2["Dots"] = "dots";
  BackgroundVariant2["Cross"] = "cross";
})(BackgroundVariant || (BackgroundVariant = {}));
function DotPattern($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let radius = fallback($$props["radius"], 5);
    let className = fallback($$props["class"], "");
    $$renderer2.push(`<circle${attr("cx", radius)}${attr("cy", radius)}${attr("r", radius)}${attr_class(clsx(cc(["svelte-flow__background-pattern", "dots", className])))}></circle>`);
    bind_props($$props, { radius, class: className });
  });
}
function LinePattern($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let lineWidth = fallback($$props["lineWidth"], 1);
    let dimensions = $$props["dimensions"];
    let variant = fallback($$props["variant"], void 0);
    let className = fallback($$props["class"], "");
    $$renderer2.push(`<path${attr("stroke-width", lineWidth)}${attr("d", `M${dimensions[0] / 2} 0 V${dimensions[1]} M0 ${dimensions[1] / 2} H${dimensions[0]}`)}${attr_class(clsx(cc(["svelte-flow__background-pattern", variant, className])))}></path>`);
    bind_props($$props, { lineWidth, dimensions, variant, class: className });
  });
}
const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6
};
function Background($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let patternId, scaledGap, scaledSize, patternDimensions, patternOffset;
    let id = fallback($$props["id"], void 0);
    let variant = fallback($$props["variant"], () => BackgroundVariant.Dots, true);
    let gap = fallback($$props["gap"], 20);
    let size = fallback($$props["size"], 1);
    let lineWidth = fallback($$props["lineWidth"], 1);
    let bgColor = fallback($$props["bgColor"], void 0);
    let patternColor = fallback($$props["patternColor"], void 0);
    let patternClass = fallback($$props["patternClass"], void 0);
    let className = fallback($$props["class"], "");
    const { viewport, flowId } = useStore();
    const patternSize = size || defaultSize[variant];
    const isDots = variant === BackgroundVariant.Dots;
    const isCross = variant === BackgroundVariant.Cross;
    const gapXY = Array.isArray(gap) ? gap : [gap, gap];
    patternId = `background-pattern-${store_get($$store_subs ??= {}, "$flowId", flowId)}-${id ? id : ""}`;
    scaledGap = [
      gapXY[0] * store_get($$store_subs ??= {}, "$viewport", viewport).zoom || 1,
      gapXY[1] * store_get($$store_subs ??= {}, "$viewport", viewport).zoom || 1
    ];
    scaledSize = patternSize * store_get($$store_subs ??= {}, "$viewport", viewport).zoom;
    patternDimensions = isCross ? [scaledSize, scaledSize] : scaledGap;
    patternOffset = isDots ? [scaledSize / 2, scaledSize / 2] : [patternDimensions[0] / 2, patternDimensions[1] / 2];
    $$renderer2.push(`<svg${attr_class(clsx(cc(["svelte-flow__background", className])), "svelte-11j66u4")} data-testid="svelte-flow__background"${attr_style("", {
      "--xy-background-color-props": bgColor,
      "--xy-background-pattern-color-props": patternColor
    })}><pattern${attr("id", patternId)}${attr("x", store_get($$store_subs ??= {}, "$viewport", viewport).x % scaledGap[0])}${attr("y", store_get($$store_subs ??= {}, "$viewport", viewport).y % scaledGap[1])}${attr("width", scaledGap[0])}${attr("height", scaledGap[1])} patternUnits="userSpaceOnUse"${attr("patternTransform", `translate(-${patternOffset[0]},-${patternOffset[1]})`)}>`);
    if (isDots) {
      $$renderer2.push("<!--[-->");
      DotPattern($$renderer2, { radius: scaledSize / 2, class: patternClass });
    } else {
      $$renderer2.push("<!--[!-->");
      LinePattern($$renderer2, {
        dimensions: patternDimensions,
        variant,
        lineWidth,
        class: patternClass
      });
    }
    $$renderer2.push(`<!--]--></pattern><rect x="0" y="0" width="100%" height="100%"${attr("fill", `url(#${patternId})`)}></rect></svg>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      id,
      variant,
      gap,
      size,
      lineWidth,
      bgColor,
      patternColor,
      patternClass,
      class: className
    });
  });
}
const isNode = (element) => isNodeBase(element);
function useSvelteFlow() {
  const { zoomIn, zoomOut, fitView: fitView2, onbeforedelete, snapGrid, viewport, width, height, minZoom, maxZoom, panZoom, nodes, edges, domNode, nodeLookup, nodeOrigin, edgeLookup, connectionLookup } = useStore();
  const getNodeRect = (node) => {
    const $nodeLookup = get(nodeLookup);
    const nodeToUse = isNode(node) ? node : $nodeLookup.get(node.id);
    const position = nodeToUse.parentId ? evaluateAbsolutePosition(nodeToUse.position, nodeToUse.measured, nodeToUse.parentId, $nodeLookup, get(nodeOrigin)) : nodeToUse.position;
    const nodeWithPosition = {
      id: nodeToUse.id,
      position,
      width: nodeToUse.measured?.width ?? nodeToUse.width,
      height: nodeToUse.measured?.height ?? nodeToUse.height,
      data: nodeToUse.data
    };
    return nodeToRect(nodeWithPosition);
  };
  const updateNode = (id, nodeUpdate, options = { replace: false }) => {
    const node = get(nodeLookup).get(id)?.internals.userNode;
    if (!node) {
      return;
    }
    const nextNode = typeof nodeUpdate === "function" ? nodeUpdate(node) : nodeUpdate;
    if (options.replace) {
      nodes.update((nds) => nds.map((node2) => {
        if (node2.id === id) {
          return isNode(nextNode) ? nextNode : { ...node2, ...nextNode };
        }
        return node2;
      }));
    } else {
      Object.assign(node, nextNode);
      nodes.update((nds) => nds);
    }
  };
  const getInternalNode = (id) => get(nodeLookup).get(id);
  return {
    zoomIn,
    zoomOut,
    getInternalNode,
    getNode: (id) => getInternalNode(id)?.internals.userNode,
    getNodes: (ids) => ids === void 0 ? get(nodes) : getElements(get(nodeLookup), ids),
    getEdge: (id) => get(edgeLookup).get(id),
    getEdges: (ids) => ids === void 0 ? get(edges) : getElements(get(edgeLookup), ids),
    setZoom: (zoomLevel, options) => {
      const currentPanZoom = get(panZoom);
      return currentPanZoom ? currentPanZoom.scaleTo(zoomLevel, { duration: options?.duration }) : Promise.resolve(false);
    },
    getZoom: () => get(viewport).zoom,
    setViewport: async (nextViewport, options) => {
      const currentViewport = get(viewport);
      const currentPanZoom = get(panZoom);
      if (!currentPanZoom) {
        return Promise.resolve(false);
      }
      await currentPanZoom.setViewport({
        x: nextViewport.x ?? currentViewport.x,
        y: nextViewport.y ?? currentViewport.y,
        zoom: nextViewport.zoom ?? currentViewport.zoom
      }, { duration: options?.duration });
      return Promise.resolve(true);
    },
    getViewport: () => get(viewport),
    setCenter: async (x, y, options) => {
      const nextZoom = typeof options?.zoom !== "undefined" ? options.zoom : get(maxZoom);
      const currentPanZoom = get(panZoom);
      if (!currentPanZoom) {
        return Promise.resolve(false);
      }
      await currentPanZoom.setViewport({
        x: get(width) / 2 - x * nextZoom,
        y: get(height) / 2 - y * nextZoom,
        zoom: nextZoom
      }, { duration: options?.duration });
      return Promise.resolve(true);
    },
    fitView: fitView2,
    fitBounds: async (bounds, options) => {
      const currentPanZoom = get(panZoom);
      if (!currentPanZoom) {
        return Promise.resolve(false);
      }
      const viewport2 = getViewportForBounds(bounds, get(width), get(height), get(minZoom), get(maxZoom), options?.padding ?? 0.1);
      await currentPanZoom.setViewport(viewport2, { duration: options?.duration });
      return Promise.resolve(true);
    },
    getIntersectingNodes: (nodeOrRect, partially = true, nodesToIntersect) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);
      if (!nodeRect) {
        return [];
      }
      return (nodesToIntersect || get(nodes)).filter((n) => {
        const internalNode = get(nodeLookup).get(n.id);
        if (!internalNode || !isRect && n.id === nodeOrRect.id) {
          return false;
        }
        const currNodeRect = nodeToRect(internalNode);
        const overlappingArea = getOverlappingArea(currNodeRect, nodeRect);
        const partiallyVisible = partially && overlappingArea > 0;
        return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
      });
    },
    isNodeIntersecting: (nodeOrRect, area, partially = true) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);
      if (!nodeRect) {
        return false;
      }
      const overlappingArea = getOverlappingArea(nodeRect, area);
      const partiallyVisible = partially && overlappingArea > 0;
      return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
    },
    deleteElements: async ({ nodes: nodesToRemove = [], edges: edgesToRemove = [] }) => {
      const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
        nodesToRemove,
        edgesToRemove,
        nodes: get(nodes),
        edges: get(edges),
        onBeforeDelete: get(onbeforedelete)
      });
      if (matchingNodes) {
        nodes.update((nds) => nds.filter((node) => !matchingNodes.some(({ id }) => id === node.id)));
      }
      if (matchingEdges) {
        edges.update((eds) => eds.filter((edge) => !matchingEdges.some(({ id }) => id === edge.id)));
      }
      return {
        deletedNodes: matchingNodes,
        deletedEdges: matchingEdges
      };
    },
    screenToFlowPosition: (position, options = { snapToGrid: true }) => {
      const _domNode = get(domNode);
      if (!_domNode) {
        return position;
      }
      const _snapGrid = options.snapToGrid ? get(snapGrid) : false;
      const { x, y, zoom } = get(viewport);
      const { x: domX, y: domY } = _domNode.getBoundingClientRect();
      const correctedPosition = {
        x: position.x - domX,
        y: position.y - domY
      };
      return pointToRendererPoint(correctedPosition, [x, y, zoom], _snapGrid !== null, _snapGrid || [1, 1]);
    },
    /**
     *
     * @param position
     * @returns
     */
    flowToScreenPosition: (position) => {
      const _domNode = get(domNode);
      if (!_domNode) {
        return position;
      }
      const { x, y, zoom } = get(viewport);
      const { x: domX, y: domY } = _domNode.getBoundingClientRect();
      const rendererPosition = rendererPointToPoint(position, [x, y, zoom]);
      return {
        x: rendererPosition.x + domX,
        y: rendererPosition.y + domY
      };
    },
    toObject: () => {
      return {
        nodes: get(nodes).map((node) => ({
          ...node,
          // we want to make sure that changes to the nodes object that gets returned by toObject
          // do not affect the nodes object
          position: { ...node.position },
          data: { ...node.data }
        })),
        edges: get(edges).map((edge) => ({ ...edge })),
        viewport: { ...get(viewport) }
      };
    },
    updateNode,
    updateNodeData: (id, dataUpdate, options) => {
      const node = get(nodeLookup).get(id)?.internals.userNode;
      if (!node) {
        return;
      }
      const nextData = typeof dataUpdate === "function" ? dataUpdate(node) : dataUpdate;
      node.data = options?.replace ? nextData : { ...node.data, ...nextData };
      nodes.update((nds) => nds);
    },
    getNodesBounds: (nodes2) => {
      const _nodeLookup = get(nodeLookup);
      const _nodeOrigin = get(nodeOrigin);
      return getNodesBounds(nodes2, { nodeLookup: _nodeLookup, nodeOrigin: _nodeOrigin });
    },
    getHandleConnections: ({ type, id, nodeId }) => Array.from(get(connectionLookup).get(`${nodeId}-${type}-${id ?? null}`)?.values() ?? []),
    viewport
  };
}
function getElements(lookup, ids) {
  const result = [];
  for (const id of ids) {
    const item = lookup.get(id);
    if (item) {
      const element = "internals" in item ? item.internals?.userNode : item;
      result.push(element);
    }
  }
  return result;
}
function useNodesInitialized() {
  const { nodesInitialized } = useStore();
  return {
    subscribe: nodesInitialized.subscribe
  };
}
function ArrowLeft($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Heart($$renderer, $$props) {
  let className = fallback($$props["className"], "size-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${attr("stroke-width", strokeWidth)} stroke="currentColor"${attr_class(clsx(className))}><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Node($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    let data = $$props["data"];
    $$renderer2.push(`<div class="px-4 py-3 shadow-md rounded-xl dark:bg-black bg-white border dark:border-gray-900 w-60 h-20 group">`);
    Tooltip($$renderer2, {
      content: data?.message?.error ? data.message.error.content : data.message.content,
      class: "w-full",
      allowHTML: false,
      children: ($$renderer3) => {
        if (data.message.role === "user") {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="flex w-full">`);
          ProfileImage($$renderer3, {
            src: `${WEBUI_API_BASE_URL}/users/${data.user.id}/profile/image`,
            className: "size-5 -translate-y-[1px]"
          });
          $$renderer3.push(`<!----> <div class="ml-2"><div class="flex justify-between items-center"><div class="text-xs text-black dark:text-white font-medium line-clamp-1">${escape_html(data?.user?.name ?? "User")}</div></div> `);
          if (data?.message?.error) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="text-red-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.error.content)}</div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div class="text-gray-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.content)}</div>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<div class="flex w-full">`);
          ProfileImage($$renderer3, {
            src: `${WEBUI_API_BASE_URL}/models/model/profile/image?id=${data.model.id}&lang=${store_get($$store_subs ??= {}, "$i18n", i18n).language}`,
            className: "size-5 -translate-y-[1px]"
          });
          $$renderer3.push(`<!----> <div class="ml-2"><div class="flex justify-between items-center"><div class="text-xs text-black dark:text-white font-medium line-clamp-1">${escape_html(data?.model?.name ?? data?.message?.model ?? "Assistant")}</div> <button${attr_class(clsx(data?.message?.favorite ? "" : "invisible group-hover:visible"))}>`);
          Heart($$renderer3, {
            className: `size-3 ${stringify(data?.message?.favorite ? "fill-red-500 stroke-red-500" : "hover:fill-red-500 hover:stroke-red-500")} `,
            strokeWidth: "2.5"
          });
          $$renderer3.push(`<!----></button></div> `);
          if (data?.message?.error) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="text-red-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.error.content)}</div>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div class="text-gray-500 line-clamp-2 text-xs mt-0.5">${escape_html(data.message.content)}</div>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Handle($$renderer2, {
      type: "target",
      position: Position.Top,
      class: "w-2 rounded-full dark:bg-gray-900"
    });
    $$renderer2.push(`<!----> `);
    Handle($$renderer2, {
      type: "source",
      position: Position.Bottom,
      class: "w-2 rounded-full dark:bg-gray-900"
    });
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { data });
  });
}
function AlignVertical($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 3L2 3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M22 21L2 21" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 15V9C8 7.89543 8.89543 7 10 7H14C15.1046 7 16 7.89543 16 9V15C16 16.1046 15.1046 17 14 17H10C8.89543 17 8 16.1046 8 15Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function AlignHorizontal($$renderer, $$props) {
  let className = fallback($$props["className"], "w-4 h-4");
  let strokeWidth = fallback($$props["strokeWidth"], "1.5");
  $$renderer.push(`<svg${attr_class(clsx(className))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"${attr("stroke-width", strokeWidth)} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 22L3 2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 22V2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 16H9C7.89543 16 7 15.1046 7 14V10C7 8.89543 7.89543 8 9 8H15C16.1046 8 17 8.89543 17 10V14C17 15.1046 16.1046 16 15 16Z"></path></svg>`);
  bind_props($$props, { className, strokeWidth });
}
function Flow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let nodes = $$props["nodes"];
    let nodeTypes = $$props["nodeTypes"];
    let edges = $$props["edges"];
    let setLayoutDirection = $$props["setLayoutDirection"];
    SvelteFlow($$renderer2, {
      nodes,
      nodeTypes,
      edges,
      fitView: true,
      minZoom: 1e-3,
      colorMode: store_get($$store_subs ??= {}, "$theme", theme).includes("dark") ? "dark" : store_get($$store_subs ??= {}, "$theme", theme) === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light",
      nodesConnectable: false,
      nodesDraggable: false,
      oninit: () => {
        /* @__PURE__ */ console.log("Flow initialized");
      },
      children: ($$renderer3) => {
        Controls($$renderer3, {
          showLock: false,
          children: ($$renderer4) => {
            ControlButton($$renderer4, {
              title: "Vertical Layout",
              children: ($$renderer5) => {
                AlignVertical($$renderer5, { className: "size-4" });
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----> `);
            ControlButton($$renderer4, {
              title: "Horizontal Layout",
              children: ($$renderer5) => {
                AlignHorizontal($$renderer5, { className: "size-4" });
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Background($$renderer3, { variant: BackgroundVariant.Dots });
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { nodes, nodeTypes, edges, setLayoutDirection });
  });
}
function View($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const i18n = getContext("i18n");
    useStore();
    const { fitView: fitView2, getViewport } = useSvelteFlow();
    useNodesInitialized();
    let history = $$props["history"];
    let onClose = $$props["onClose"];
    let onNodeClick = $$props["onNodeClick"];
    let selectedMessageId = null;
    const nodes = writable([]);
    const edges = writable([]);
    let layoutDirection = "vertical";
    const nodeTypes = { custom: Node };
    const focusNode = async () => {
      if (selectedMessageId === null) {
        await fitView2({ nodes: [{ id: history.currentId }] });
      } else {
        await fitView2({ nodes: [{ id: selectedMessageId }] });
      }
      selectedMessageId = null;
    };
    const drawFlow = async (direction) => {
      const nodeList = [];
      const edgeList = [];
      const levelOffset = direction === "vertical" ? 150 : 300;
      const siblingOffset = direction === "vertical" ? 250 : 150;
      let positionMap = /* @__PURE__ */ new Map();
      let layerWidths = {};
      Object.keys(history.messages).forEach((id) => {
        const message = history.messages[id];
        const level = message.parentId ? (positionMap.get(message.parentId)?.level ?? -1) + 1 : 0;
        if (!layerWidths[level]) layerWidths[level] = 0;
        positionMap.set(id, { id: message.id, level, position: layerWidths[level]++ });
      });
      Object.keys(history.messages).forEach((id) => {
        const pos = positionMap.get(id);
        const x = direction === "vertical" ? pos.position * siblingOffset : pos.level * levelOffset;
        const y = direction === "vertical" ? pos.level * levelOffset : pos.position * siblingOffset;
        nodeList.push({
          id: pos.id,
          type: "custom",
          data: {
            user: store_get($$store_subs ??= {}, "$user", user),
            message: history.messages[id],
            model: store_get($$store_subs ??= {}, "$models", models).find((model) => model.id === history.messages[id].model)
          },
          position: { x, y }
        });
        const parentId = history.messages[id].parentId;
        if (parentId) {
          edgeList.push({
            id: parentId + "-" + pos.id,
            source: parentId,
            target: pos.id,
            selectable: false,
            class: " dark:fill-gray-300 fill-gray-300",
            type: "smoothstep",
            animated: history.currentId === id || recurseCheckChild(id, history.currentId)
          });
        }
      });
      await edges.set([...edgeList]);
      await nodes.set([...nodeList]);
    };
    const recurseCheckChild = (nodeId, currentId) => {
      const node = history.messages[nodeId];
      return node.childrenIds && node.childrenIds.some((id) => id === currentId || recurseCheckChild(id, currentId));
    };
    const setLayoutDirection = (direction) => {
      layoutDirection = direction;
      drawFlow(layoutDirection);
    };
    onDestroy(() => {
      /* @__PURE__ */ console.log("Overview destroyed");
      nodes.set([]);
      edges.set([]);
    });
    if (history) {
      drawFlow(layoutDirection);
    }
    if (history && history.currentId) {
      focusNode();
    }
    $$renderer2.push(`<div class="w-full h-full relative"><div class="absolute z-50 w-full flex justify-between dark:text-gray-100 px-4 py-3"><div class="flex items-center gap-2.5"><button class="self-center p-0.5">`);
    ArrowLeft($$renderer2, { className: "size-3.5" });
    $$renderer2.push(`<!----></button> <div class="text-lg font-medium self-center font-primary">${escape_html(
      // Map to keep track of node positions at each level
      // Helper function to truncate labels
      // Create nodes and map children to ensure alignment in width
      // Track widths of each layer
      // Adjust positions based on siblings count to centralize vertical spacing
      // Create edges
      // fitView();
      // fitView();
      store_get($$store_subs ??= {}, "$i18n", i18n).t("Chat Overview")
    )}</div></div> <button class="self-center p-0.5">`);
    XMark($$renderer2, { className: "size-3.5" });
    $$renderer2.push(`<!----></button></div> `);
    if (store_get($$store_subs ??= {}, "$nodes", nodes).length > 0) {
      $$renderer2.push("<!--[-->");
      Flow($$renderer2, { nodes, nodeTypes, edges, setLayoutDirection });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { history, onClose, onNodeClick });
  });
}
function Overview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let history = $$props["history"];
    let onClose = $$props["onClose"];
    let onNodeClick = $$props["onNodeClick"];
    SvelteFlowProvider($$renderer2, {
      children: ($$renderer3) => {
        View($$renderer3, { history, onClose, onNodeClick });
      },
      $$slots: { default: true }
    });
    bind_props($$props, { history, onClose, onNodeClick });
  });
}
export {
  Overview as default
};
//# sourceMappingURL=Overview.js.map
