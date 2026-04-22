// Instancia de clase Clima
const clima = new Clima();

// Referencias a elementos del DOM
const inputBuscar = document.getElementById("cityInput");
const btnBuscar = document.getElementById("searchBtn");
const themeCheckbox = document.getElementById('theme-checkbox');
const body = document.body;

// Obtener datos almacenados en Local Storage
const ultimaCiudad = clima.obtenerCiudadLS();
const temaGuardado = clima.obtenerTemaLS();

/* Obtiene el valor ingresado por el usuario y realiza la búsqueda del clima.
 * Valida que el campo no esté vacío antes de ejecutar la consulta.*/
function buscarClima() {
    const ciudad = inputBuscar.value.trim();
    if (ciudad === "") {
        alert("Ingresa una ciudad (ej: San José, CR)");
        return;
    }
    clima.obtenerClima(ciudad);
}

// Muestra la fecha y hora actual del sistema en la interfaz
function mostrarHora() {
    const now = new Date()

    let hours = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    const fecha = now.toLocaleDateString('es-ES',opciones);
    const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    const datetime = `${fechaCap}, ${hours}:${minutes}:${seconds}`;
    document.getElementById('date-hour').textContent = datetime
}

// Inicializar reloj
mostrarHora();
//Actualizar hora cada segundo
setInterval(mostrarHora, 1000); 

// Eventos de búsqueda
btnBuscar.addEventListener("click", buscarClima);
inputBuscar.addEventListener("keypress", (e) => {if (e.key === "Enter") {buscarClima();}});
// Cargar última ciudad almacenada al iniciar la aplicación
if (ultimaCiudad) {clima.obtenerClima(ultimaCiudad);}

// Manejar el cambio de tema (dark/light)
themeCheckbox.addEventListener('change', () => {
    const isDark = themeCheckbox.checked;
    body.classList.toggle('dark', isDark);
    clima.guardarTemaLS(isDark ? 'dark' : 'light');
});

//Aplicar el tema guardado al cargar la aplicación
if (temaGuardado === 'dark') {
    body.classList.add('dark');
    themeCheckbox.checked = true;
} else {
    body.classList.remove('dark');
    themeCheckbox.checked = false;
}