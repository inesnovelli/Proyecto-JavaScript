const PRECIO_DIARIO = 15000;
let reservas = JSON.parse(localStorage.getItem('reservas')) || [];

// Inicialización
const form = document.getElementById('reservaForm');
if (form) {
  form.addEventListener('submit', manejarReserva);
}

function manejarReserva(event) {
  event.preventDefault();
  
  // Obtener valores del formulario
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const cantidad = parseInt(document.getElementById('personas').value);
  const entrada = document.getElementById('entrada').value;
  const salida = document.getElementById('salida').value;
  const habitacion = document.getElementById('habitacion').value;

  // Validaciones básicas
  if (!nombre || !email || !telefono || !habitacion || isNaN(cantidad)) {
    mostrarError("Complete todos los campos.");
    return;
  }

  if (!validarEmail(email)) {
    mostrarError("Ingrese un email válido.");
    return;
  }

  if (!validarTelefono(telefono)) {
    mostrarError("Ingrese un teléfono válido (10-15 dígitos).");
    return;
  }

  if (cantidad > 3) {
    mostrarError("Máximo 3 personas por habitación.");
    return;
  }

  // Validar fechas
  const conflicto = buscarConflictoReserva(habitacion, entrada, salida);
  if (conflicto) {
    mostrarError(`La ${habitacion} no se encuentra disponible desde ${conflicto.entrada} hasta ${conflicto.salida}. Por favor elige otra fecha.`);
    return;
  }

  // Calcular estadías y total
  const datos = calcularDiasYTotal(entrada, salida);
  if (!datos) return;

  datos.habitacion = habitacion;
  
  // Crear reserva
  const reserva = {
    nombre: nombre,
    email: email,
    telefono: telefono,
    personas: cantidad,
    habitacion: habitacion,
    entrada: datos.entrada,
    salida: datos.salida,
    noches: datos.dias,
    total: datos.total
  };

  // Mostrar resumen y guardar
  mostrarResumen(reserva);
  guardarReserva(reserva);
  document.getElementById('reservaForm').reset();
}

function buscarConflictoReserva(habitacion, nuevaEntradaStr, nuevaSalidaStr) {
  const nuevaEntrada = new Date(nuevaEntradaStr);
  const nuevaSalida = new Date(nuevaSalidaStr);

  for (const reserva of reservas) {
    if (reserva.habitacion === habitacion) {
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

function mostrarResumen(reserva) {
  const resumenDiv = document.getElementById('resumen');
  resumenDiv.innerHTML = '';
  
  const comprobanteDiv = document.createElement('div');
  comprobanteDiv.className = 'comprobante';
  comprobanteDiv.innerHTML = `
    <h3>COMPROBANTE DE RESERVA</h3>
    <p><strong>Posada de los Topos</strong></p>
    <p>Fecha: ${new Date().toLocaleDateString()}</p>
    
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
    
    <button onclick="window.print()">Imprimir Comprobante</button>
  `;
  
  resumenDiv.appendChild(comprobanteDiv);
}

function mostrarError(mensaje) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = mensaje;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarTelefono(tel) {
  const re = /^[0-9]{10,15}$/;
  return re.test(tel);
}

function guardarReserva(reserva) {
  reservas.push(reserva);
  localStorage.setItem('reservas', JSON.stringify(reservas));
}