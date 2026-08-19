import { unlink, writeFile } from "node:fs/promises"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

import WebSocket from "ws"

const [browserWebSocketUrl, outputPath] = process.argv.slice(2)
if (!browserWebSocketUrl || !outputPath) {
  throw new Error(
    "Usage: capture-current-page.mjs <browser-websocket-url> <output-path>"
  )
}

const endpoint = new URL(browserWebSocketUrl)
const response = await fetch(`http://${endpoint.host}/json`)
const targets = await response.json()
const page = targets.find(
  (target) =>
    target.type === "page" &&
    target.webSocketDebuggerUrl &&
    !target.url.startsWith("chrome://")
)
if (!page?.webSocketDebuggerUrl) throw new Error("No active page target found")

const socket = new WebSocket(page.webSocketDebuggerUrl, {
  origin: "devtools://devtools",
})
let nextId = 0
const pending = new Map()

socket.on("message", (data) => {
  const message = JSON.parse(String(data))
  if (message.id === undefined) return
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  if (message.error) request.reject(new Error(message.error.message))
  else request.resolve(message.result)
})

await new Promise((resolve, reject) => {
  socket.once("open", resolve)
  socket.once("error", reject)
})

function command(method, params = {}) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}

const viewport = await command("Runtime.evaluate", {
  expression: "({ width: window.innerWidth, height: window.innerHeight })",
  returnByValue: true,
})
const { width, height } = viewport.result.value
await command("Emulation.setEmulatedMedia", {
  media: "screen",
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
})
await command("Runtime.evaluate", {
  expression: `
    document.querySelector('a[href="#main-content"]')?.style.setProperty('display', 'none');
    for (const element of document.querySelectorAll('h1, h1 *')) {
      element.style.setProperty('opacity', '1');
      element.style.setProperty('transform', 'none');
    }
    for (const animation of document.getAnimations()) {
      const iterations = animation.effect?.getTiming().iterations;
      if (typeof iterations === 'number' && Number.isFinite(iterations)) animation.finish();
    }
  `,
})
const result = await command("Page.printToPDF", {
  printBackground: true,
  paperWidth: width / 96,
  paperHeight: height / 96,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  pageRanges: "1",
})
const temporaryPdf = `${outputPath}.pdf`
await writeFile(temporaryPdf, Buffer.from(result.data, "base64"))
const run = promisify(execFile)
await run("sips", [
  "-s",
  "format",
  "png",
  temporaryPdf,
  "--out",
  outputPath,
  "--resampleWidth",
  String(width),
])
await unlink(temporaryPdf)
socket.close()
