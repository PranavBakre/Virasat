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
    kn: "ನಿಮ್ಮ ಬಳಿ ಮರಣ ಪ್ರಮಾಣಪತ್ರ ಇದೆಯೇ?",
    en: "Do you have the death certificate?",
    answer: "Yes, we have it.",
    patch: { deathCertificate: "yes", documents: { "death-certificate": "yes" } },
  },
  {
    kn: "ಅವರಿಗೆ ಬ್ಯಾಂಕ್ ಖಾತೆ ಇತ್ತೇ?",
    en: "Did your husband have a bank account?",
    answer: "Yes — an SBI account with me as nominee.",
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
    kn: "ಅವರು ಕೆಲಸದಲ್ಲಿದ್ದರೇ?",
    en: "Was your husband working at the time?",
    answer: "Yes, he was in a salaried job.",
    patch: { employment: "employed-at-death" },
  },
  {
    kn: "ಅವರಿಗೆ ಪಿಎಫ್ ಖಾತೆ ಇತ್ತೇ?",
    en: "Did he have a provident-fund account?",
    answer: "Yes, through his employer.",
    patch: { epfo: { exists: "yes", uanKnown: "yes", serviceYears: 22 } },
  },
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

function claimMarkup(claim) {
  const border = claim.status === "filable"
    ? "border-neem"
    : claim.status === "blocked"
      ? "border-ochre"
      : "border-ink2";
  const status = claim.status === "filable"
    ? "File today"
    : claim.status === "blocked"
      ? "Waiting on documents"
      : "Confirm details";
  const titleColour = claim.commonlyMissed ? "text-terra" : "text-indigo";
  const forms = claim.forms.length ? claim.forms.map(text).join(" · ") : "No prescribed form listed";
  const missingLabels = claim.docsRequired
    .filter((document) => document.have !== "yes")
    .map((document) => document.label);
  const missing = missingLabels.length
    ? `<p class="mt-2 text-[15px] text-ink2">Missing: ${missingLabels.map(text).join(" · ")}</p>`
    : "";

  return `
    <article class="border-l-[3px] ${border} bg-paper px-6 py-5 shadow-paper">
      <div class="flex items-start justify-between gap-5">
        <h3 class="text-[19px] font-semibold ${titleColour}">${text(claim.title)}</h3>
        <span class="whitespace-nowrap text-[14px] font-medium text-ink2">${status}</span>
      </div>
      <p class="mt-3 text-[15px] font-medium text-ink2">File at</p>
      <p>${text(claim.authority)}</p>
      <p class="mt-3 text-[15px] text-ink2">${forms}</p>
      ${missing}
      <div class="mt-4 flex items-center gap-3 border-t border-rule pt-3 text-[14px] text-ink2">
        <span>Source ${text(claim.legalBasis)}</span>
        ${claim.verify ? "<span class=\"font-medium uppercase tracking-[0.08em]\">[Verify]</span>" : ""}
      </div>
    </article>
  `;
}

function renderClaims() {
  const claims = latestClaimSet.claims ?? [];
  const cards = latestClaimSet.cards ?? [];
  document.querySelector("#claim-list").innerHTML = claims.map(claimMarkup).join("");
  document.querySelector("#card-list").innerHTML = cards.map((card) => `
    <article class="border-l-[3px] border-ink2 bg-paper px-6 py-4">
      <h3 class="text-[17px] font-medium text-indigo">${text(card.title)}</h3>
      <p class="mt-1 text-[15px] text-ink2">${text(card.body)}</p>
    </article>
  `).join("");

  const filable = claims.filter((claim) => claim.status === "filable").length;
  document.querySelector("#summary").textContent = claims.length
    ? `${claims.length} claims · ${filable} filable now${cards.length ? ` · ${cards.length} to check` : ""}`
    : "No claims identified yet";
  document.querySelector("#empty-state").classList.toggle("hidden", claims.length > 0 || cards.length > 0);
}

function renderGates() {
  const gates = latestClaimSet.gates ?? [];
  document.querySelector("#gate-list").innerHTML = gates.map((gate) => `
    <article class="mb-5 border-l-[3px] ${gate.blocking ? "border-brick" : "border-ochre"} bg-paper px-6 py-5">
      <h3 class="text-[19px] font-semibold text-indigo">${text(gate.title)}</h3>
      <p class="mt-2 text-ink2">${text(gate.body)}</p>
    </article>
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
    <div class="border-t border-rule pt-6">
      <h2 class="text-[19px] font-semibold text-indigo">Documents you have</h2>
      <p class="mt-1 text-[15px] text-ink2">Missing documents block filing, not the claim itself.</p>
      <div class="mt-4 space-y-3">
        ${documents.map((document) => `
          <label class="flex items-start gap-3 border-b border-rule pb-3">
            <input
              class="mt-1 h-4 w-4 accent-indigo"
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
    <div class="border-l-[3px] border-indigo bg-surface px-5 py-4 shadow-paper">
      <p class="text-[14px] font-medium uppercase tracking-[0.08em] text-ink2">Scripted answer</p>
      <p class="mt-1">${text(step.answer)}</p>
    </div>
  `;
  document.querySelector("#next-button").textContent = "Use this answer";
}

function showDocumentStep() {
  stepIndex = steps.length;
  document.querySelector("#step-label").textContent = "Document check";
  document.querySelector("#question-kn").textContent = "ನಿಮ್ಮ ಬಳಿ ಇರುವ ದಾಖಲೆಗಳನ್ನು ಗುರುತಿಸಿ.";
  document.querySelector("#question-en").textContent = "Tick the documents your family already has.";
  document.querySelector("#answer-panel").innerHTML = "";
  document.querySelector("#next-button").classList.add("hidden");
  renderDocuments();
}

function render() {
  renderGates();
  renderClaims();
  renderDocuments();
}

document.querySelector("#next-button").addEventListener("click", async () => {
  if (stepIndex === -1) {
    stepIndex = 0;
    showStep(stepIndex);
    return;
  }

  mergeProfile(steps[stepIndex].patch);
  await derive();
  stepIndex += 1;
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
