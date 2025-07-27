const ADMIN_CREDENTIALS = {
  user: "adminInes",
  pass: "posada1234"
};

document.getElementById('loginAdmin')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;
  
  if(user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    cargarReservasAdmin();
    actualizarEstadisticas();
  } else {
    alert('Credenciales incorrectas');
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', function() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
});

document.getElementById('aplicarFiltro')?.addEventListener('click', function() {
  filtrarReservas();
});

function cargarReservasAdmin(reservasFiltradas = null) {
  const reservas = reservasFiltradas || JSON.parse(localStorage.getItem('reservas')) || [];
  const container = document.getElementById('adminReservas');
  
  container.innerHTML = '';
  
  if(reservas.length === 0) {
    container.innerHTML = '<p>No hay reservas registradas</p>';
    return;
  }
  
  reservas.forEach((reserva, index) => {
    const reservaDiv = document.createElement('div');
    reservaDiv.className = 'reserva';
    reservaDiv.innerHTML = `
      <h4>${reserva.nombre} - ${reserva.habitacion}</h4>
      <p>Email: ${reserva.email}</p>
      <p>Teléfono: ${reserva.telefono}</p>
      <p>Personas: ${reserva.personas}</p>
      <p>Fechas: ${reserva.entrada} a ${reserva.salida}</p>
      <p>Total: $${reserva.total}</p>
      <button onclick="eliminarReservaAdmin(${index})">Eliminar</button>
    `;
    container.appendChild(reservaDiv);
  });
}

function filtrarReservas() {
  const filtroHabitacion = document.getElementById('filtroHabitacion').value;
  const filtroFecha = document.getElementById('filtroFecha').value;
  
  let reservasFiltradas = JSON.parse(localStorage.getItem('reservas')) || [];
  
  if(filtroHabitacion) {
    reservasFiltradas = reservasFiltradas.filter(r => r.habitacion === filtroHabitacion);
  }
  
  if(filtroFecha) {
    const fechaFiltro = new Date(filtroFecha);
    reservasFiltradas = reservasFiltradas.filter(r => {
      const [dia, mes, anio] = r.entrada.split('/');
      const fechaEntrada = new Date(`${anio}-${mes}-${dia}`);
      return fechaEntrada.toDateString() === fechaFiltro.toDateString();
    });
  }
  
  cargarReservasAdmin(reservasFiltradas);
  actualizarEstadisticas(reservasFiltradas);
}

function actualizarEstadisticas(reservas = null) {
  const reservasActuales = reservas || JSON.parse(localStorage.getItem('reservas')) || [];
  
  document.getElementById('totalReservas').textContent = `Total reservas: ${reservasActuales.length}`;
  
  const ingresosTotales = reservasActuales.reduce((total, reserva) => {
    return total + reserva.total;
  }, 0);
  
  document.getElementById('ingresosTotales').textContent = `Ingresos totales: $${ingresosTotales}`;
}

function eliminarReservaAdmin(index) {
  const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
  reservas.splice(index, 1);
  localStorage.setItem('reservas', JSON.stringify(reservas));
  cargarReservasAdmin();
  actualizarEstadisticas();
}