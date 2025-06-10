// Constantes y variables
const PRECIO_DIARIO = 15000;
let reservas = []; // array para guardar objetos con cada reserva

// Función 1 - con parámetros: toma datos del huésped
function registrarHuesped(nombre, cantidad) {
  console.log(`Huésped registrado: ${nombre} - Cantidad de personas: ${cantidad}`);
  return { nombre: nombre, personas: cantidad };
}

// Función 2 - con parámetros: calcula cantidad de días y total
function calcularDiasYTotal(entradaStr, salidaStr) {
  let entrada = new Date(entradaStr);
  let salida = new Date(salidaStr);

  if (salida <= entrada || isNaN(entrada) || isNaN(salida)) {
    alert("Fechas inválidas. La salida debe ser posterior a la entrada.");
    return null;
  }

  let dias = (salida - entrada) / (1000 * 60 * 60 * 24);
  let total = dias * PRECIO_DIARIO;
  return { dias: dias, total: total, entrada, salida };
}

// Función 3 - con parámetros: muestra resumen y guarda en el array
function mostrarResumen(huesped, datosReserva) {
  alert(
    `Reserva confirmada para ${huesped.nombre}.\n` +
    `Cantidad de personas: ${huesped.personas}\n` +
    `Desde: ${datosReserva.entrada.toDateString()}\n` +
    `Hasta: ${datosReserva.salida.toDateString()}\n` +
    `Noches: ${datosReserva.dias}\nTotal a pagar: $${datosReserva.total}`
  );

  // Guardamos la reserva en el array
  reservas.push({
    nombre: huesped.nombre,
    personas: huesped.personas,
    desde: datosReserva.entrada,
    hasta: datosReserva.salida,
    total: datosReserva.total
  });

  console.log("Reserva agregada:", reservas[reservas.length - 1]);
}

// Ciclo principal
let continuar = true;

while (continuar) {
  let nombre = prompt("Ingrese su nombre:");
  let cantidad = parseInt(prompt("¿Cuántas personas se alojarán?"));
  let entrada = prompt("Ingrese la fecha de entrada (YYYY-MM-DD):");
  let salida = prompt("Ingrese la fecha de salida (YYYY-MM-DD):");

  let huesped = registrarHuesped(nombre, cantidad);
  let datos = calcularDiasYTotal(entrada, salida);

  if (datos !== null) {
    mostrarResumen(huesped, datos);
  }

  continuar = confirm("¿Desea registrar otra reserva?");
}

console.log("RESERVAS FINALES:", reservas);
