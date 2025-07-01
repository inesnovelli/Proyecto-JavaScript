const PRECIO_DIARIO = 15000;
let reservas = JSON.parse(localStorage.getItem('reservas')) || [];


document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('reservaForm');
  form.addEventListener('submit', manejarReserva);
  cargarReservas();
});

function manejarReserva(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('nombre').value.trim();
  const cantidad = parseInt(document.getElementById('personas').value);
  const entrada = document.getElementById('entrada').value;
  const salida = document.getElementById('salida').value;
  const habitacion = document.getElementById('habitacion').value;

  if (!nombre || !habitacion || isNaN(cantidad)) {
    mostrarError("Complete todos los campos.");
    return;
  }

  if (cantidad > 3) {
    mostrarError("Máximo 3 personas por habitación.");
    return;
  }

  const conflicto = buscarConflictoReserva(habitacion, entrada, salida);
  if (conflicto) {
    mostrarError(`La ${habitacion} no se encuentra disponible desde ${conflicto.entrada} hasta ${conflicto.salida}. Por favor elige otra fecha.`);
    return;
  }

  const huesped = { nombre: nombre, personas: cantidad };
  const datos = calcularDiasYTotal(entrada, salida);

  if (datos) {
    datos.habitacion = habitacion;
    mostrarResumen(huesped, datos);
    guardarReserva(huesped, datos).then(() => {
      cargarReservas();
      document.getElementById('reservaForm').reset();
    });
  }
}

// función para detectar errores con las fechas
function buscarConflictoReserva(habitacion, nuevaEntradaStr, nuevaSalidaStr) {
  const nuevaEntrada = new Date(nuevaEntradaStr);
  const nuevaSalida = new Date(nuevaSalidaStr);

  for (const reserva of reservas) {
    if (reserva.habitacion === habitacion) {
      // convierte fechas guardadas (en formato dd/mm/aaaa)
      const [diaE, mesE, anioE] = reserva.entrada.split('/');
      const [diaS, mesS, anioS] = reserva.salida.split('/');
      
      const reservaEntrada = new Date(`${anioE}-${mesE}-${diaE}`);
      const reservaSalida = new Date(`${anioS}-${mesS}-${diaS}`);

      if (
        (nuevaEntrada >= reservaEntrada && nuevaEntrada < reservaSalida) ||  
        (nuevaSalida > reservaEntrada && nuevaSalida <= reservaSalida) ||    
        (nuevaEntrada <= reservaEntrada && nuevaSalida >= reservaSalida)     
      ) {
        return reserva; 
      }
    }
  }
  return null; 
}

function calcularDiasYTotal(entradaStr, salidaStr) {
  const entrada = new Date(entradaStr);
  const salida = new Date(salidaStr);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (isNaN(entrada) || isNaN(salida)) {
    mostrarError("Formato de fecha incorrecto. Use YYYY-MM-DD");
    return null;
  }
  
  if (entrada < hoy) {
    mostrarError("La fecha de entrada no puede ser anterior al día actual.");
    return null;
  }
  
  if (salida <= entrada) {
    mostrarError("La fecha de salida debe ser posterior a la de entrada.");
    return null;
  }

  const dias = Math.floor((salida - entrada) / (1000 * 60 * 60 * 24));
  const total = dias * PRECIO_DIARIO;
  
  return { 
    dias: dias, 
    total: total, 
    entrada: entrada.toLocaleDateString('es-ES'),
    salida: salida.toLocaleDateString('es-ES')
  };
}

function mostrarResumen(huesped, datosReserva) {
  const resumenDiv = document.getElementById('resumen');
  resumenDiv.innerHTML = `
    <h3>Reserva confirmada para ${huesped.nombre}</h3>
    <p>Habitación: ${datosReserva.habitacion}</p>
    <p>Personas: ${huesped.personas}</p>
    <p>Entrada: ${datosReserva.entrada}</p>
    <p>Salida: ${datosReserva.salida}</p>
    <p>Noches: ${datosReserva.dias}</p>
    <p>Total: $${datosReserva.total}</p>
  `;
}

function mostrarError(mensaje) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = mensaje;
  setTimeout(() => errorDiv.textContent = '', 5000);
}

function guardarReserva(huesped, datos) {
  return new Promise((resolve) => {
    reservas.push({
      nombre: huesped.nombre,
      personas: huesped.personas,
      habitacion: datos.habitacion,
      entrada: datos.entrada,
      salida: datos.salida,
      noches: datos.dias,
      total: datos.total
    });
    
    localStorage.setItem('reservas', JSON.stringify(reservas));
    resolve();
  });
}

function cargarReservas() {
  const listaReservas = document.getElementById('listaReservas');
  listaReservas.innerHTML = reservas.map((reserva, index) => `
    <div class="reserva">
      <h4>${reserva.nombre} - ${reserva.habitacion}</h4>
      <p>Personas: ${reserva.personas}</p>
      <p>Fechas: ${reserva.entrada} a ${reserva.salida}</p>
      <p>Total: $${reserva.total}</p>
      <button onclick="eliminarReserva(${index})">Eliminar</button>
    </div>
  `).join('');
}

function eliminarReserva(index) {
  reservas.splice(index, 1);
  localStorage.setItem('reservas', JSON.stringify(reservas));
  cargarReservas();
}