// Constantes y Variables Globales
const tableroHtml = document.getElementById('tablero-juego');
const jugadorActualHtml = document.getElementById('jugador-actual');
const mensajesHtml = document.getElementById('mensaje');
const botonReiniciarHtml = document.getElementById('reiniciar-tablero');
const botonReiniciarJuegoHtml = document.getElementById('reiniciar-juego');
const puntuacionJugador1Html = document.getElementById('puntos-jugador-1');
const puntuacionJugador2Html = document.getElementById('puntos-jugador-2');

let tablero = [];

const constants = {
  etiquetas: {
    div: {
      final: '</div>',
    },
  },
};

let juego = null;
let bloquearInteraccion = false;

const Jugador = {
  nombre: 'nombre_jugador',
  puntos: 0,
  partidas_ganadas: 0,
  innerHTML: '',
  jugadas: [],
};

// Funciones de Juego
const agregarJugada = (jugador, x, y) => {
  if (jugador.jugadas.some((j) => j.x === x && j.y === y)) {
    return;
  }
  jugador.jugadas.push({ x, y });
  tablero[y][x] = jugador.innerHTML;
};

const verificarGanador = (jugador) => {
  const jugadas = jugador.jugadas;
  const combinacionesGanadoras = [
    // Filas
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    // Columnas
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    // Diagonales
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ],
  ];

  return combinacionesGanadoras.some((combinacion) =>
    combinacion.every((c) =>
      jugadas.some(
        (j) => Number(j.x) === Number(c.x) && Number(j.y) === Number(c.y)
      )
    )
  );
};

const pintarTablero = (tablero) => {
  tableroHtml.innerHTML = '';
  tablero.forEach((fila, x) => {
    fila.forEach((casilla, y) => {
      tableroHtml.innerHTML += `<div class="celda" id="${x}${y}">${casilla}</div>`;
    });
    tableroHtml.innerHTML += constants.etiquetas.div.final;
  });
};

const reiniciarTablero = () => {
  tablero = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];
  pintarTablero(tablero);
  bloquearInteraccion = false;
};

const reiniciarPartida = () => {
  reiniciarTablero();
  juego.jugadores[0].jugadas = [];
  juego.jugadores[1].jugadas = [];
};

const logicaClick = ({ celda, juego }) => {
  if (bloquearInteraccion) {
    return;
  }
  // obtengo los indices de la celda
  const [y, x] = celda.id.split('');
  const jugador = juego.jugadores[juego.turno];
  // si la celda esta vacia
  if (tablero[y][x] === '') {
    // la agregamos a las jugadas del jugador
    agregarJugada(jugador, x, y);
    // pintamos el tablero
    pintarTablero(tablero);

    // verificamos si el jugador es ganador
    if (verificarGanador(jugador)) {
      console.log('JUGADOR GANADOR', jugador.nombre);
      mensajesHtml.innerHTML = `El jugador <strong>${jugador.nombre}</strong> ha ganado la partida`;
      jugador.puntos += 1;
      jugador.partidas_ganadas += 1;
      juego.jugadores[juego.turno] = jugador;
      bloquearInteraccion = true;
      setTimeout(() => {
        mensajesHtml.innerHTML = '';
        reiniciarPartida();
      }, 3000);

      console.log('PUNTOS', jugador.puntos);
      console.log('PARTIDAS GANADAS', jugador.partidas_ganadas);
    }
    juego.turno = juego.turno === 0 ? 1 : 0;
  }
  jugadorActualHtml.innerHTML = juego.jugadores[juego.turno].nombre;
};

const imprimirPuntuacion = () => {
  puntuacionJugador1Html.innerHTML = juego.jugadores[0].puntos;
  puntuacionJugador2Html.innerHTML = juego.jugadores[1].puntos;
};

const nuevoJuego = (jugadores) => {
  // limpiamos el tablero
  reiniciarTablero();
  bloquearInteraccion = false;

  // iniciamos los jugadores
  const jugador1 = JSON.parse(
    JSON.stringify({
      ...Jugador,
      nombre: jugadores.jugador1.nombre || 'jugador-1',
      innerHTML: `<div class="jugador-1">
                <i class="fa-solid fa-xmark"></i>
              </div>`,
    })
  );
  const jugador2 = JSON.parse(
    JSON.stringify({
      ...Jugador,
      nombre: jugadores.jugador2.nombre || 'jugador-2',
      innerHTML: `<div class="jugador-2">
                  <i class="fa-solid fa-check"></i>
                </div>`,
    })
  );

  const thisJuego = {
    jugadores: [jugador1, jugador2],
    turno: 0,
  };
  jugadorActualHtml.innerHTML = thisJuego.jugadores[thisJuego.turno].nombre;
  juego = thisJuego;
  tableroHtml.addEventListener('click', (e) => {
    logicaClick({ celda: e.target, juego: thisJuego });
    imprimirPuntuacion();
  });
};

// Inicialización del Juego y Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('INICIANDO JUEGO');
  // iniciamos el juego
  nuevoJuego({
    jugador1: {
      nombre: 'Jugador 1',
    },
    jugador2: {
      nombre: 'Jugador 2',
    },
  });
  console.log('JUEGO CARGADO');
});

botonReiniciarHtml.addEventListener('click', (e) => {
  e.preventDefault();
  reiniciarPartida();
});

botonReiniciarJuegoHtml.addEventListener('click', (e) => {
  e.preventDefault();
  nuevoJuego({
    jugador1: {
      nombre: 'Jugador 1',
    },
    jugador2: {
      nombre: 'Jugador 2',
    },
  });
});
