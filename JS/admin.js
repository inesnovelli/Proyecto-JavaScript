const ADMIN_CREDENTIALS = {
  user: "adminInes",
  pass: "posada1234"
};
const API_URL = 'https://tu-api-real.com/reservas'; // Cambia por tu endpoint real

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  try {
    configurarEventos();
    cargarReservasAdmin();
  } catch (error) {
    console.error('Error al iniciar panel:', error);
    mostrarError('Error al cargar el panel de administración');
  }
});

// Configura eventos
function configurarEventos() {
  const loginForm = document.getElementById('loginAdmin');
  if (loginForm) loginForm.addEventListener('submit', manejarLogin);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const aplicarFiltroBtn = document.getElementById('aplicarFiltro');
  if (aplicarFiltroBtn) aplicarFiltroBtn.addEventListener('click', filtrarReservas);

  const adminReservasDiv = document.getElementById('adminReservas');
  if (adminReservasDiv) {
    adminReservasDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const index = e.target.dataset.index;
        eliminarReservaAdmin(index);
      }
    });
  }
}

function manejarLogin(e) {
  e.preventDefault();
  
  try {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    
    if (!user || !pass) {
      throw new Error('Complete ambos campos');
    }
    
    if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('adminPanel').classList.remove('hidden');
      cargarReservasAdmin();
      
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Sesión iniciada correctamente',
        confirmButtonColor: '#05A376'
      });
    } else {
      throw new Error('Credenciales incorrectas');
    }
  } catch (error) {
    mostrarError(error.message);
  }
}

// Carga las reservas
function cargarReservasAdmin(reservasFiltradas = null) {
  try {
    const reservas = reservasFiltradas || JSON.parse(localStorage.getItem('reservas')) || [];
    const container = document.getElementById('adminReservas');
    
    container.innerHTML = '';
    
    if (reservas.length === 0) {
      container.innerHTML = '<p class="no-reservas">No hay reservas registradas</p>';
      return;
    }
    
    reservas.forEach((reserva, index) => {
      const reservaDiv = document.createElement('div');
      reservaDiv.className = 'reserva';
      reservaDiv.innerHTML = `
        <h4>${reserva.nombre} - ${reserva.habitacion}</h4>
        <p><strong>Fechas:</strong> ${reserva.entrada} a ${reserva.salida}</p>
        <p><strong>Contacto:</strong> ${reserva.email} | ${reserva.telefono}</p>
        <p><strong>Personas:</strong> ${reserva.personas} | Total: $${reserva.total}</p>
        <button class="delete-btn" data-index="${index}">Eliminar</button>
      `;
      container.appendChild(reservaDiv);
    });
    
    actualizarEstadisticas(reservas);
  } catch (error) {
    console.error('Error al cargar reservas:', error);
    mostrarError('Error al cargar las reservas');
  }
}

// Filtra reservas
function filtrarReservas() {
  try {
    const filtroHabitacion = document.getElementById('filtroHabitacion').value;
    const filtroFecha = document.getElementById('filtroFecha').value;
    
    let reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    
    if (filtroHabitacion) {
      reservas = reservas.filter(r => r.habitacion === filtroHabitacion);
    }
    
    if (filtroFecha) {
      const fechaFiltro = new Date(filtroFecha);
      reservas = reservas.filter(r => {
        const [dia, mes, anio] = r.entrada.split('/');
        const fechaEntrada = new Date(`${anio}-${mes}-${dia}`);
        return fechaEntrada.toDateString() === fechaFiltro.toDateString();
      });
    }
    
    cargarReservasAdmin(reservas);
  } catch (error) {
    console.error('Error al filtrar:', error);
    mostrarError('Error al aplicar filtros');
  }
}

// Elimina una reserva
async function eliminarReservaAdmin(index) {
  try {
    const result = await Swal.fire({
      title: '¿Eliminar reserva?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#05A376',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      let reservas = JSON.parse(localStorage.getItem('reservas')) || [];
      
      if (index >= 0 && index < reservas.length) {
        const reservaEliminada = reservas.splice(index, 1)[0];
        localStorage.setItem('reservas', JSON.stringify(reservas));
        
        await eliminarReservaEnAPI(reservaEliminada.id);
        
        cargarReservasAdmin();
        
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La reserva fue eliminada correctamente',
          icon: 'success',
          confirmButtonColor: '#05A376'
        });
      }
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
    mostrarError('No se pudo eliminar la reserva');
  }
}

async function eliminarReservaEnAPI(idReserva) {
  try {
    const response = await fetch(`${API_URL}/${idReserva}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error en servidor');
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar en API:', error);
  }
}

function actualizarEstadisticas(reservas) {
  const totalReservas = reservas.length;
  const ingresosTotales = reservas.reduce((total, r) => total + (r.total || 0), 0);
  
  document.getElementById('totalReservas').textContent = `Total reservas: ${totalReservas}`;
  document.getElementById('ingresosTotales').textContent = `Ingresos totales: $${ingresosTotales}`;
}

// Cierra sesión
function logout() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
}

function mostrarError(mensaje) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje,
    confirmButtonColor: '#05A376'
  });
}

function parseFecha(fechaStr) {
  const [dia, mes, anio] = fechaStr.split('/');
  return new Date(`${anio}-${mes}-${dia}`);
}