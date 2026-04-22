class Clima {
    constructor() {
        // Clave de la API de OpenWeather
        this.apiKey = "8ed43ef9eeb517f7950dd7d9a75f812e";
        // Coordenadas de la ciudad seleccionada
        this.lat = null;
        this.lon = null;
    }

    // Obtiene el clima actual de una ciudad ingresada por el usuario
    async obtenerClima(ciudad) {
        try {
            // Codificar la ciudad para evitar errores en la URL
            const ciudadCodificada = encodeURIComponent(ciudad);
            // URL para obtener coordenadas (latitud y longitud)
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${ciudadCodificada}&appid=${this.apiKey}&limit=1`;

            console.log("Búsqueda:", ciudad);
            
             // Petición a la API de geolocalización
            const geoRespuesta = await fetch(geoUrl);
            const geoData = await geoRespuesta.json();

            // Validar si la ciudad fue encontrada
            if (geoData.length === 0) {
                alert("Ciudad no encontrada.\nIntenta: 'San José, CR' o 'Lima, PE'");
                console.error("No se encontraron resultados de geocoding");
                return;
            }

            // Extraer coordenadas de la primera coincidencia
            const { lat, lon, state } = geoData[0];

            // Guardar coordenadas para su uso
            this.lat = lat;
            this.lon = lon;

            console.log(`Ciudad: ${state}, Coordenadas: lat=${lat}, lon=${lon}`);

            //Guardar la última ciudad buscada en el Local Storage (llamar método)
            this.guardarCiudadLS(ciudad);

            // URL para obtener el clima actual usando coordenadas
            const climaUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;

            // Petición a la API de clima
            const climaRespuesta = await fetch(climaUrl);
            // Validar respuesta
            if (!climaRespuesta.ok) {
                throw new Error(`Error HTTP: ${climaRespuesta.status}`);
            }

            // Convertir respuesta a JSON
            const datos = await climaRespuesta.json();
            console.log("Datos de clima recibidos:", datos);
            
            // Mostrar clima en la interfaz (llamar método)
            this.mostrarClima(datos);

            // Obtener pronóstico de los siguientes días
            await this.obtenerPronosticoDias(lat, lon);

        } catch (error) {
            console.error("Error:", error);
            alert("Error al buscar. Verifica tu conexión e intenta de nuevo.");
        }
    }

    // Muestra en la interfaz los datos del clima actual
    mostrarClima(datos) {
        try {
            //Íconos a mostrar según las condiciones climáticas
            const climaAIcono = {
                "Clear": "wb_sunny",
                "Clouds": "wb_cloudy",
                "Cloudy": "partly_cloudy_day",
                "Rain": "umbrella",
                "Drizzle": "rainy_light",
                "Thunderstorm": "thunderstorm",
                "Snow": "snowflake",
                "Mist": "cloud",
                "Smoke": "cloud",
                "Haze": "cloud",
                "Dust": "cloud",
                "Fog": "foggy",
                "Sand": "cloud",
                "Ash": "cloud",
                "Squall": "air",
                "Tornado": "cyclone"
            };
            
            // Obtener el tipo de clima principal
            const tipoClima = datos.weather[0].main;
            // Seleccionar el ícono correspondiente (valor por defecto si no coincide)
            const iconoMaterial = climaAIcono[tipoClima] || "wb_cloudy";
            // Actualizar ícono principal en la interfaz
            const weatherIcon = document.getElementById("weatherIcon");
            weatherIcon.textContent = iconoMaterial;
            
             // Mostrar datos principales
            document.getElementById("cityName").textContent = `${datos.name}, ${datos.sys.country}`;
            document.getElementById("temperature").textContent = Math.round(datos.main.temp) + "°C";
            document.getElementById("description").textContent = datos.weather[0].description;
            document.getElementById("humidity").textContent = datos.main.humidity + "%";
            document.getElementById("wind").textContent = Math.round(datos.wind.speed) + " km/h";
            
            // Registro de información en consola
            console.log("CLIMA MOSTRADO EN PANTALLA");
            console.log(`Ubicación: ${datos.name}, ${datos.sys.country}`);
            console.log(`Temperatura: ${Math.round(datos.main.temp)}°C`);
            console.log(`Sensación térmica: ${Math.round(datos.main.feels_like)}°C`);
            console.log(`Humedad: ${datos.main.humidity}%`);
            console.log(`Viento: ${Math.round(datos.wind.speed)} km/h`);
            console.log(`Descripción: ${datos.weather[0].description}`);

        } catch (error) {
            console.error("Error al mostrar el clima:", error);
            alert("Error al procesar los datos.");
        }
    }

    // Obtiene el pronóstico del clima para los próximos días
    async obtenerPronosticoDias(lat, lon) {
        try {
            // URL utilizando coordenadas para mayor precisión
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;

            console.log("URL Pronóstico:", url);

             // Petición a la API
            const respuesta = await fetch(url);
            // Validar respuesta
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            // Convertir respuesta a JSON
            const datos = await respuesta.json();
            console.log("Datos de pronóstico recibidos:", datos);

            // Mostrar los datos del pronóstico en la interfaz (llamar método)
            this.mostrarPronosticoDias(datos);
        } catch (error) {
            console.error("Error al obtener pronóstico:", error);
        }
    }

    // Muestra el pronóstico del clima para los próximos días en la interfaz
    mostrarPronosticoDias(datos) {
        try {
             // Contenedor donde se insertarán las tarjetas del pronóstico
            const contenedorDias = document.getElementById("forecastContainer");
            // Limpiar contenido previo
            contenedorDias.innerHTML = "";

            // Agrupar datos por fecha (la API devuelve datos cada 3 horas)
            const diasAgrupados = {};
            datos.list.forEach(item => {const fecha = item.dt_txt.split(" ")[0];
                // Guardar solo el primer registro de cada día
                if (!diasAgrupados[fecha]){
                    diasAgrupados[fecha] = item;
                }
            });

             // Convertir a arreglo y seleccionar los próximos 6 días (se omite el día actual)
            const dias = Object.values(diasAgrupados).slice(1,7);

            console.log("Pronóstico para", dias.length, "días");

            // Recorrer cada día y crear su tarjeta correspondiente
            dias.forEach((dia) => {
                const fecha = new Date(dia.dt * 1000);
                const nombreDia = fecha.toLocaleDateString("es-ES", { weekday: "short" });
                const diaNumero = fecha.toLocaleDateString("es-ES", { day: "numeric" });
                const temp = Math.round(dia.main.temp);
                const iconoCode = dia.weather[0].icon;
                
                // Relación entre códigos de OpenWeather e íconos
                const climaAIcono = {
                    "01d": "wb_sunny", "01n": "wb_sunny",
                    "02d": "wb_cloudy", "02n": "wb_cloudy",
                    "03d": "cloud", "03n": "cloud",
                    "04d": "wb_cloudy", "04n": "wb_cloudy",
                    "09d": "grain", "09n": "grain",
                    "10d": "grain", "10n": "grain",
                    "11d": "thunderstorm", "11n": "thunderstorm",
                    "13d": "ac_unit", "13n": "ac_unit",
                    "50d": "cloud", "50n": "cloud"
                };
                
                // Seleccionar ícono correspondiente
                const iconoMaterial = climaAIcono[iconoCode] || "cloud";

                // Crear tarjeta del pronóstico
                const card = document.createElement("div");
                card.classList.add("forecast-card");
                card.innerHTML = `
                    <p>${nombreDia}</p>
                    <p style="font-size: 20px;">${diaNumero}</p>
                    <span class="material-icons" style="font-size: 55px; color: #ffffff; filter: drop-shadow(0 7px 4px rgba(0, 0, 0, 0.25));">${iconoMaterial}</span>
                    <p>${temp}°C</p>
                `;

                // Insertar tarjeta en el contenedor
                contenedorDias.appendChild(card);
            });
        } catch (error) {
            console.error("Error al mostrar pronóstico:", error);
        }
    }

    // Guarda la última ciudad buscada en el Local Storage
    guardarCiudadLS(ciudad){
        localStorage.setItem("ultimaCiudad",ciudad);
    }
    // Obtiene la última ciudad guardada en el Local Storage
    obtenerCiudadLS(){
        return localStorage.getItem("ultimaCiudad");
    }
    // Guarda el tema actual de la aplicación (dark/light) en el Local Storage
    guardarTemaLS(tema) {
    localStorage.setItem("tema", tema);
    }
    // Obtiene el último tema guardado (dark/light) en el Local Storage 
    obtenerTemaLS() {
        return localStorage.getItem("tema");
    }
}