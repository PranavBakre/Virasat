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
  transcript: [], language: "en-IN", question: null, provider: "sarvam",
  providers: { sarvam: false, openai: false }, voiceAvailable: false,
  estateId: null,
  documentStore: {
    documents: [],
    estateMap: {
      groups: [], requiredDocuments: [], missingDocuments: [],
      organizedDocuments: 0, reviewDocuments: 0,
    },
  },
};
let socket;
let chatMessages = [];
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
const ESTATE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function estateId() {
  const url = new URL(location.href);
  const fromUrl = url.searchParams.get("estate");
  if (ESTATE_ID.test(fromUrl ?? "")) {
    localStorage.setItem("virasat-estate-id", fromUrl);
    return fromUrl;
  }
  const stored = localStorage.getItem("virasat-estate-id");
  const id = ESTATE_ID.test(stored ?? "") ? stored : crypto.randomUUID();
  localStorage.setItem("virasat-estate-id", id);
  url.searchParams.set("estate", id);
  history.replaceState(null, "", url);
  return id;
}

function text(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function send(message) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function connect() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${location.host}/ws?estate=${encodeURIComponent(estateId())}`);
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
      setMicStatus("");
      document.querySelector("#live-transcript").textContent = "";
      render();
    } else if (message.type === "stt_ready") {
      sttReady = true;
      flushPendingPcm();
      if (stopRequested) {
        stopRequested = false;
        send({ type: "stt_stop" });
        setMicStatus("Reading your answer…");
      } else {
        setMicStatus("Listening… release when finished");
      }
    } else if (message.type === "transcript") {
      document.querySelector("#live-transcript").textContent = message.text;
    } else if (message.type === "user_message") {
      chatMessages.push({ id: message.id, role: "user", content: message.text });
      renderConversation();
    } else if (message.type === "chat_start") {
      chatMessages.push({ id: message.id, role: "assistant", content: "" });
    } else if (message.type === "chat_delta") {
      const reply = chatMessages.find((entry) => entry.id === message.id);
      if (reply) reply.content += message.text;
      renderConversation();
    } else if (message.type === "chat_end") {
      renderConversation();
    } else if (message.type === "unclear") {
      setMicStatus("I could not place that answer. Please say it again or type it.");
    } else if (message.type === "tts_start") {
      ttsChunks = [];
    } else if (message.type === "tts_end" && ttsChunks.length) {
      const audio = new Audio(URL.createObjectURL(new Blob(ttsChunks, { type: "audio/mpeg" })));
      void audio.play().catch(() => {});
    } else if (message.type === "error") {
      console.log(message.code, message.message);
      setMicStatus(message.message);
    }
  });
  socket.addEventListener("close", () => {
    setMicStatus("Connection closed. Refresh to continue.");
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
  // A blocking gate is not an empty result. "Nothing identified yet" over a gate
  // reads as "you are owed nothing", which is the one thing this product must
  // never accidentally say — point at the step instead.
  const blocked = (state.claimSet.gates ?? []).some((gate) => gate.blocking);
  document.querySelector("#summary").innerHTML = claims.length
    ? `${claims.length} claims identified${ready ? ` · <span class="text-neem">${ready} ready to file</span>` : ""}`
    : blocked ? "Start with the step below" : "Nothing identified yet";
  const missed = claims.filter((claim) => claim.commonlyMissed).map((claim) => splitTitle(claim.title).name);
  document.querySelector("#summary-note").innerHTML = missed.length
    ? `Includes <span class="font-medium text-terra">${missed.map(text).join(" and ")}</span> — claims most families never file.`
    : "";
  document.querySelector("#empty-state").classList.toggle(
    "hidden",
    claims.length > 0 || (state.claimSet.cards ?? []).length > 0 || blocked,
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
  renderEstateMap();
  renderDocumentConclusions();
}

function renderEstateMap() {
  const map = state.documentStore?.estateMap ?? { groups: [], missingDocuments: [] };
  const host = document.querySelector("#estate-map");
  if (!map.groups.length) {
    host.innerHTML = "";
    return;
  }
  host.innerHTML = `<div class="border-b border-rule bg-paper px-7 py-4">
    <div class="flex items-baseline justify-between gap-5">
      <h3 class="text-[15px] font-medium text-ink">The estate at a glance</h3>
      <p class="tnum text-[13px] text-ink2">${map.missingDocuments.length} documents still to confirm</p>
    </div>
    <div class="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">${map.groups.map((group) => {
      const complete = group.requiredDocuments
        ? Math.round((group.heldDocuments / group.requiredDocuments) * 100)
        : 100;
      return `<div>
        <div class="flex items-baseline justify-between gap-3 text-[14px]">
          <span class="font-medium text-indigo">${text(group.title)}</span>
          <span class="tnum text-ink2">${group.readyCount}/${group.claimCount} ready</span>
        </div>
        <div class="mt-1 h-[3px] bg-ruleSoft"><div class="h-[3px] bg-neem" style="width:${complete}%"></div></div>
      </div>`;
    }).join("")}</div>
  </div>`;
}

function renderConversation() {
  const fixedHistory = state.transcript.map((entry, index) => {
    const question = entry.question ?? { "en-IN": entry.label };
    const localCopy = question[state.language];
    const translatedQuestion = state.language !== "en-IN" && localCopy
      ? `<p class="mt-1.5 font-voice text-[15px] leading-[1.6] text-ink2">${text(localCopy)}</p>`
      : "";
    return `<div class="mt-5">
      <div class="flex items-end gap-2.5">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo font-voice text-[13px] text-sheet" aria-hidden="true">V</div>
        <div class="max-w-[86%] rounded-[14px] rounded-bl-[3px] border border-ruleSoft bg-paper px-4 py-3">
          <p class="mb-1 text-[12px] font-medium tracking-[0.06em] text-ink2">QUESTION ${index + 1}</p>
          <p class="font-voice text-[17px] leading-[1.5] text-indigo">${text(question["en-IN"] ?? entry.label)}</p>
          ${translatedQuestion}
        </div>
      </div>
      <div class="mt-2 flex justify-end">
        <div class="max-w-[82%] rounded-[14px] rounded-br-[3px] bg-indigo px-4 py-2.5 text-sheet">
          <p class="text-[15px] leading-[1.5]">${text(entry.answer)}</p>
        </div>
      </div>
    </div>`;
  }).join("");
  const chatHistory = chatMessages.map((entry) => entry.role === "user"
    ? `<div class="mt-2 flex justify-end">
        <div class="max-w-[82%] rounded-[14px] rounded-br-[3px] bg-indigo px-4 py-2.5 text-sheet">
          <p class="whitespace-pre-line text-[15px] leading-[1.5]">${text(entry.content)}</p>
        </div>
      </div>`
    : entry.content
      ? `<div class="mt-5 flex items-end gap-2.5">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo font-voice text-[13px] text-sheet" aria-hidden="true">V</div>
          <div class="max-w-[86%] rounded-[14px] rounded-bl-[3px] border border-ruleSoft bg-paper px-4 py-3">
            <p class="whitespace-pre-line font-voice text-[17px] leading-[1.55] text-indigo">${text(entry.content)}</p>
          </div>
        </div>`
      : "").join("");
  document.querySelector("#transcript").innerHTML = fixedHistory + chatHistory;
  const question = state.question;
  // The interview can end because it finished or because a gate stopped it.
  // Announcing "your checklist is ready" over an empty register is the bug the
  // will path exposed — the closing line has to match what is actually there.
  const blockedEnd = (state.claimSet.gates ?? []).some((gate) => gate.blocking);
  const hasGeneratedReply = chatMessages.some(
    (entry) => entry.role === "assistant" && entry.content.trim(),
  );
  document.querySelector("#current-question").classList.toggle("hidden", hasGeneratedReply);
  document.querySelector("#step-label").textContent = question
    ? `QUESTION ${state.transcript.length + 1}`
    : blockedEnd ? "ONE STEP FIRST" : "INTERVIEW COMPLETE";
  document.querySelector("#question-en").textContent =
    question?.copy["en-IN"] ?? (blockedEnd
      ? "There is one thing to settle before anything can be filed. It is on the right."
      : "Your claims checklist is ready.");
  const localQuestion = document.querySelector("#question-kn");
  localQuestion.classList.toggle("hidden", state.language === "en-IN");
  localQuestion.textContent = state.language === "hi-IN"
    ? question?.copy["hi-IN"] ?? (blockedEnd
      ? "कुछ भी दाखिल करने से पहले एक बात तय करनी है। वह दाईं ओर है।"
      : "आपकी दावा सूची तैयार है।")
    : question?.copy["kn-IN"] ?? (blockedEnd
      ? "ಸಲ್ಲಿಸುವ ಮೊದಲು ಒಂದು ವಿಷಯ ಇತ್ಯರ್ಥವಾಗಬೇಕು. ಅದು ಬಲಭಾಗದಲ್ಲಿದೆ."
      : "ನಿಮ್ಮ ಹಕ್ಕುಗಳ ಪಟ್ಟಿ ಸಿದ್ಧವಾಗಿದೆ.");
  document.querySelector("#answer-form").classList.remove("hidden");
  document.querySelector("#voice-note").classList.remove("hidden");
  document.querySelector("#mic-button").disabled = !state.voiceAvailable;
  const providerName = state.provider === "openai" ? "OpenAI" : "Sarvam";
  document.querySelector("#voice-note").textContent = state.voiceAvailable
    ? `Using ${providerName}. Hold the microphone while you speak, or type your reply.`
    : `${providerName} needs its API key. The typed interview and checklist still work.`;
  renderDocuments();
  requestAnimationFrame(() => {
    const messages = document.querySelector("#messages");
    messages.scrollTop = messages.scrollHeight;
  });
}

function renderDocuments() {
  const panel = document.querySelector("#attachment-list");
  const store = state.documentStore ?? {
    documents: [],
    estateMap: { requiredDocuments: [], missingDocuments: [] },
  };
  const files = store.documents ?? [];
  panel.classList.toggle("hidden", !files.length);
  panel.innerHTML = files.length
    ? `<div class="flex gap-2 overflow-x-auto pb-1">
      ${files.map((file) => `<article class="flex w-[210px] shrink-0 items-center gap-2 border border-ruleSoft bg-sheet px-2 py-1.5">
        <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4 shrink-0 fill-none stroke-indigo" stroke-width="1.7">
          <path d="M8 12.5 13.5 7a3 3 0 0 1 4.2 4.2l-7.1 7.1a5 5 0 0 1-7.1-7.1l7.4-7.4"></path>
        </svg>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] text-ink">${text(file.originalName)}</p>
          <p class="text-[11px] ${file.status === "organized" ? "text-neem" : "text-ochreInk"}">${text(
            file.status === "organized" ? "Filed" : file.status === "failed" ? "Could not read" : "Review on right",
          )}</p>
        </div>
      </article>`).join("")}
    </div>`
    : "";
}

function documentConclusion(file) {
  if (file.status === "failed") {
    return {
      conclusion: "Could not read",
      why: file.error || "The parser did not return usable text.",
    };
  }
  if (file.textPreview?.startsWith("PK")) {
    return {
      conclusion: file.matchedDocumentIds?.length ? `Likely ${file.title}` : "Not identified",
      why: "The parser returned a ZIP that was not unpacked. Re-upload this file after the parser fix.",
    };
  }
  if (file.status === "organized") {
    return {
      conclusion: file.title,
      why: `Matched from the document text and identifying details · ${Math.round(file.confidence * 100)}% confidence.`,
    };
  }
  if (file.matchedDocumentIds?.length) {
    return {
      conclusion: `Likely ${file.title}`,
      why: "The document name or text matched, but identifying details were not strong enough to file it automatically.",
    };
  }
  return {
    conclusion: "Not identified",
    why: "No reliable document type match was found in the extracted text.",
  };
}

function renderDocumentConclusions() {
  const host = document.querySelector("#document-conclusions");
  const store = state.documentStore ?? {
    documents: [],
    estateMap: { requiredDocuments: [], missingDocuments: [] },
  };
  const files = store.documents ?? [];
  const requirements = store.estateMap?.requiredDocuments
    ?? store.estateMap?.missingDocuments
    ?? [];
  if (!files.length && !requirements.length) {
    host.innerHTML = "";
    return;
  }

  host.innerHTML = `<section class="border-b border-rule">
    ${files.length ? `<div class="bg-paper px-7 py-[7px]">
      <div class="flex items-baseline justify-between gap-4">
        <h3 class="text-[13px] font-medium tracking-[0.06em] text-ink2">Document conclusions</h3>
        <span class="tnum text-[13px] text-ink2">${files.length} reviewed</span>
      </div>
    </div>
    ${files.map((file) => {
      const result = documentConclusion(file);
      return `<article class="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-5 border-t border-ruleSoft px-7 py-3">
        <div class="min-w-0">
          <p class="truncate text-[14px] text-ink">${text(file.originalName)}</p>
          <p class="mt-0.5 text-[12px] text-ink2">${text(file.category)}</p>
        </div>
        <div>
          <p class="text-[14px] font-medium ${file.status === "organized" ? "text-neem" : "text-ochreInk"}">${text(result.conclusion)}</p>
          <p class="mt-0.5 text-[13px] leading-[1.45] text-ink2">${text(result.why)}</p>
        </div>
      </article>`;
    }).join("")}` : ""}
    ${requirements.length ? `<div class="border-t border-rule bg-paper px-7 py-[7px]">
      <h3 class="text-[13px] font-medium tracking-[0.06em] text-ink2">Claim documents</h3>
    </div>
    ${requirements.map((document) => `<label class="flex items-start gap-3 border-t border-ruleSoft px-7 py-2.5">
      <input class="mt-1 h-[15px] w-[15px] accent-indigo" type="checkbox"
        data-document-id="${text(document.id)}" ${document.have === "yes" ? "checked" : ""}>
      <span class="min-w-0 flex-1">
        <span class="block text-[14px]">${text(document.label)}</span>
        <span class="block text-[12px] ${document.have === "no" ? "text-ochreInk" : "text-ink2"}">${
          document.have === "yes"
            ? "In hand"
            : document.have === "no"
              ? "Still to get"
              : "Not yet confirmed"
        } · ${document.neededFor.length} ${document.neededFor.length === 1 ? "claim" : "claims"}</span>
      </span>
    </label>`).join("")}` : ""}
  </section>`;

  host.querySelectorAll("[data-document-id]").forEach((input) => {
    input.addEventListener("change", () => send({
      type: "set_document",
      documentId: input.dataset.documentId,
      status: input.checked ? "yes" : "no",
    }));
  });
}

function setDocumentUploadStatus(message) {
  const status = document.querySelector("#document-upload-status");
  status.textContent = message;
  status.classList.toggle("hidden", !message);
}

async function uploadDocumentFiles(files) {
  if (!files.length) return;
  const button = document.querySelector("#attach-button");
  if (button.disabled) return;
  if (files.length > 10) {
    setDocumentUploadStatus("Choose up to 10 documents at a time.");
    return;
  }
  button.disabled = true;
  setDocumentUploadStatus(
    `Reading ${files.length} ${files.length === 1 ? "document" : "documents"}…`,
  );
  const body = new FormData();
  for (const file of files) body.append("documents", file);
  body.append("language", state.language);
  try {
    const response = await fetch(`/api/documents?estate=${encodeURIComponent(estateId())}`, {
      method: "POST",
      body,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Documents could not be read.");
    state = { ...state, ...result };
    render();
    setDocumentUploadStatus(
      `${files.length} ${files.length === 1 ? "document" : "documents"} added. Conclusions are on the right.`,
    );
  } catch (error) {
    setDocumentUploadStatus(
      error instanceof Error ? error.message : "Documents could not be read.",
    );
  } finally {
    button.disabled = false;
    document.querySelector("#document-upload").value = "";
  }
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
      setMicStatus("Microphone unavailable. Type the answer below.");
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
  document.querySelector("#voice-feedback").classList.toggle("hidden", !message);
}

function setMicRecording(active) {
  const button = document.querySelector("#mic-button");
  button.setAttribute("aria-label", active ? "Release to send" : "Hold to speak");
  button.setAttribute("title", active ? "Release to send" : "Hold to speak");
  button.classList.toggle("bg-indigo", active);
  button.classList.toggle("text-sheet", active);
  button.classList.toggle("text-indigo", !active);
}

async function startRecording() {
  if (recording || !state.voiceAvailable) return;
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
  send({ type: "stt_start", questionId: state.question?.id ?? "chat" });
  setMicRecording(true);
  // Own this status locally. It used to be cleared only by the server's stt_ready,
  // so any hiccup on that round trip left "Preparing the microphone…" on screen
  // while recording was in fact already running.
  setMicStatus("Listening… release when finished");
}

function stopRecording() {
  if (!micPressed && !recording) return;
  micPressed = false;
  setMicRecording(false);
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
  if (!value) return;
  send({ type: "chat", text: value });
  input.value = "";
  document.querySelector("#live-transcript").textContent = "";
  setMicStatus("Reading your answer…");
});
document.querySelector("#typed-answer").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    document.querySelector("#answer-form").requestSubmit();
  }
});
const attachmentButton = document.querySelector("#attach-button");
const documentInput = document.querySelector("#document-upload");
const composer = document.querySelector("#composer");
attachmentButton.addEventListener("click", () => documentInput.click());
documentInput.addEventListener("change", () => {
  void uploadDocumentFiles([...documentInput.files]);
});
composer.addEventListener("dragover", (event) => {
  if (!event.dataTransfer?.types.includes("Files")) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
  composer.classList.add("border-indigo");
});
composer.addEventListener("dragleave", (event) => {
  if (event.relatedTarget && composer.contains(event.relatedTarget)) return;
  composer.classList.remove("border-indigo");
});
composer.addEventListener("drop", (event) => {
  if (!event.dataTransfer?.files.length) return;
  event.preventDefault();
  composer.classList.remove("border-indigo");
  void uploadDocumentFiles([...event.dataTransfer.files]);
});
document.querySelector("#language").addEventListener("change", (event) => {
  send({ type: "set_language", language: event.target.value });
});
document.querySelector("#provider").addEventListener("change", (event) => {
  if (recording) stopRecording();
  send({ type: "set_provider", provider: event.target.value });
});
document.querySelector("#reset-button").addEventListener("click", () => {
  chatMessages = [];
  send({ type: "reset" });
});
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
