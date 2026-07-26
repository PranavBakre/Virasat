const GROUPS = [
  { match: /^bank/, heading: "Banks and deposits" },
  { match: /^(epfo|eps)/, heading: "Provident fund and pension" },
  { match: /^employer/, heading: "Employer dues" },
  { match: /^insurance/, heading: "Life insurance" },
  { match: /^pension/, heading: "Pension" },
  { match: /^(demat|mutual|securities)/, heading: "Shares and mutual funds" },
  { match: /^(post-office|ppf|scss)/, heading: "Post office savings" },
];

let state = {
  profile: {}, claimSet: { gates: [], claims: [], cards: [] },
  transcript: [], language: "kn-IN", question: null, provider: "sarvam",
  providers: { sarvam: false, openai: false }, voiceAvailable: false,
};
let socket;
let recording = false;
let micPressed = false;
let audioContext;
let microphone;
let worklet;
let ttsChunks = [];
let audioReady = false;
let warmUpPromise = null;
let sttReady = false;
let stopRequested = false;
let pendingPcm = [];
// ~4s of 40ms chunks. Enough to cover any handshake; bounded so a stuck socket
// cannot grow this without limit.
const MAX_PENDING_CHUNKS = 100;

function text(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function send(message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function connect() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${location.host}/ws`);
  socket.binaryType = "arraybuffer";
  socket.addEventListener("open", () => {
    send({ type: "start", language: document.querySelector("#language").value });
  });
  socket.addEventListener("message", (event) => {
    if (typeof event.data !== "string") {
      ttsChunks.push(event.data);
      return;
    }
    const message = JSON.parse(event.data);
    if (message.type === "state") {
      state = message.payload;
      render();
    } else if (message.type === "stt_ready") {
      sttReady = true;
      flushPendingPcm();
      if (stopRequested) {
        stopRequested = false;
        send({ type: "stt_stop" });
        setMicStatus("Reading your answer…");
      } else {
        document.querySelector("#mic-status").textContent = "Listening… release when finished";
      }
    } else if (message.type === "transcript") {
      document.querySelector("#live-transcript").textContent = message.text;
    } else if (message.type === "unclear") {
      document.querySelector("#mic-status").textContent = "I could not place that answer. Please say it again or type it.";
    } else if (message.type === "tts_start") {
      ttsChunks = [];
    } else if (message.type === "tts_end" && ttsChunks.length) {
      const audio = new Audio(URL.createObjectURL(new Blob(ttsChunks, { type: "audio/mpeg" })));
      void audio.play().catch(() => {});
    } else if (message.type === "error") {
      console.log(message.code, message.message);
      document.querySelector("#mic-status").textContent = message.message;
    }
  });
  socket.addEventListener("close", () => {
    document.querySelector("#mic-status").textContent = "Connection closed. Refresh to continue.";
  });
}

function splitTitle(title) {
  const parts = title.split(" — ");
  return parts.length < 2
    ? { name: title, hint: "" }
    : { name: parts[0], hint: parts.slice(1).join(" — ") };
}

function documentState(claim) {
  const docs = claim.docsRequired ?? [];
  return {
    total: docs.length,
    held: docs.filter((doc) => doc.have === "yes").length,
    absent: docs.filter((doc) => doc.have === "no"),
    unconfirmed: docs.filter((doc) => doc.have === "unknown"),
  };
}

function statusFor(claim) {
  if (claim.status === "filable") return { label: "Ready to file", kind: "ready" };
  if (claim.status === "uncertain") return { label: "Confirm details", kind: "quiet" };
  return documentState(claim).absent.length
    ? { label: "Waiting on documents", kind: "attention" }
    : { label: "Documents to confirm", kind: "attention" };
}

function statusMarkup(status) {
  if (status.kind === "ready") {
    return `<span class="flex items-center gap-2 whitespace-nowrap text-[14px] font-medium text-neem">
      <span class="h-[7px] w-[7px] bg-neem"></span>${text(status.label)}</span>`;
  }
  if (status.kind === "quiet") {
    return `<span class="whitespace-nowrap text-[14px] text-ink2">${text(status.label)}</span>`;
  }
  return `<span class="whitespace-nowrap bg-ochreTint px-2 py-[3px] text-[14px] font-medium text-ochreInk">${text(status.label)}</span>`;
}

function detailRow(key, value) {
  return `<div class="flex gap-5 border-t border-ruleSoft py-[7px]">
    <dt class="w-[92px] shrink-0 text-[14px] text-ink2">${text(key)}</dt>
    <dd class="text-[16px]">${value}</dd></div>`;
}

function documentsValue(claim) {
  const docs = documentState(claim);
  const lines = [];
  if (docs.absent.length) {
    lines.push(`<span class="font-medium text-ochreInk">Still to get:</span> ${docs.absent.map((doc) => text(doc.label)).join(", ")}`);
  }
  if (docs.unconfirmed.length) {
    lines.push(`<span class="text-ink2">Not yet confirmed:</span> ${docs.unconfirmed.map((doc) => text(doc.label)).join(", ")}`);
  }
  return lines.length
    ? `<span class="tnum text-ink2">${docs.held} of ${docs.total} in hand</span><div class="mt-1 leading-[1.5]">${lines.join("<br>")}</div>`
    : `<span class="text-neem">All ${docs.total} in hand</span>`;
}

function claimMarkup(claim, index) {
  const title = splitTitle(claim.title);
  return `<article class="register-row grid grid-cols-[42px_minmax(0,1fr)] gap-x-4 border-t border-rule px-7 py-5">
    <p class="tnum pt-[3px] text-[15px] text-ink2">${String(index + 1).padStart(2, "0")}</p>
    <div><div class="flex items-start justify-between gap-6">
      <h3 class="text-[19px] font-medium leading-[1.35] text-indigo">${text(title.name)}</h3>
      ${statusMarkup(statusFor(claim))}</div>
      ${title.hint ? `<p class="mt-1 text-[15px] leading-[1.5] text-ink2">${text(title.hint)}</p>` : ""}
      ${claim.commonlyMissed ? `<p class="mt-2 text-[14px] font-medium text-terra">Most families never claim this</p>` : ""}
      <dl class="mt-3">${detailRow("File at", text(claim.authority))}
        ${claim.forms.length ? detailRow(claim.forms.length > 1 ? "Forms" : "Form", claim.forms.map(text).join(" · ")) : ""}
        ${detailRow("Documents", documentsValue(claim))}
        ${claim.timelineNote ? detailRow("Timeline", text(claim.timelineNote)) : ""}</dl>
      <p class="mt-3 flex items-center gap-3 text-[13px] text-ink2"><span>${text(claim.legalBasis)}</span>
        ${claim.verify ? `<span class="font-medium text-ochreInk">Unverified</span>` : ""}</p>
    </div></article>`;
}

function renderRegister() {
  const claims = state.claimSet.claims ?? [];
  const grouped = new Map();
  for (const claim of claims) {
    const heading = GROUPS.find((group) => group.match.test(claim.id))?.heading ?? "Other claims";
    if (!grouped.has(heading)) grouped.set(heading, []);
    grouped.get(heading).push(claim);
  }
  let counter = 0;
  document.querySelector("#register").innerHTML = [...grouped].map(([heading, rows]) =>
    `<h3 class="border-t border-rule bg-paper px-7 py-[7px] text-[13px] font-medium tracking-[0.06em] text-ink2">${text(heading)}</h3>
    ${rows.map((claim) => claimMarkup(claim, counter++)).join("")}`
  ).join("");

  const ready = claims.filter((claim) => claim.status === "filable").length;
  document.querySelector("#summary").innerHTML = claims.length
    ? `${claims.length} claims identified${ready ? ` · <span class="text-neem">${ready} ready to file</span>` : ""}`
    : "Nothing identified yet";
  const missed = claims.filter((claim) => claim.commonlyMissed).map((claim) => splitTitle(claim.title).name);
  document.querySelector("#summary-note").innerHTML = missed.length
    ? `Includes <span class="font-medium text-terra">${missed.map(text).join(" and ")}</span> — claims most families never file.`
    : "";
  document.querySelector("#empty-state").classList.toggle(
    "hidden",
    claims.length > 0 || (state.claimSet.cards ?? []).length > 0,
  );
}

function renderAncillary() {
  document.querySelector("#gate-list").innerHTML = (state.claimSet.gates ?? []).map((gate) =>
    `<article class="border-t-[3px] ${gate.blocking ? "border-brick" : "border-ochre"} bg-paper px-7 py-5">
      <h3 class="text-[19px] font-medium ${gate.blocking ? "text-brick" : "text-ink"}">${text(gate.title)}</h3>
      <p class="mt-2 text-[16px] leading-[1.55] text-ink2">${text(gate.body)}</p></article>`
  ).join("");
  const cards = state.claimSet.cards ?? [];
  document.querySelector("#card-list").innerHTML = cards.length
    ? `<h3 class="border-t border-rule bg-paper px-7 py-[7px] text-[13px] font-medium tracking-[0.06em] text-ink2">Worth checking</h3>
      ${cards.map((card) =>
        `<article class="border-t border-rule px-7 py-4"><h4 class="text-[17px] font-medium">${text(card.title)}</h4>
          <p class="mt-1 text-[15px] leading-[1.5] text-ink2">${text(card.body)}</p>
          ${card.link ? `<a class="mt-1 inline-block text-[15px] text-indigo underline" href="${text(card.link)}" target="_blank" rel="noreferrer">${text(card.link)}</a>` : ""}</article>`
      ).join("")}`
    : "";
  const shares = document.querySelector("#shares-note");
  shares.classList.toggle("hidden", !state.claimSet.sharesNote || !(state.claimSet.claims ?? []).length);
  shares.textContent = state.claimSet.sharesNote ?? "";
}

function renderConversation() {
  document.querySelector("#transcript").innerHTML = state.transcript.map((entry) =>
    `<div class="flex gap-5 border-b border-ruleSoft py-[9px]">
      <dt class="w-[128px] shrink-0 text-[14px] text-ink2">${text(entry.label)}</dt>
      <dd class="text-[16px]">${text(entry.answer)}</dd></div>`
  ).join("");
  const question = state.question;
  document.querySelector("#step-label").textContent = question
    ? `Question ${state.transcript.length + 1}` : "Interview complete";
  document.querySelector("#question-en").textContent =
    question?.copy["en-IN"] ?? "Your identified claims are shown on the right.";
  const localQuestion = document.querySelector("#question-kn");
  localQuestion.classList.toggle("hidden", state.language === "en-IN");
  localQuestion.textContent = state.language === "hi-IN"
    ? question?.copy["hi-IN"] ?? "आपके उत्तरों से पहचाने गए दावे दाईं ओर हैं।"
    : question?.copy["kn-IN"] ?? "ನಿಮ್ಮ ಉತ್ತರಗಳಿಂದ ಗುರುತಿಸಿದ ಹಕ್ಕುಗಳು ಬಲಭಾಗದಲ್ಲಿವೆ.";
  document.querySelector("#answer-form").classList.toggle("hidden", !question);
  document.querySelector("#mic-button").disabled = !question || !state.voiceAvailable;
  const providerName = state.provider === "openai" ? "OpenAI" : "Sarvam";
  document.querySelector("#voice-note").textContent = state.voiceAvailable
    ? `Using ${providerName}. Hold the microphone while you speak, or type your reply.`
    : `${providerName} needs its API key. The typed interview and checklist still work.`;
  renderDocuments();
}

function renderDocuments() {
  const panel = document.querySelector("#document-panel");
  const byId = new Map();
  for (const claim of state.claimSet.claims ?? []) {
    for (const document of claim.docsRequired ?? []) byId.set(document.id, document);
  }
  const documents = [...byId.values()];
  panel.classList.toggle("hidden", state.question !== null || documents.length === 0);
  if (state.question !== null || !documents.length) return;
  panel.innerHTML = `<div class="border-t border-rule pt-5">
    <h3 class="text-[17px] font-medium text-ink">Mark what you already have</h3>
    <p class="mt-1 text-[15px] text-ink2">A missing document holds up filing, not the claim.</p>
    <div class="mt-3">${documents.map((document) =>
      `<label class="flex items-center gap-3 border-b border-ruleSoft py-[9px] text-[16px]">
        <input class="h-[15px] w-[15px] accent-indigo" type="checkbox"
          data-document-id="${text(document.id)}" ${document.have === "yes" ? "checked" : ""}>
        <span>${text(document.label)}</span></label>`
    ).join("")}</div></div>`;
  panel.querySelectorAll("[data-document-id]").forEach((input) => {
    input.addEventListener("change", () => send({
      type: "set_document",
      documentId: input.dataset.documentId,
      status: input.checked ? "yes" : "no",
    }));
  });
}

function render() {
  document.querySelector("#language").value = state.language;
  const provider = document.querySelector("#provider");
  provider.value = state.provider;
  for (const option of provider.options) {
    const available = Boolean(state.providers?.[option.value]);
    option.disabled = !available && option.value !== state.provider;
    const name = option.value === "openai" ? "OpenAI" : "Sarvam";
    option.textContent = `${name}${available ? "" : " · key missing"}`;
  }
  renderConversation();
  renderRegister();
  renderAncillary();
}

// The audio graph is built ONCE and kept alive for the session. Building it
// inside the press handler cost a getUserMedia device open plus a worklet module
// fetch — 300ms to over a second on the first press — and captured nothing during
// that window. A short answer like "yes" fits entirely inside it, which is why
// voice "sometimes didn't detect".
async function warmUpAudio() {
  if (audioReady) return true;
  if (warmUpPromise) return warmUpPromise;
  warmUpPromise = (async () => {
    try {
      microphone = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      // Ask the browser for 16 kHz so IT does the resampling. The worklet's own
      // decimation then degenerates to a pass-through — hand-rolled decimation
      // with no low-pass filter aliases, and aliasing costs recognition accuracy.
      audioContext = new AudioContext({ sampleRate: 16_000 });
      await audioContext.audioWorklet.addModule("/pcm-worklet.js");
      worklet = new AudioWorkletNode(audioContext, "pcm16-processor");
      audioContext.createMediaStreamSource(microphone).connect(worklet);
      // Keeps the node pulled without routing the microphone to the speakers.
      const sink = audioContext.createGain();
      sink.gain.value = 0;
      worklet.connect(sink).connect(audioContext.destination);
      worklet.port.onmessage = (event) => handlePcm(event.data);
      audioReady = true;
      return true;
    } catch (error) {
      console.log("Microphone unavailable", error);
      document.querySelector("#mic-status").textContent =
        "Microphone unavailable. Type the answer below.";
      warmUpPromise = null;
      return false;
    }
  })();
  return warmUpPromise;
}

// Hold audio until the selected provider confirms it is ready. Sarvam may still
// be opening its socket; OpenAI acknowledges immediately and receives one clip.
function handlePcm(buffer) {
  if (!recording) return;
  if (!sttReady) {
    if (pendingPcm.length < MAX_PENDING_CHUNKS) pendingPcm.push(buffer);
    return;
  }
  if (socket?.readyState === WebSocket.OPEN) socket.send(buffer);
}

function flushPendingPcm() {
  if (socket?.readyState === WebSocket.OPEN) {
    for (const buffer of pendingPcm) socket.send(buffer);
  }
  pendingPcm = [];
}

function setMicStatus(message) {
  document.querySelector("#mic-status").textContent = message;
}

async function startRecording() {
  if (recording || !state.question) return;
  micPressed = true;
  if (!audioReady) setMicStatus("Preparing the microphone…");

  if (!(await warmUpAudio())) {
    micPressed = false;
    return; // warmUpAudio has already reported why.
  }
  if (!micPressed) {
    // Released before the microphone finished opening — which also happens when
    // the permission prompt steals focus. The graph stays open, so the next press
    // is instant. Say that instead of leaving a dead "Starting…" on screen.
    setMicStatus("Microphone ready — hold and speak.");
    return;
  }
  await audioContext.resume();
  pendingPcm = [];
  sttReady = false;
  stopRequested = false;
  recording = true;
  send({ type: "stt_start", questionId: state.question.id });
  document.querySelector("#mic-button").textContent = "Release to send";
  // Own this status locally. It used to be cleared only by the server's stt_ready,
  // so any hiccup on that round trip left "Preparing the microphone…" on screen
  // while recording was in fact already running.
  setMicStatus("Listening… release when finished");
}

function stopRecording() {
  if (!micPressed && !recording) return;
  micPressed = false;
  document.querySelector("#mic-button").textContent = "Hold to speak";
  // Cancelled before capture began; startRecording reports readiness once the
  // pending warm-up resolves.
  if (!recording) return;
  recording = false;

  // A press shorter than the socket handshake still has to deliver its audio, so
  // defer the stop until stt_ready lands and the buffer has been flushed.
  if (!sttReady) {
    stopRequested = true;
    setMicStatus("Sending…");
    return;
  }
  send({ type: "stt_stop" });
  setMicStatus("Reading your answer…");
}

document.querySelector("#answer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#typed-answer");
  const value = input.value.trim();
  if (!value || !state.question) return;
  send({ type: "typed_answer", text: value, questionId: state.question.id });
  input.value = "";
  document.querySelector("#live-transcript").textContent = "";
});
document.querySelector("#language").addEventListener("change", (event) => {
  send({ type: "set_language", language: event.target.value });
});
document.querySelector("#provider").addEventListener("change", (event) => {
  if (recording) stopRecording();
  send({ type: "set_provider", provider: event.target.value });
});
document.querySelector("#reset-button").addEventListener("click", () => send({ type: "reset" }));
const micButton = document.querySelector("#mic-button");
micButton.addEventListener("pointerdown", (event) => {
  // Retargets pointerup to this button even if the pointer leaves it mid-press.
  try { micButton.setPointerCapture(event.pointerId); } catch { /* not critical */ }
  void startRecording();
});
micButton.addEventListener("pointerup", stopRecording);
micButton.addEventListener("pointercancel", stopRecording);
// Safety net for the cases pointer capture cannot cover: the window losing focus
// or the tab being hidden mid-press.
window.addEventListener("pointerup", stopRecording);
window.addEventListener("blur", () => {
  // Only abandon an in-flight recording. A blur during warm-up is expected:
  // the permission prompt causes it.
  if (recording) stopRecording();
});

// Pre-open the microphone on hover, but only when permission is already granted
// so we never surface a permission prompt on a stray mouse movement. By the time
// the button is pressed the graph is live and capture starts immediately.
micButton.addEventListener("pointerenter", async () => {
  if (audioReady || micButton.disabled) return;
  const granted = await navigator.permissions
    ?.query({ name: "microphone" })
    .then((status) => status.state === "granted")
    .catch(() => false);
  if (granted) void warmUpAudio();
});

connect();
