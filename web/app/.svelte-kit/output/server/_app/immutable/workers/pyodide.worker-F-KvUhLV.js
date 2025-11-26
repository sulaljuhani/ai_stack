import { loadPyodide } from "pyodide";
async function loadPyodideAndPackages(packages = []) {
  self.stdout = null;
  self.stderr = null;
  self.result = null;
  self.pyodide = await loadPyodide({
    indexURL: "/pyodide/",
    stdout: (text) => {
      if (self.stdout) {
        self.stdout += `${text}
`;
      } else {
        self.stdout = `${text}
`;
      }
    },
    stderr: (text) => {
      if (self.stderr) {
        self.stderr += `${text}
`;
      } else {
        self.stderr = `${text}
`;
      }
    },
    packages: ["micropip"]
  });
  const mountDir = "/mnt";
  self.pyodide.FS.mkdirTree(mountDir);
  const micropip = self.pyodide.pyimport("micropip");
  await micropip.install(packages);
}
self.onmessage = async (event) => {
  const { id, code, ...context } = event.data;
  /* @__PURE__ */ console.log(event.data);
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }
  await loadPyodideAndPackages(self.packages);
  try {
    if (code.includes("matplotlib")) {
      await self.pyodide.runPythonAsync(`import base64
import os
from io import BytesIO

# before importing matplotlib
# to avoid the wasm backend (which needs js.document', not available in worker)
os.environ["MPLBACKEND"] = "AGG"

import matplotlib.pyplot

_old_show = matplotlib.pyplot.show
assert _old_show, "matplotlib.pyplot.show"

def show(*, block=None):
	buf = BytesIO()
	matplotlib.pyplot.savefig(buf, format="png")
	buf.seek(0)
	# encode to a base64 str
	img_str = base64.b64encode(buf.read()).decode('utf-8')
	matplotlib.pyplot.clf()
	buf.close()
	print(f"data:image/png;base64,{img_str}")

matplotlib.pyplot.show = show`);
    }
    self.result = await self.pyodide.runPythonAsync(code);
    self.result = processResult(self.result);
    /* @__PURE__ */ console.log("Python result:", self.result);
  } catch (error) {
    self.stderr = error.toString();
  }
  self.postMessage({ id, result: self.result, stdout: self.stdout, stderr: self.stderr });
};
function processResult(result) {
  try {
    if (result == null) {
      return null;
    }
    if (typeof result === "string" || typeof result === "number" || typeof result === "boolean") {
      return result;
    }
    if (typeof result === "bigint") {
      return result.toString();
    }
    if (Array.isArray(result)) {
      return result.map((item) => processResult(item));
    }
    if (typeof result.toJs === "function") {
      return processResult(result.toJs());
    }
    if (typeof result === "object") {
      const processedObject = {};
      for (const key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          processedObject[key] = processResult(result[key]);
        }
      }
      return processedObject;
    }
    return JSON.stringify(result);
  } catch (err) {
    return `[processResult error]: ${err.message || err.toString()}`;
  }
}
//# sourceMappingURL=pyodide.worker-F-KvUhLV.js.map
