let data = [];

async function loadPenalties() {
    try {
        const response = await fetch("./penalties.json");

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error loading JSON:", error);
        return [];
    }
}

function getPeriod() {
    return document.querySelector('input[name="period"]:checked').value;
}

function formatValue(value) {
    if (value === null || value === undefined) return "No aplica";
    return value.toFixed(1);
}

function renderPenalties() {
    const period = getPeriod();
    const penaltyDiv = document.getElementById("penalties");
    penaltyDiv.innerHTML = "";

    data.forEach((penalty, index) => {
        const value = penalty[period];
        const disabled = value === null || value === undefined;

        const row = document.createElement("div");
        row.className = "penalty" + (disabled ? " penalty--disabled" : "");

        row.innerHTML = `
            <input type="checkbox" id="chk${index}" ${disabled ? "disabled" : ""}>
            <span class="penalty__id">${penalty.id}</span>
            <label class="penalty__desc" for="chk${index}">${penalty.description}</label>
            <span class="penalty__value${disabled ? " penalty__value--na" : ""}">${formatValue(value)}</span>
        `;

        penaltyDiv.appendChild(row);

        const checkbox = row.querySelector("input");
        checkbox.addEventListener("change", () => {
            row.classList.toggle("penalty--checked", checkbox.checked);
            updateActiveCount();
        });
    });

    updateActiveCount();
}

function updateActiveCount() {
    const checked = document.querySelectorAll('#penalties input[type="checkbox"]:checked').length;
    const label = checked === 1 ? "1 seleccionada" : `${checked} seleccionadas`;
    document.getElementById("activeCount").textContent = label;
}

async function init() {
    data = await loadPenalties();
    renderPenalties();

    document.querySelectorAll('input[name="period"]').forEach((radio) => {
        radio.addEventListener("change", renderPenalties);
    });
}

document.getElementById("btnCalculate").addEventListener("click", () => {
    const period = getPeriod();
    const rubricScore = parseFloat(document.getElementById("rubricScore").value);

    if (Number.isNaN(rubricScore)) {
        alert("Ingresa el puntaje de la rúbrica antes de calcular.");
        return;
    }

    let totalOn100 = rubricScore;
    const penaltyEntries = [];

    data.forEach((penalty, index) => {
        const checkbox = document.getElementById(`chk${index}`);
        if (checkbox && checkbox.checked) {
            const value = penalty[period];
            totalOn100 += value;
            penaltyEntries.push(`${penalty.id}: ${penalty.description} (${value.toFixed(1)})`);
        }
    });

    if (totalOn100 < 0) totalOn100 = 0;

    let notaOn5 = (totalOn100 / 100) * 5;
    if (notaOn5 < 0.1) notaOn5 = 0.1;

    const penaltyBlock = penaltyEntries.length ? penaltyEntries.join("\n\n") + "\n\n" : "";

    const resultText =
        `Puntaje rubrica: ${rubricScore.toFixed(1)}\n\n` +
        penaltyBlock +
        `Puntaje final: ${totalOn100.toFixed(1)}\n` +
        `Nota (sobre 5.0): ${notaOn5.toFixed(1)}`;

    const resultSection = document.getElementById("resultSection");
    resultSection.hidden = false;
    document.getElementById("result").value = resultText;
    resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("copyBtn").addEventListener("click", async () => {
    const text = document.getElementById("result").value;
    const copyBtn = document.getElementById("copyBtn");

    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copiado";

        setTimeout(() => {
            copyBtn.textContent = "Copiar";
        }, 2000);
    } catch (error) {
        console.error("Copy failed:", error);
    }
});

init();