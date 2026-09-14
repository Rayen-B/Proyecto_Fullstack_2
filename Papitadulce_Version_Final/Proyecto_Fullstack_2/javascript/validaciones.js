/**
 * validaciones.js - Funciones de Validación de Formularios y Feedback Visual
 */

/*
 * Validar RUN chileno con Dígito Verificador (Módulo 11)
 * Sin puntos ni guion, min 7, max 9
 */
function validarRUN(run) {
    //Verifica que no este vacio
    if (!run || run.trim() === '') {
        return { valido: false, mensaje: "El RUN es requerido" };
    }
    //Elimina espacios
    const runTrim = run.trim();

    // Verificación explícita de puntos o guión
    if (/[\.\-]/.test(runTrim)) {
        return { valido: false, mensaje: "El RUN debe ingresarse sin puntos ni guión (ej: 19011022K)" };
    }
    //Convierte en mayusculas (digito verificador)
    const runLimpio = runTrim.toUpperCase();
    //Revisa que la longitud sea la correcta
    if (runLimpio.length < 7 || runLimpio.length > 9) {
        return { valido: false, mensaje: "El RUN debe tener entre 7 y 9 caracteres (sin puntos ni guión)" };
    }
    //Separa el RUN del digit verificador
    const cuerpo = runLimpio.slice(0, -1);
    const dv = runLimpio.slice(-1);
    //Revisa que solo tenga numeros
    if (!/^\d+$/.test(cuerpo)) {
        return { valido: false, mensaje: "El cuerpo del RUN debe contener solo números" };
    }
    //ALGORITMO MODULO 11
    var suma = 0;
    var multiplo = 2;
    for (var i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperadoCalculado = 11 - (suma % 11);
    var dvEsperado = '';
    if (dvEsperadoCalculado === 11) dvEsperado = '0';
    else if (dvEsperadoCalculado === 10) dvEsperado = 'K';
    else dvEsperado = dvEsperadoCalculado.toString();

    if (dv !== dvEsperado) {
        return { valido: false, mensaje: `RUN inválido. El dígito verificador no corresponde (esperado: ${dvEsperado})` };
    }
    //Si todo es correcto entonces retorna true
    return { valido: true, mensaje: "RUN válido" };
}

/**
 * Validar Correo Electrónico (RFC2822)
 */
function validarEmail(email) {
    //Revisa que no sea nulo ni vacio
    if (!email || email.trim() === '') return { valido: false, mensaje: "El correo es requerido" };
    if (email.length > 100) return { valido: false, mensaje: "Máximo 100 caracteres" };

    const rfc2822Regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!rfc2822Regex.test(email)) {
        return { valido: false, mensaje: "Formato de correo no válido (ej: usuario@correo.com)" };
    }

    return { valido: true, mensaje: "Correo válido" };
}

/**
 * Validar Contraseña (4 a 10 caracteres, alfanumérica con caracteres especiales)
 */
function validarPassword(pass) {
    if (!pass) return { valido: false, mensaje: "La contraseña es requerida" };
    if (pass.length < 4 || pass.length > 10) return { valido: false, mensaje: "Debe tener entre 4 y 10 caracteres" };

    const tieneLetra = /[a-zA-Z]/.test(pass);
    const tieneNumero = /\d/.test(pass);
    const tieneEspecial = /[^a-zA-Z0-9]/.test(pass);

    if (!tieneLetra || !tieneNumero || !tieneEspecial) {
        return { valido: false, mensaje: "Debe ser alfanumérica y contener al menos 1 símbolo (ej: @, $, #, !)" };
    }

    return { valido: true, mensaje: "Contraseña válida" };
}

/**
 * Validar Código de Producto (Requerido, texto, min 3)
 */
function validarCodigoProducto(codigo) {
    if (!codigo || codigo.trim() === '') return { valido: false, mensaje: "El código es requerido" };
    if (codigo.trim().length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres" };
    return { valido: true, mensaje: "Código válido" };
}

/**
 * Validar Precio (Requerido, min 0, decimales permitidos)
 */
function validarPrecio(precio) {
    //isNaN = IS NOT A NUMBER. En caso de que se escriba letras en vez de un numero
    if (precio === '' || precio === null || isNaN(precio)) return { valido: false, mensaje: "El precio es requerido" };
    //Convierte el texto a número decimal
    const num = parseFloat(precio);
    if (num < 0) return { valido: false, mensaje: "El precio no puede ser negativo" };
    //Operador terniario, si es igual a 0, el mensaje es Producto gratuito, si es mayor a 0 es precio válido
    return { valido: true, mensaje: num === 0 ? "Producto gratuito" : "Precio válido" };
}

/**
 * Validar Stock (Requerido, min 0, solo enteros)
 */
function validarStock(stock) {
    //isNaN = IS NOT A NUMBER. En caso de que se escriba letras en vez de un numero
    if (stock === '' || stock === null || isNaN(stock)) return { valido: false, mensaje: "El stock es requerido" };
    //Convierte el texto a Number
    const num = Number(stock);
    //Comprueba que el numero sea entero y mayor a 0 
    if (!Number.isInteger(num)) return { valido: false, mensaje: "Debe ser un número entero" };
    if (num < 0) return { valido: false, mensaje: "El stock no puede ser negativo" };
    return { valido: true, mensaje: "Stock válido" };
}

// Helper para mostrar feedback en tiempo real
function mostrarFeedback(inputElement, resultado) {
    //Comprueba primero que si exista el elemento
    if (!inputElement) return;
    //Si no hay un contenedor con la clase creada, crea uno cuando sea necesario un mensaje
    var feedbackEl = inputElement.parentElement.querySelector('.feedback-msg');
    if (!feedbackEl) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'feedback-msg';
        inputElement.parentElement.appendChild(feedbackEl);
    }
    //Si es valido cambia de rojo a verde y cambia el mensaje
    if (resultado.valido) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        feedbackEl.className = 'feedback-msg success';
        feedbackEl.textContent = resultado.mensaje;
    //Si es invalido cambia de verde a rojo  y cambia el mensaje
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
        feedbackEl.className = 'feedback-msg error';
        feedbackEl.textContent = resultado.mensaje;
    }
}

