const tableroHtml = document.getElementById('tablero-juego');

const constants = {
  etiquetas: {
    div: {
      final: '</div>',
    },
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const juego = iniciarJuego(
    iniciarJugador(
      'jugador-1',
      `<div class='jugador-1'>
        <i class='fa-solid fa-xmark'></i>
      </div>`
    ),
    iniciarJugador(
      'jugador-2',
      `<div class="jugador-2">
              <i class="fa-solid fa-check"></i>
            </div>`
    )
  );
  console.log('DOM cargado', juego);
});

const Jugador = {
  nombre: 'nombre_jugador',
  puntos: 0,
  partidas_ganadas: 0,
  innerHTML: '',
  jugadas: [],
};

const pintarTablero = (jugadores) => {
  const tablero = [];
  for (let x = 0; x < 3; x++) {
    tablero.push([]);
    for (let y = 0; y < 3; y++) {
      tableroHtml.innerHTML += `<div class="celda" id="celda-${x}${y}">`;
      tablero[x].push('');
      if (jugadores) {
        console.log('MARTIN_LOG=> jugadores', jugadores);
        const filtradas = Object.values(jugadores).filter((jugador) => {
          jugador.jugadas.forEach((jugada) => {
            if (jugada.x === x && jugada.y === y) {
              tableroHtml.innerHTML += jugador.innerHTML;
              tablero[x][y] = jugador.nombre;
            }
          });
        });
        console.log(filtradas);
      }
      tableroHtml.innerHTML += constants.etiquetas.div.final;
    }

    tableroHtml.innerHTML += constants.etiquetas.div.final;
  }
  console.log('MARTIN_LOG=> tablero iniciado', tablero);
  return tablero;
};

const iniciarTablero = () => {
  const tablero = pintarTablero();

  return tablero;
};

const iniciarJugador = (nombre, innerHTML) => {
  return {
    ...Jugador,
    nombre,
    innerHTML,
  };
};

const iniciarJuego = (jugador1, jugador2) => {
  return {
    tablero: iniciarTablero(),
    tableroHtml,
    jugador1,
    jugador2,
    turno: jugador1,
  };
};
