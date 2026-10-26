const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
$("#year").textContent = new Date().getFullYear();

const toolNames = {
  counter: "Word & Character Counter",
  case: "Case Converter",
  spaces: "Remove Extra Spaces",
  percentage: "Percentage Calculator",
  discount: "Discount Calculator",
  age: "Age Calculator",
  gst: "GST Calculator"
};
const workspace = $("#workspace");
const content = $("#toolContent");
const title = $("#workspaceTitle");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}
function panel(html) {
  content.innerHTML = `<div class="tool-panel">${html}</div>`;
}
function openTool(name) {
  if (!toolNames[name]) return;
  title.textContent = toolNames[name];
  workspace.classList.remove("hidden");
  const templates = {
    counter: `<label for="textInput">Enter or paste your text</label><textarea id="textInput" placeholder="Start typing here…"></textarea>
      <div class="stats"><div class="stat"><strong id="wordCount">0</strong><span>Words</span></div><div class="stat"><strong id="charCount">0</strong><span>Characters</span></div><div class="stat"><strong id="noSpaceCount">0</strong><span>Without spaces</span></div></div>
      <div class="button-row"><button class="secondary-btn" id="clearText">Clear text</button></div>`,
    case: `<label for="caseInput">Enter your text</label><textarea id="caseInput" placeholder="Type text to convert…"></textarea><div class="button-row"><button class="primary-btn" data-case="upper">UPPERCASE</button><button class="secondary-btn" data-case="lower">lowercase</button><button class="secondary-btn" data-case="title">Title Case</button><button class="secondary-btn" data-case="sentence">Sentence case</button></div><label for="caseOutput">Converted text</label><textarea id="caseOutput" placeholder="Your result will appear here…" readonly></textarea><button class="secondary-btn" id="copyCase">Copy result</button>`,
    spaces: `<label for="spaceInput">Text to clean</label><textarea id="spaceInput" placeholder="Paste text with extra spaces or blank lines…"></textarea><div class="button-row"><button class="primary-btn" id="cleanSpaces">Remove extra spaces</button><button class="secondary-btn" id="clearSpaces">Clear</button></div><label for="spaceOutput">Cleaned text</label><textarea id="spaceOutput" readonly placeholder="Your cleaned text will appear here…"></textarea><button class="secondary-btn" id="copySpaces">Copy result</button>`,
    percentage: `<div class="field-grid"><div><label for="percentValue">Percentage (%)</label><input id="percentValue" type="number" inputmode="decimal" placeholder="e.g. 15"></div><div><label for="percentBase">Number</label><input id="percentBase" type="number" inputmode="decimal" placeholder="e.g. 800"></div></div><button class="primary-btn" id="calculatePercent">Calculate</button><div class="result" id="percentResult">Enter values to calculate.</div><p class="helper">Formula: percentage ÷ 100 × number.</p>`,
    discount: `<div class="field-grid"><div><label for="originalPrice">Original price (₹)</label><input id="originalPrice" type="number" min="0" inputmode="decimal" placeholder="e.g. 2000"></div><div><label for="discountRate">Discount (%)</label><input id="discountRate" type="number" min="0" max="100" inputmode="decimal" placeholder="e.g. 20"></div></div><button class="primary-btn" id="calculateDiscount">Calculate discount</button><div class="result" id="discountResult">Enter a price and discount rate.</div>`,
    age: `<label for="birthDate">Date of birth</label><input id="birthDate" type="date"><label for="asOfDate">Calculate age on</label><input id="asOfDate" type="date"><button class="primary-btn" id="calculateAge">Calculate age</button><div class="result" id="ageResult">Choose both dates to calculate age.</div><p class="helper">The selected date cannot be earlier than your birth date.</p>`,
    gst: `<div class="field-grid"><div><label for="gstAmount">Amount (₹)</label><input id="gstAmount" type="number" min="0" inputmode="decimal" placeholder="e.g. 1000"></div><div><label for="gstRate">GST rate</label><select id="gstRate"><option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18" selected>18%</option><option value="28">28%</option></select></div></div><label for="gstMode">Amount entered</label><select id="gstMode"><option value="exclusive">Price before GST (add GST)</option><option value="inclusive">Price includes GST (extract GST)</option></select><button class="primary-btn" id="calculateGst">Calculate GST</button><div class="result" id="gstResult">Enter an amount to calculate.</div><p class="helper">This is a basic estimate. Confirm the applicable GST rate for your product or service.</p>`
  };
  panel(templates[name]);
  wireTool(name);
  workspace.scrollIntoView({behavior:"smooth", block:"start"});
}
function numberFrom(id) {
  const el = document.getElementById(id);
  return el && el.value.trim() !== "" ? Number(el.value) : NaN;
}
function money(value) {
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(value);
}
async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const previous = button.textContent; button.textContent = "Copied!";
    setTimeout(() => button.textContent = previous, 1200);
  } catch {
    alert("Copy is not available in this browser. Please select the result and copy it manually.");
  }
}
function wireTool(name) {
  if (name === "counter") {
    const input = $("#textInput");
    const update = () => {
      const value = input.value;
      const trimmed = value.trim();
      $("#wordCount").textContent = trimmed ? trimmed.split(/\s+/u).length : 0;
      $("#charCount").textContent = value.length;
      $("#noSpaceCount").textContent = value.replace(/\s/gu, "").length;
    };
    input.addEventListener("input", update);
    $("#clearText").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
  }
  if (name === "case") {
    $$("[data-case]").forEach(button => button.addEventListener("click", () => {
      const value = $("#caseInput").value;
      let result = value;
      if (button.dataset.case === "upper") result = value.toLocaleUpperCase();
      if (button.dataset.case === "lower") result = value.toLocaleLowerCase();
      if (button.dataset.case === "title") result = value.toLocaleLowerCase().replace(/(^|[\s\-'])\p{L}/gu, match => match.toLocaleUpperCase());
      if (button.dataset.case === "sentence") result = value.toLocaleLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, match => match.toLocaleUpperCase());
      $("#caseOutput").value = result;
    }));
    $("#copyCase").addEventListener("click", e => copyText($("#caseOutput").value, e.currentTarget));
  }
  if (name === "spaces") {
    $("#cleanSpaces").addEventListener("click", () => {
      $("#spaceOutput").value = $("#spaceInput").value.split(/\r?\n/u).map(line => line.replace(/[^\S\r\n]+/gu, " ").trim()).filter((line, index, all) => line !== "" || (index > 0 && all[index-1] !== "")).join("\n");
    });
    $("#clearSpaces").addEventListener("click", () => { $("#spaceInput").value = ""; $("#spaceOutput").value = ""; });
    $("#copySpaces").addEventListener("click", e => copyText($("#spaceOutput").value, e.currentTarget));
  }
  if (name === "percentage") {
    $("#calculatePercent").addEventListener("click", () => {
      const p = numberFrom("percentValue"), n = numberFrom("percentBase");
      $("#percentResult").textContent = Number.isFinite(p) && Number.isFinite(n) ? `${p}% of ${n} = ${(p/100*n).toLocaleString("en-IN",{maximumFractionDigits:6})}` : "Please enter valid numbers in both fields.";
    });
  }
  if (name === "discount") {
    $("#calculateDiscount").addEventListener("click", () => {
      const price = numberFrom("originalPrice"), rate = numberFrom("discountRate");
      if (!Number.isFinite(price) || !Number.isFinite(rate) || price < 0 || rate < 0 || rate > 100) { $("#discountResult").textContent = "Enter a price of 0 or more and a discount from 0% to 100%."; return; }
      const saving = price*rate/100;
      $("#discountResult").innerHTML = `You save <strong>${money(saving)}</strong>Final price: <strong>${money(price-saving)}</strong>`;
    });
  }
  if (name === "age") {
    const today = new Date();
    const localDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    $("#asOfDate").value = localDate(today);
    $("#birthDate").max = localDate(today);
    $("#asOfDate").addEventListener("change", () => $("#birthDate").max = $("#asOfDate").value || localDate(today));
    $("#calculateAge").addEventListener("click", () => {
      const birthRaw = $("#birthDate").value, asRaw = $("#asOfDate").value;
      if (!birthRaw || !asRaw) { $("#ageResult").textContent = "Please choose both dates."; return; }
      const [by,bm,bd] = birthRaw.split("-").map(Number), [ay,am,ad] = asRaw.split("-").map(Number);
      const birth = new Date(Date.UTC(by,bm-1,bd)), end = new Date(Date.UTC(ay,am-1,ad));
      if (end < birth) { $("#ageResult").textContent = "The calculation date must be on or after the birth date."; return; }
      let years = ay-by, months = am-bm, days = ad-bd;
      if (days < 0) { months--; days += new Date(Date.UTC(ay,am-1,0)).getUTCDate(); }
      if (months < 0) { years--; months += 12; }
      $("#ageResult").innerHTML = `Age<strong>${years} years, ${months} months, ${days} days</strong>`;
    });
  }
  if (name === "gst") {
    $("#calculateGst").addEventListener("click", () => {
      const amount = numberFrom("gstAmount"), rate = numberFrom("gstRate"), mode = $("#gstMode").value;
      if (!Number.isFinite(amount) || amount < 0) { $("#gstResult").textContent = "Please enter a valid amount of 0 or more."; return; }
      const tax = mode === "exclusive" ? amount*rate/100 : amount*rate/(100+rate);
      const base = mode === "exclusive" ? amount : amount-tax;
      const total = mode === "exclusive" ? amount+tax : amount;
      $("#gstResult").innerHTML = `Base amount<strong>${money(base)}</strong>GST amount<strong>${money(tax)}</strong>Total price<strong>${money(total)}</strong>`;
    });
  }
}

$$(".open-tool").forEach(button => button.addEventListener("click", () => openTool(button.dataset.tool)));
$("#closeTool").addEventListener("click", () => { workspace.classList.add("hidden"); content.innerHTML = ""; $("#tools").scrollIntoView({behavior:"smooth"}); });
$("#toolSearch").addEventListener("input", () => {
  const query = $("#toolSearch").value.toLocaleLowerCase().trim();
  let visible = 0;
  $$(".tool-card").forEach(card => {
    const matches = (card.dataset.search + " " + card.innerText).toLocaleLowerCase().includes(query);
    card.classList.toggle("hidden", !matches);
    if (matches) visible++;
  });
  $("#noResults").classList.toggle("hidden", visible > 0);
});
