async function loadFiles() {
    const response = await fetch("/list");
    const files = await response.json();

    const container = document.getElementById("file-list");
    container.innerHTML = "";

    files.forEach(file => {
        const device = file.replace(".json", "");
        const div = document.createElement("div");

        div.innerHTML = `
            <strong>${file}</strong>
            <button onclick="viewFile('${device}')">👀 Voir</button>
            <button onclick="downloadFile('${device}')">⬇ Télécharger</button>
            <button onclick="confirmDelete('${device}')">🗑 Supprimer</button>
        `;
        container.appendChild(div);
    });
}

async function viewFile(device) {
    const response = await fetch(`/download/${device}`);
    const text = await response.text();
    const win = window.open("", "_blank");
    win.document.body.innerHTML = `<pre>${text}</pre>`;
}

function downloadFile(device) {
    window.open(`/download/${device}`);
}

async function deleteFile(device) {
    await fetch(`/delete/${device}`, { method: "DELETE" });
    loadFiles();
}

// Ajoute cette fonction pour la confirmation
function confirmDelete(device) {
    // Crée la boîte de dialogue
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.3)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
        <div style="background:#fff;padding:20px;border-radius:8px;box-shadow:0 2px 8px #0002;text-align:center;">
            <p>Voulez-vous vraiment supprimer <strong>${device}.json</strong> ?</p>
            <button id="confirmBtn">Confirmer</button>
            <button id="cancelBtn">Annuler</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("confirmBtn").onclick = async () => {
        await deleteFile(device);
        document.body.removeChild(modal);
    };
    document.getElementById("cancelBtn").onclick = () => {
        document.body.removeChild(modal);
    };
}

loadFiles();
