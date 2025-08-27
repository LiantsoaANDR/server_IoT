let data = []

async function loadFiles() {
    const response = await fetch("/list");
    const files = await response.json();
    // const files = ["esp32_test","test2"]
    data = files
}
function renderFiles (dataParams){   
    const container = document.getElementById("file-list");
    container.innerHTML = "";
    dataParams.forEach(file => {
        const device = file.replace(".json", "");
        const div = document.createElement("div");
        div.className ='line'    
        div.innerHTML = `
            <strong>${file}</strong>
            <div class="action">
                <button onclick="viewFile('${device}')" class="action-button"> <img src="visualisation.png" alt="visualiser" width="20"></button>
                <button onclick="downloadFile('${device}')" class="action-button"><img src="telecharger.png" alt="Télécharger" width="20"></button>
                <button onclick="confirmDelete('${device}')" class="action-button"><img src="supprimer.png" alt="supprimer" width="20"></button>
            </div>

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
    renderFiles(data)
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


//search-button


const search = () =>{
    const input = document.querySelector("#q")
    const i = input.value.trim().toLowerCase()
    let filtered=data.filter(elt =>elt.includes(i))    
    renderFiles(filtered)
}

    const searchinput = document.querySelector("#q")
    searchinput.oninput = () =>{
        const query =searchinput.value.trim().toLowerCase()
        const filtered = data.filter(elt => elt.includes(query))       
        renderFiles(filtered)
    }

// init
loadFiles()
renderFiles(data);