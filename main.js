let data = []; 
async function loadPenalties() {
    try {
        const response = await fetch('./penalties.json');

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error loading JSON:", error);
        return null;
    }
}

async function init() {
    data = await loadPenalties();
    const penaltyDiv = document.getElementById("penalties");

    data.forEach((penalty, index) => {
        penaltyDiv.innerHTML += `
        <div class="penalty">
        <input type="checkbox" id="chk${index}">
        <label for="chk${index}"><b>${penalty.id}:</b> ${penalty.description}</label>
        </div>
        <br>
    `;
    });
}

document.getElementById("btnCalculate").addEventListener("click",() => {
    const period = document.getElementById("period").value;
    let rubricScore = parseFloat(document.getElementById("rubricScore").value);
    let total = rubricScore;
    let resultText = `Nota Rubrica: ${rubricScore}\n\n`;

    data.forEach((penalty, index) => {
        if (document.getElementById(`chk${index}`).checked) {
            total += penalty[period];
            resultText += `${penalty.id}: ${penalty.description} (${penalty[period]})\n\n`;
        }
    });

    if (total < 0) total = 0.1;

    resultText += `Nota final: ${total.toFixed(1)}`;
    document.getElementById("result").textContent = resultText;
});

init();




