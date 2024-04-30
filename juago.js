// Selección de elementos del DOM
const tableroDeJuego = document.querySelector(".tablero");
const elementoPuntuacion = document.querySelector(".Puntuación");
const elementoRecord = document.querySelector(".Récord");
const tablaDeRankings = document.getElementById("tablaRanking");
const controles = document.querySelectorAll(".controles i");

let final = false; //juego terminado
let snakeX = 5, snakeY = 5; // Posición inicial de la cabeza de la serpiente
let comidaX, comidaY; // Posición de la comida en el tablero
let cuerpo = []; // Array que representa el cuerpo de la serpiente
let velocidadX = 0, velocidadY = 0; // Velocidad de movimiento de la serpiente
let puntos = 0; // Puntuación del jugador
let record = localStorage.getItem("Récord") || 0; // Puntuación récord almacenada en el almacenamiento local
elementoRecord.innerText = `Récord: ${record}`;
let setIntervalId; // ID del intervalo para actualizar el juego
// Función para actualizar la tabla de clasificación en la página

const actualizarRankings = () => {
    // Obtener las clasificaciones del almacenamiento local 
    let rankings = JSON.parse(localStorage.getItem("rankings")) || [];
    rankings.sort((a, b) => b.score - a.score); // Clasificaciones por puntaje descendente
    rankings = rankings.slice(0, 3); // Obtiene solo los tres primeros puntajes
    tablaDeRankings.innerHTML = "";
    rankings.forEach((entry, index) => {
        // Agrega filas a la tabla de clasificación con los nombres y puntajes
        const row = tablaDeRankings.insertRow();
        const rankCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const scoreCell = row.insertCell(2);
        let rankSuffix;
        if (index === 0) {
            rankSuffix = "º";
        } else if (index === 1) {
            rankSuffix = "º";
        } else if (index === 2) {
            rankSuffix = "º";
        }
        rankCell.textContent = `${index + 1}${rankSuffix}`;
        nameCell.textContent = entry.name;
        scoreCell.textContent = entry.score;
    });
};
const anadirRankings = (name, score) => {
    let rankings = JSON.parse(localStorage.getItem("rankings")) || [];
    const existingEntryIndex = rankings.findIndex(entry => entry.name === name);
    if (existingEntryIndex !== -1 && rankings[existingEntryIndex].score >= score) {
        return; // No actualiza si el puntaje actual es menor o igual
    }
    if (existingEntryIndex !== -1) {
        rankings.splice(existingEntryIndex, 1); // Elimina la entrada existente si el puntaje es mayor
    }
    rankings.push({ name, score });
    rankings.sort((a, b) => b.score - a.score); // Reordenar clasificaciones
    localStorage.setItem("rankings", JSON.stringify(rankings.slice(0, 3))); // Actualiza solo los tres primeros puntajes
    actualizarRankings(); // Actualiza la tabla de clasificación
};

// Función para manejar el final del juego
const paraGameOver = () => {
    const nombreJugador = prompt("Game Over! Ingresa tu nombre:"); 
    if (nombreJugador) {
        anadirRankings(nombreJugador, puntos); // Añade la entrada a la tabla de clasificación
    }
    clearInterval(setIntervalId); 
    alert("Buena suerte a la próxima! Dale al OK para empezar otra vez..."); 
    location.reload(); // Recarga la página para reiniciar el juego
};

// Función para cambiar la dirección de la serpiente
const changeDirection = e => {
    // Cambia la dirección segun la tecla presionada por el usuario
    if(e.key === "ArrowUp" && velocidadY != 1) {
        velocidadX = 0;
        velocidadY = -1;
    } else if(e.key === "ArrowDown" && velocidadY != -1) {
        velocidadX = 0;
        velocidadY = 1;
    } else if(e.key === "ArrowLeft" && velocidadX != 1) {
        velocidadX = -1;
        velocidadY = 0;
    } else if(e.key === "ArrowRight" && velocidadX != -1) {
        velocidadX = 1;
        velocidadY = 0;
    }
};

// Event listeners para los controles de dirección
controles.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));


const actualizarPosicionComida = () => {
    comidaX = Math.floor(Math.random() * 30) + 1;
    comidaY = Math.floor(Math.random() * 30) + 1;
};

// Función para iniciar el juego
const iniciarJuego = () => {
    if(final) return paraGameOver(); //  Llama a la función paraGameOver
    let html = `<div class="food" style="grid-area: ${comidaY} / ${comidaX}"></div>`; // Genera el HTML para la comida
    if(snakeX === comidaX && snakeY === comidaY) {
        actualizarPosicionComida(); // Actualiza la posición de la comida
        cuerpo.push([comidaY, comidaX]); // hace mas grande el cuerpo de la serpiente
        puntos++; // Incrementa los puntos
        record = puntos >= record ? puntos : record; // Actualiza el récord si es necesario
        localStorage.setItem("Récord", record); // Guarda el récord en el almacenamiento local
        elementoPuntuacion.innerText = `Puntuación: ${puntos}`; // Actualiza el marcador de puntos en la interfaz
        elementoRecord.innerText = `Récord: ${record}`; // Actualiza el récord en la interfaz
    }
    snakeX += velocidadX; // Mueve la serpiente en dirección X
    snakeY += velocidadY; // Mueve la serpiente en dirección Y
    for (let i = cuerpo.length - 1; i > 0; i--) {
        cuerpo[i] = cuerpo[i - 1]; // Actualiza la posición del cuerpo de la serpiente
    }
    cuerpo[0] = [snakeX, snakeY]; // Actualiza la posición de la cabeza de la serpiente
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return final = true; // Verifica si la serpiente choca contra los bordes del tablero
    }
    for (let i = 0; i < cuerpo.length; i++) {
        html += `<div class="head" style="grid-area: ${cuerpo[i][1]} / ${cuerpo[i][0]}"></div>`; // Genera el HTML para el cuerpo de la serpiente
        if (i !== 0 && cuerpo[0][1] === cuerpo[i][1] && cuerpo[0][0] === cuerpo[i][0]) {
            final = true; // Verifica si la serpiente choca consigo misma
        }
    }
    tableroDeJuego.innerHTML = html; // Actualiza el tablero de juego con el HTML generado
};

actualizarPosicionComida(); // Inicializa la posición de la comida
setIntervalId = setInterval(iniciarJuego, 100); // Inicia el intervalo para actualizar el juego cada 100ms
document.addEventListener("keyup", changeDirection); // Cambiar la dirección de la serpiente
actualizarRankings(); // Llama a la función para actualizar la tabla de clasificación al cargar la página
