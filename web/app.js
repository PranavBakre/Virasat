const profile = {
  state: "karnataka",
  district: "Bengaluru Urban",
  religion: "hindu",
  will: "no",
  relationship: "spouse",
  documents: {},
};

const steps = [
  {
    label: "Death certificate",
    kn: "ನಿಮ್ಮ ಬಳಿ ಮರಣ ಪ್ರಮಾಣಪತ್ರ ಇದೆಯೇ?",
    en: "Do you have the death certificate?",
    answer: "Yes, we have it.",
    summary: "Yes",
    patch: { deathCertificate: "yes", documents: { "death-certificate": "yes" } },
  },
  {
    label: "Bank account",
    kn: "ಅವರಿಗೆ ಬ್ಯಾಂಕ್ ಖಾತೆ ಇತ್ತೇ?",
    en: "Did your husband have a bank account?",
    answer: "Yes — an SBI account, with me as nominee.",
    summary: "SBI · sole account · you are the nominee",
    patch: {
      banks: {
        exists: "yes",
        accounts: [{
          id: "sbi-1",
          bankName: "State Bank of India",
          bankType: "commercial",
          holding: "sole",
          nominee: "yes",
          nomineeName: "Spouse",
        }],
      },
    },
  },
  {
    label: "Work",
    kn: "ಅವರು ಕೆಲಸದಲ್ಲಿದ್ದರೇ?",
    en: "Was he working at the time?",
    answer: "Yes, he was in a salaried job.",
    summary: "Salaried at the time of death",
    patch: { employment: "employed-at-death" },
  },
  {
    label: "Provident fund",
    kn: "ಅವರಿಗೆ ಪಿಎಫ್ ಖಾತೆ ಇತ್ತೇ?",
    en: "Did he have a provident-fund account?",
    answer: "Yes, through his employer.",
    summary: "Yes · 22 years of service",
    patch: { epfo: { exists: "yes", uanKnown: "yes", serviceYears: 22 } },
  },
];

// Groups the schedule by institution. GOV.UK task-list guidance: once there are
// several tasks, grouping them under short headings is what makes the list
// plannable rather than just long.
const GROUPS = [
  { match: /^bank/, heading: "Banks and deposits" },
  { match: /^(epfo|eps)/, heading: "Provident fund and pension" },
  { match: /^employer/, heading: "Employer dues" },
  { match: /^insurance/, heading: "Life insurance" },
  { match: /^pension/, heading: "Pension" },
  { match: /^(demat|mutual|securities)/, heading: "Shares and mutual funds" },
  { match: /^(post-office|ppf|scss)/, heading: "Post office savings" },
];

let stepIndex = -1;
let latestClaimSet = { gates: [], claims: [], cards: [], track: "intestate" };

function mergeProfile(patch) {
  if (patch.documents) {
    profile.documents = { ...profile.documents, ...patch.documents };
  }
  Object.assign(profile, { ...patch, documents: profile.documents });
}

