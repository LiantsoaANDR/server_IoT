let data = []
let dataRender=data
let currentPage=0
async function loadFiles() {
    const response = await fetch("/list");
    const files = await response.json();
    data = files
    dataRender = data
}
function renderFiles (dataParams, start = currentPage) {   
    const container = document.getElementById("file-list");
    container.innerHTML = "";

    dataParams = dataParams.slice(start, start + 10);

    dataParams.forEach(file => {
        const device = file.device.replace(".json", "");
        const div = document.createElement("div");
        div.className = 'line';    

        // Vérification taille (limite 1 Mo)
        const tooBig = file.size > 1 * 1024 * 1024;

        div.innerHTML = `
            <strong>${file.device}</strong> 
            <span style="margin-left:10px; color:gray;">(${file.size} octets)</span>
            <div class="action">
                <button 
                    onclick="${tooBig ? `showNotification('⚠️ Le fichier ${device} est trop volumineux pour être visualisé (${(file.size/(1024*1024)).toFixed(1)} Mo)', 'warning')` : `viewFile('${device}')`}"                     class="action-button"
                >
                    <img src="visualisation.png" alt="visualiser" width="20">
                </button>
                <button onclick="downloadFile('${device}')" class="action-button">
                    <img src="telecharger.png" alt="Télécharger" width="20">
                </button>
                <button onclick="confirmDelete('${device}')" class="action-button">
                    <img src="supprimer.png" alt="supprimer" width="20">
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}





//-------------------------//
async function viewFile(device) {
    const response = await fetch(`/download/${device}`);
    const data = await response.json();       
    const win = window.open("", "_blank");
    const keys = Array.from(data.reduce((set, obj) => {
        Object.keys(obj).forEach(k => set.add(k));
        return set;
    }, new Set()));

    const html = `
        <html>
        <head>
            <title>Visualisation de ${device}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                table { width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                th, td { padding: 10px 15px; border: 1px solid #ddd; text-align: center; }
                th { background-color: #4CAF50; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h3> ${device}</h3>
            <table>
                <thead>
                    <tr>
                        ${keys.map(k => `<th>${k}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(obj => `
                        <tr>
                            ${keys.map(k => `<td>${obj[k] !== undefined ? obj[k] : ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    win.document.write(html);
    win.document.close();
}



function downloadFile(device) {
    window.open(`/download/${device}`);
}

async function deleteFile(device) {
    try {
        await fetch(`/delete/${device}`, { method: "DELETE" });
        await loadFiles();
        currentPage = 0;
        renderFiles(data);
        showNotification(`Le fichier ${device} a été supprimé.`, "success");
    } catch (e) {
        showNotification("Erreur lors de la suppression du fichier.", "error");
    }
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
    const input = document.querySelector("#q");
    const i = input.value.trim().toLowerCase();
    dataRender = data.filter(elt => elt.device.toLowerCase().includes(i));
    renderFiles(dataRender);
}

const searchinput = document.querySelector("#q");
searchinput.oninput = () =>{
    const query = searchinput.value.trim().toLowerCase();
    if(query === ""){
        dataRender = data;
    } else {
        dataRender = data.filter(elt => elt.device.toLowerCase().includes(query));
    }
    currentPage = 0;
    renderFiles(dataRender);
}

//prec and next

const nextFunction = () =>{   
    if(currentPage+10<=dataRender.length){
    currentPage = currentPage +10
    renderFiles(dataRender,currentPage)
    }
}
const precFunction = () =>{
   if(currentPage-10>=0){
    currentPage = currentPage -10
    renderFiles(dataRender,currentPage)
    }
}


function showNotification(message, type = "success") {
    const container = document.getElementById("notification-container");

    const notif = document.createElement("div");
    notif.textContent = message;
    notif.style.padding = "10px 15px";
    notif.style.marginBottom = "10px";
    notif.style.borderRadius = "5px";
    notif.style.color = "#fff";
    notif.style.fontSize = "14px";
    notif.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    notif.style.opacity = "0";
    notif.style.transition = "opacity 0.5s";

    if (type === "success") {
        notif.style.background = "#4caf50"; // vert
    } else if (type === "error") {
        notif.style.background = "#f44336"; // rouge
    } else {
        notif.style.background = "#faea09ff"; // neutre
            notif.style.color = "black";

    }
    container.appendChild(notif);
    setTimeout(() => { notif.style.opacity = "1"; }, 10);
    setTimeout(() => {
        notif.style.opacity = "0";
        setTimeout(() => notif.remove(), 500);
    }, 3000);
}




async function init() {
    await loadFiles();
    renderFiles(data);
}
init();