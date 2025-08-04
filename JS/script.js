const PRECIO_DIARIO = 15000;
const API_URL = 'https://tu-api-real.com/reservas'; // Cambia por tu endpoint real

let reservas = [];

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await cargarReservas();
    configurarEventos();
  } catch (error) {
    console.error('Error inicial:', error);
    mostrarError('Error al cargar las reservas iniciales');
  }
});

// Carga de reservas
async function cargarReservas() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al conectar con el servidor');
    
    reservas = await response.json();
    localStorage.setItem('reservas', JSON.stringify(reservas));
    
  } catch (error) {
    console.error('Error al cargar desde API:', error);
    const localData = localStorage.getItem('reservas');
    reservas = localData ? JSON.parse(localData) : [];
  }
}

function configurarEventos() {
  const form = document.getElementById('reservaForm');
  if (form) form.addEventListener('submit', manejarReserva);
}

// Maneja el formulario
async function manejarReserva(event) {
  event.preventDefault();
  
  try {
    const reserva = obtenerDatosFormulario();
    
    if (hayConflictoReserva(reserva)) {
      mostrarError('La habitación no está disponible en esas fechas');
      return;
    }

    await guardarReserva(reserva);
    mostrarResumen(reserva);
    document.getElementById('reservaForm').reset();

    Swal.fire({
      icon: 'success',
      title: '¡Reserva exitosa!',
      text: `Habitación ${reserva.habitacion} reservada para ${reserva.nombre}`,
      confirmButtonColor: '#05A376'
    });

  } catch (error) {
    console.error('Error:', error);
    mostrarError(error.message || 'Error al procesar la reserva');
  }
}

function obtenerDatosFormulario() {
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const cantidad = parseInt(document.getElementById('personas').value);
  const entrada = document.getElementById('entrada').value;
  const salida = document.getElementById('salida').value;
  const habitacion = document.getElementById('habitacion').value;

  if (!nombre || !email || !telefono || !habitacion || isNaN(cantidad)) {
    throw new Error('Complete todos los campos correctamente');
  }

  if (!validarEmail(email)) {
    throw new Error('Ingrese un email válido (ejemplo@dominio.com)');
  }

  if (!validarTelefono(telefono)) {
    throw new Error('El teléfono debe tener entre 10 y 15 dígitos');
  }

  if (cantidad < 1 || cantidad > 3) {
    throw new Error('El número de personas debe ser entre 1 y 3');
  }

  const fechaEntrada = new Date(entrada);
  const fechaSalida = new Date(salida);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (isNaN(fechaEntrada.getTime()) || isNaN(fechaSalida.getTime())) {
    throw new Error('Formato de fecha incorrecto');
  }

  if (fechaEntrada < hoy) {
    throw new Error('La fecha de entrada no puede ser anterior a hoy');
  }

  if (fechaSalida <= fechaEntrada) {
    throw new Error('La fecha de salida debe ser posterior a la de entrada');
  }

  const diffTime = fechaSalida - fechaEntrada;
  const noches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    nombre,
    email,
    telefono,
    personas: cantidad,
    habitacion,
    entrada: formatoFecha(fechaEntrada),
    salida: formatoFecha(fechaSalida),
    noches,
    total: noches * PRECIO_DIARIO
  };
}

// Guarda una reserva
async function guardarReserva(reserva) {
  reservas.push(reserva);
  localStorage.setItem('reservas', JSON.stringify(reservas));
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reserva)
    });
    
    if (!response.ok) throw new Error('Error al guardar en servidor');
  } catch (error) {
    console.error('Error al guardar en API:', error);
    // No es crítico si falla
  }
}

// Verifica conflictos de reserva
function hayConflictoReserva(nuevaReserva) {
  const nuevaEntrada = parseFecha(nuevaReserva.entrada);
  const nuevaSalida = parseFecha(nuevaReserva.salida);

  return reservas.some(reserva => {
    if (reserva.habitacion !== nuevaReserva.habitacion) return false;
    
    const reservaEntrada = parseFecha(reserva.entrada);
    const reservaSalida = parseFecha(reserva.salida);

    return (
      (nuevaEntrada >= reservaEntrada && nuevaEntrada < reservaSalida) ||
      (nuevaSalida > reservaEntrada && nuevaSalida <= reservaSalida) ||
      (nuevaEntrada <= reservaEntrada && nuevaSalida >= reservaSalida)
    );
  });
}

function formatoFecha(fecha) {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function parseFecha(fechaStr) {
  const [dia, mes, anio] = fechaStr.split('/');
  return new Date(`${anio}-${mes}-${dia}`);
}

function mostrarResumen(reserva) {
  const resumenDiv = document.getElementById('resumen');
  resumenDiv.innerHTML = '';
  
  const comprobanteDiv = document.createElement('div');
  comprobanteDiv.className = 'comprobante';
  comprobanteDiv.innerHTML = `
    <h3>COMPROBANTE DE RESERVA</h3>
    <p><strong>Posada de los Topos</strong></p>
    <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
    
    <h4>Datos del reservante</h4>
    <p>Nombre: ${reserva.nombre}</p>
    <p>Email: ${reserva.email}</p>
    <p>Teléfono: ${reserva.telefono}</p>
    
    <h4>Detalles de la reserva</h4>
    <p>Habitación: ${reserva.habitacion}</p>
    <p>Personas: ${reserva.personas}</p>
    <p>Entrada: ${reserva.entrada}</p>
    <p>Salida: ${reserva.salida}</p>
    <p>Noches: ${reserva.noches}</p>
    <p>Total: $${reserva.total}</p>
    
    <button id="printBtn">Imprimir Comprobante</button>
  `;
  
  resumenDiv.appendChild(comprobanteDiv);
  document.getElementById('printBtn').addEventListener('click', window.print);
}

function mostrarError(mensaje) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
    confirmButtonColor: '#05A376'
  });
}

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarTelefono(tel) {
  const re = /^[0-9]{10,15}$/;
  return re.test(tel);
}