async function derive() {
  const response = await fetch("/api/derive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  latestClaimSet = await response.json();
  render();
}

function text(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function groupHeadingFor(claim) {
  return GROUPS.find((group) => group.match.test(claim.id))?.heading ?? "Other claims";
}

// Long titles carry their own hint after an em dash — "Employer dues — gratuity,
// final salary and leave encashment". Split it so the name stays scannable and
// the detail becomes hint text, per the GOV.UK task-list row.
function splitTitle(title) {
  const parts = title.split(" — ");
  if (parts.length < 2) return { name: title, hint: "" };
  return { name: parts[0], hint: parts.slice(1).join(" — ") };
}

// A document the family was never asked about is NOT a missing document. The
// engine can only mark it "unknown"; presenting that as "Missing" invents bad
// news and makes every claim look blocked.
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
  if (claim.status === "filable") {
    return { label: "Ready to file", kind: "ready" };
  }
  if (claim.status === "uncertain") {
    return { label: "Confirm details", kind: "quiet" };
  }
  const docs = documentState(claim);
  return docs.absent.length
    ? { label: "Waiting on documents", kind: "attention" }
    : { label: "Documents to confirm", kind: "attention" };
}

// GOV.UK: the finished state gets no background, so visual weight falls on the
// work that remains. "Ready to file" is the good news and stays quiet.
function statusMarkup(status) {
  if (status.kind === "ready") {
    return `<span class="flex items-center gap-2 whitespace-nowrap text-[14px] font-medium text-neem">
      <span class="h-[7px] w-[7px] bg-neem"></span>${text(status.label)}
    </span>`;
  }
  if (status.kind === "quiet") {
    return `<span class="whitespace-nowrap text-[14px] text-ink2">${text(status.label)}</span>`;
  }
  return `<span class="whitespace-nowrap bg-ochreTint px-2 py-[3px] text-[14px] font-medium text-ochreInk">
    ${text(status.label)}
  </span>`;
}

function detailRow(key, value) {
  return `
    <div class="flex gap-5 border-t border-ruleSoft py-[7px]">
      <dt class="w-[92px] shrink-0 text-[14px] text-ink2">${text(key)}</dt>
      <dd class="text-[16px]">${value}</dd>
    </div>
  `;
}

function documentsValue(claim) {
  const docs = documentState(claim);
  const lines = [];

  if (docs.absent.length) {
    lines.push(`<span class="font-medium text-ochreInk">Still to get:</span>
      ${docs.absent.map((doc) => text(doc.label)).join(", ")}`);
  }
  if (docs.unconfirmed.length) {
    lines.push(`<span class="text-ink2">Not yet confirmed:</span>
      ${docs.unconfirmed.map((doc) => text(doc.label)).join(", ")}`);
  }
  if (!lines.length) {
    return `<span class="text-neem">All ${docs.total} in hand</span>`;
  }

  return `<span class="tnum text-ink2">${docs.held} of ${docs.total} in hand</span>
    <div class="mt-1 leading-[1.5]">${lines.join('<div class="mt-1"></div>')}</div>`;
}

function claimMarkup(claim, index) {
  const { name, hint } = splitTitle(claim.title);
  const status = statusFor(claim);

  return `
    <article class="register-row grid grid-cols-[42px_minmax(0,1fr)] gap-x-4 border-t border-rule px-7 py-5">
      <p class="tnum pt-[3px] text-[15px] text-ink2">${String(index + 1).padStart(2, "0")}</p>
      <div>
        <div class="flex items-start justify-between gap-6">
          <h3 class="text-[19px] font-medium leading-[1.35] text-indigo">${text(name)}</h3>
          ${statusMarkup(status)}
        </div>
        ${hint ? `<p class="mt-1 text-[15px] leading-[1.5] text-ink2">${text(hint)}</p>` : ""}
        ${claim.commonlyMissed
          ? `<p class="mt-2 text-[14px] font-medium text-terra">Most families never claim this</p>`
          : ""}

        <dl class="mt-3">
          ${detailRow("File at", text(claim.authority))}
          ${claim.forms.length ? detailRow(claim.forms.length > 1 ? "Forms" : "Form", claim.forms.map(text).join(" · ")) : ""}
          ${detailRow("Documents", documentsValue(claim))}
          ${claim.timelineNote ? detailRow("Timeline", text(claim.timelineNote)) : ""}
        </dl>

        <p class="mt-3 flex items-center gap-3 text-[13px] text-ink2">
          <span>${text(claim.legalBasis)}</span>
          ${claim.verify ? `<span class="font-medium text-ochreInk">Unverified</span>` : ""}
        </p>
      </div>
    </article>
  `;
}

function renderRegister() {
  const claims = latestClaimSet.claims ?? [];
  const container = document.querySelector("#register");

  const order = [];
  const grouped = new Map();
  for (const claim of claims) {
    const heading = groupHeadingFor(claim);
    if (!grouped.has(heading)) {
      grouped.set(heading, []);
      order.push(heading);
    }
    grouped.get(heading).push(claim);
  }

  let counter = 0;
  container.innerHTML = order.map((heading) => {
    const rows = grouped.get(heading).map((claim) => claimMarkup(claim, counter++)).join("");
    return `
      <h3 class="border-t border-rule bg-paper px-7 py-[7px] text-[13px] font-medium tracking-[0.06em] text-ink2">
        ${text(heading)}
      </h3>
      ${rows}
    `;
  }).join("");

  const ready = claims.filter((claim) => claim.status === "filable").length;
  const missedNames = claims
    .filter((claim) => claim.commonlyMissed)
    .map((claim) => splitTitle(claim.title).name);

  // Lead with what was found, not with what isn't ready. "0 ready to file" as the
  // headline is both discouraging and uninformative — the claims are the finding.
  document.querySelector("#summary").innerHTML = claims.length
    ? `${claims.length} claims identified${
        ready ? ` · <span class="text-neem">${ready} ready to file</span>` : ""
      }`
    : "Nothing identified yet";

  // Name the rarely-claimed entitlements in the header. This is the whole point
  // of the product, so it should not be something you have to scroll to find.
  document.querySelector("#summary-note").innerHTML = missedNames.length
    ? `Includes <span class="font-medium text-terra">${missedNames.map(text).join("</span> and <span class=\"font-medium text-terra\">")}</span> — claims most families never file.`
    : "";
  document.querySelector("#empty-state").classList.toggle(
    "hidden",
    claims.length > 0 || (latestClaimSet.cards ?? []).length > 0,
  );

  // Share guidance is meaningless before there is anything to divide.
  const shares = document.querySelector("#shares-note");
  shares.classList.toggle("hidden", !latestClaimSet.sharesNote || !claims.length);
  shares.textContent = latestClaimSet.sharesNote ?? "";
}

function renderCards() {
  const cards = latestClaimSet.cards ?? [];
  document.querySelector("#card-list").innerHTML = cards.length
    ? `<h3 class="border-t border-rule bg-paper px-7 py-[7px] text-[13px] font-medium tracking-[0.06em] text-ink2">
         Worth checking
       </h3>
       ${cards.map((card) => `
         <article class="border-t border-rule px-7 py-4">
           <h4 class="text-[17px] font-medium text-ink">${text(card.title)}</h4>
           <p class="mt-1 text-[15px] leading-[1.5] text-ink2">${text(card.body)}</p>
           ${card.link ? `<a class="mt-1 inline-block text-[15px] text-indigo underline" href="${text(card.link)}" target="_blank" rel="noreferrer">${text(card.link)}</a>` : ""}
         </article>
       `).join("")}`
    : "";
}

function renderGates() {
  const gates = latestClaimSet.gates ?? [];
  document.querySelector("#gate-list").innerHTML = gates.map((gate) => `
    <article class="border-t-[3px] ${gate.blocking ? "border-brick" : "border-ochre"} bg-paper px-7 py-5">
      <h3 class="text-[19px] font-medium ${gate.blocking ? "text-brick" : "text-ink"}">${text(gate.title)}</h3>
      <p class="mt-2 text-[16px] leading-[1.55] text-ink2">${text(gate.body)}</p>
    </article>
  `).join("");
}

function renderTranscript() {
  const answered = steps.slice(0, Math.max(0, Math.min(stepIndex, steps.length)));
  document.querySelector("#transcript").innerHTML = answered.map((step) => `
    <div class="flex gap-5 border-b border-ruleSoft py-[9px]">
      <dt class="w-[128px] shrink-0 text-[14px] text-ink2">${text(step.label)}</dt>
      <dd class="text-[16px]">${text(step.summary)}</dd>
    </div>
  `).join("");
}

function relevantDocuments() {
  const byId = new Map();
  for (const claim of latestClaimSet.claims ?? []) {
    for (const document of claim.docsRequired ?? []) {
      byId.set(document.id, document);
    }
  }
  return [...byId.values()];
}

function renderDocuments() {
  const panel = document.querySelector("#document-panel");
  const documents = relevantDocuments();
  const finished = stepIndex >= steps.length;
  panel.classList.toggle("hidden", !finished || documents.length === 0);
  if (!finished || documents.length === 0) return;

  panel.innerHTML = `
    <div class="border-t border-rule pt-5">
      <h3 class="text-[17px] font-medium text-ink">Tick what you already have</h3>
      <p class="mt-1 text-[15px] leading-[1.5] text-ink2">
        A missing document holds up the filing, not the claim.
      </p>
      <div class="mt-3">
        ${documents.map((document) => `
          <label class="flex cursor-pointer items-center gap-3 border-b border-ruleSoft py-[9px] text-[16px]">
            <input
              class="h-[15px] w-[15px] accent-indigo"
              type="checkbox"
              data-document-id="${text(document.id)}"
              ${profile.documents[document.id] === "yes" ? "checked" : ""}
            />
            <span>${text(document.label)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `;

  panel.querySelectorAll("input[data-document-id]").forEach((input) => {
    input.addEventListener("change", async () => {
      profile.documents[input.dataset.documentId] = input.checked ? "yes" : "no";
      await derive();
    });
  });
}

function showStep(index) {
  const step = steps[index];
  document.querySelector("#step-label").textContent = `Question ${index + 1} of ${steps.length}`;
  document.querySelector("#question-kn").textContent = step.kn;
  document.querySelector("#question-en").textContent = step.en;
  document.querySelector("#answer-panel").innerHTML = `
    <div class="border-l-2 border-indigo pl-4">
      <p class="text-[13px] font-medium tracking-[0.06em] text-ink2">Scripted answer</p>
      <p class="mt-1 text-[17px]">${text(step.answer)}</p>
    </div>
  `;
  document.querySelector("#next-button").textContent = "Use this answer";
}

function showDocumentStep() {
  stepIndex = steps.length;
  document.querySelector("#step-label").textContent = "Last step";
  document.querySelector("#question-kn").textContent = "ನಿಮ್ಮ ಬಳಿ ಇರುವ ದಾಖಲೆಗಳನ್ನು ಗುರುತಿಸಿ.";
  document.querySelector("#question-en").textContent = "Tick the documents your family already has.";
  document.querySelector("#answer-panel").innerHTML = "";
  document.querySelector("#next-button").classList.add("hidden");
  renderDocuments();
}

function render() {
  renderGates();
  renderRegister();
  renderCards();
  renderTranscript();
  renderDocuments();
}

document.querySelector("#next-button").addEventListener("click", async () => {
  if (stepIndex === -1) {
    stepIndex = 0;
    showStep(stepIndex);
    return;
  }

  mergeProfile(steps[stepIndex].patch);
  stepIndex += 1;
  await derive();
  if (stepIndex < steps.length) showStep(stepIndex);
  else showDocumentStep();
});

document.querySelector("#reset-button").addEventListener("click", () => location.reload());

async function initialise() {
  const demo = new URLSearchParams(location.search).get("demo");
  if (demo === "complete" || demo === "ready") {
    for (const step of steps) mergeProfile(step.patch);
    stepIndex = steps.length;
    await derive();
    if (demo === "ready") {
      for (const document of relevantDocuments()) {
        profile.documents[document.id] = "yes";
      }
      await derive();
    }
    showDocumentStep();
    return;
  }

  await derive();
}

initialise();
