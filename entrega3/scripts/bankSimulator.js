// Funciones de base de datos
let database;
const dbName = `bankSimulatorDb`;

// Obtiene la base de datos del localStorage o la inicializa si no existe
const getDb = () => {
  if (database) return database;
  const dbStringFormat = localStorage.getItem(dbName);
  if (!dbStringFormat) {
    database = {};
    saveDb();
  } else {
    database = JSON.parse(dbStringFormat);
  }
  console.log('DB_LOADED', database);
};

// Guarda la base de datos en el localStorage
const saveDb = () => {
  localStorage.setItem(dbName, JSON.stringify(database));
};

// Obtiene un ítem por su ID de una tabla específica
const getItemById = (id, table) => {
  const item = database?.[table]?.[id];
  console.log('getItemById', { item, table, id, database });
  return item;
};

// Obtiene todos los ítems de una tabla específica
const getItems = (table) => {
  const items = database?.[table];
  return items && Object.values(items);
};

// Agrega un ítem a una tabla específica
const addItem = (item, table) => {
  database[table] = database[table] || {};
  database[table][item.id] = item;
  saveDb();
  return item;
};

// Actualiza un ítem en una tabla específica
const updateItem = (item, table) => {
  database[table][item.id] = item;
  saveDb();
  return item;
};

// Elimina un ítem por su ID de una tabla específica
const deleteItem = (id, table) => {
  delete database[table][id];
  saveDb();
  return true;
};

// Funciones de sesión
let userSession = null;

// Agrega una sesión de usuario con una fecha de expiración
const addSession = (user) => {
  const expirationDate = new Date().getTime() + 1000 * 60 * 60;
  userSession = {
    id: 'session',
    session_data: { user },
    expiration_date: expirationDate,
  };
  addItem(userSession, 'session');
};

// Elimina la sesión de usuario
const deleteSession = () => {
  deleteItem('session', 'session');
};

// Obtiene la sesión de usuario actual
const getSession = () => {
  const id = 'session';
  const session = userSession ?? getItemById(id, 'session');
  const dateNow = new Date().getTime();
  if (session?.expiration_date < dateNow) {
    deleteItem(id, 'session');
    return null;
  }
  return session;
};

// Valida la sesión de usuario y redirige si no es válida
const validateSession = () => {
  const session = getSession();
  const pathName = window.location.pathname.replace('/entrega2/pages', '');
  if (
    !session &&
    pathName !== '/auth/login.html' &&
    pathName !== '/auth/register.html'
  ) {
    window.location.href = 'pages/auth/login.html';
    return null;
  }
  return session;
};

// Funciones de autenticación
let nameErrorMessage,
  passwordErrorMessage,
  usernameInput,
  passwordInput,
  passwordConfirmInput,
  registerBtn,
  loginBtn;

// Obtiene referencias a los elementos del DOM relacionados con la autenticación
const getAuthElementReferences = () => {
  nameErrorMessage = document.getElementById('name-error');
  passwordErrorMessage = document.getElementById('name-error');
  usernameInput = document.getElementById('username');
  passwordInput = document.getElementById('password');
  passwordConfirmInput = document.getElementById('password-confirm');
  registerBtn = document.getElementById('register-btn');
  loginBtn = document.getElementById('login-btn');
};

// Establece los listeners para los botones de registro y login
const setAuthListeners = () => {
  registerBtn?.addEventListener('click', registerUser);
  loginBtn?.addEventListener('click', loginUser);
};

// Registra un nuevo usuario
const registerUser = (event) => {
  event.preventDefault();
  const usernameValue = usernameInput.value;
  const passwordValue = passwordInput.value;
  const passwordConfirmValue = passwordConfirmInput.value;
  if (!usernameValue) {
    nameErrorMessage.innerText = 'El nombre de usuario es requerido';
    return;
  }
  if (!passwordValue) {
    passwordErrorMessage.innerText = 'La contraseña es requerida';
    return;
  }
  if (passwordValue !== passwordConfirmValue) {
    passwordErrorMessage.innerText = 'Las contraseñas no coinciden';
    return;
  }
  const newUser = { id: usernameValue, password: passwordValue, balance: 0 };
  const user = getItemById(usernameValue, 'users');
  if (user) {
    nameErrorMessage.innerText = 'El usuario ya existe';
    return;
  }
  addItem(newUser, 'users');
  alert('Usuario registrado correctamente');
  window.location.href = 'login.html';
};

// Inicia sesión de usuario
const loginUser = (event) => {
  event.preventDefault();
  const usernameValue = usernameInput.value;
  const passwordValue = passwordInput.value;
  if (!usernameValue) {
    nameErrorMessage.innerText = 'El nombre de usuario es requerido';
    return;
  }
  if (!passwordValue) {
    passwordErrorMessage.innerText = 'La contraseña es requerida';
    return;
  }
  const user = getItemById(usernameValue, 'users');
  if (!user) {
    nameErrorMessage.innerText = 'Usuario no encontrado';
    return;
  }
  if (user.password !== passwordValue) {
    passwordErrorMessage.innerText = 'Contraseña incorrecta';
    return;
  }
  addSession(user);
  alert('Usuario logueado correctamente');
  window.location.href = '../account/account.html';
};

// Cierra sesión de usuario
const logoutUser = () => {
  validateSession();
  deleteSession();
  window.location.href = '../../index.html';
};

// Funciones de movimientos
const recipientComponentModel = `<span class='movement-recipient'>:recipient</span>`;
const movementComponentModel = `<li>
    <div class="movement-up">
      <div class='movement-left'>
        :recipient-component
        <span class='movement-sender'>:sender</span>
        <span class='movement-type'>:type</span>
      </div>
      <div class='movement-right'>
        <span class='movement-amount'>:amount</span>
      </div>
    </div>
    <div class="movement-down">
      <span class='movement-date'>:date</span>
    </div>
  </li>`;

// Crea un nuevo movimiento
const newMovement = (movementData) => {
  const { username, movement_date, movement_type, amount } = movementData;
  const id = `${username}#${movement_date}#${movement_type}#${amount}`;
  addItem({ id, amount: Number(amount), ...movementData }, 'movements');
};

// Obtiene todos los movimientos de un usuario específico
const getAllMovementsByUsername = (username) => {
  const allMovements = getItems('movements');
  if (!allMovements) return [];
  return allMovements.filter((movement) => movement.username === username);
};

let movementsContainer = null;
// Obtiene referencias a los elementos del DOM relacionados con los movimientos
const getMovementReferences = () => {
  movementsContainer = document.getElementById('movements-container');
};

// Construye el componente de un movimiento
const buildMovementComponent = (movement) => {
  let movementComponent = JSON.parse(JSON.stringify(movementComponentModel));
  let recipientComponent = JSON.parse(JSON.stringify(recipientComponentModel));
  if (movement.movement_type === 'transferencia') {
    if (movement.recipientUsername) {
      recipientComponent = recipientComponent.replace(
        ':recipient',
        movement.recipientUsername
      );
      movementComponent = movementComponent.replace(
        ':recipient-component',
        recipientComponent
      );
    } else {
      movementComponent = movementComponent.replace(':recipient-component', '');
    }

    if (movement.senderUsername) {
      movementComponent = movementComponent.replace(
        ':sender',
        movement.senderUsername
      );
    } else {
      movementComponent = movementComponent.replace(':sender', '');
    }
  } else {
    movementComponent = movementComponent.replace(':recipient-component', '');
    movementComponent = movementComponent.replace(':sender', '');
  }

  movementComponent = movementComponent.replace(
    ':date',
    formatDate(movement.movement_date)
  );
  movementComponent = movementComponent.replace(
    ':type',
    movement.movement_type
  );
  movementComponent = movementComponent.replace(':amount', movement.amount);
  return movementComponent;
};

// Formatea una fecha a un formato legible
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Renderiza los movimientos en el DOM
const renderMovements = (session) => {
  if (!session) return;
  const movements = getAllMovementsByUsername(session?.id);
  movements.forEach((movement) => {
    const movementComponent = buildMovementComponent(movement);
    if (movementsContainer) movementsContainer.innerHTML += movementComponent;
  });
};

// Funciones de retiro
let withdrawInput, withdrawBtn, withdrawErrorMessage;

// Obtiene referencias a los elementos del DOM relacionados con los retiros
const getWithdrawListeners = () => {
  withdrawInput = document.getElementById('withdraw-amount');
  withdrawBtn = document.getElementById('withdraw-btn');
  withdrawErrorMessage = document.getElementById('withdraw-amount-error');
};

// Establece los listeners para los botones de retiro
const setWithdrawListeners = () => {
  withdrawBtn?.addEventListener('click', makeWithdraw);
};

// Realiza un retiro
const makeWithdraw = (event) => {
  event.preventDefault();
  const user = getSession()?.session_data.user;
  const withdrawAmount = withdrawInput.value;
  if (withdrawAmount <= 0) {
    withdrawErrorMessage.innerText = 'El monto a withdrawar debe ser mayor a 0';
    return;
  }
  user.balance -= Number(withdrawAmount);
  updateItem(user, 'users');
  newMovement({
    username: user.id,
    movement_date: new Date().getTime(),
    movement_type: 'retiro',
    amount: withdrawAmount,
  });
  alert(`Se ha retirado $${withdrawAmount} de su cuenta`);
  window.location.href = 'account.html';
};

// Funciones de transferencia
let accountBalanceElement,
  transferAmountInput,
  transferAmountErrorMessage,
  transferRecipientInput,
  transferRecipientErrorMessage,
  transferBtn;

// Obtiene referencias a los elementos del DOM relacionados con las transferencias
const getTransfersListeners = () => {
  accountBalanceElement = document.getElementById('account-balance');
  transferRecipientInput = document.getElementById('transfer-recipient');
  transferAmountInput = document.getElementById('transfer-amount');
  transferBtn = document.getElementById('transfer-btn');
  transferAmountErrorMessage = document.getElementById('transfer-amount-error');
  transferRecipientErrorMessage = document.getElementById(
    'transfer-recipient-error'
  );
};

// Establece los listeners para los botones de transferencia
const setTransfersListeners = () => {
  transferBtn?.addEventListener('click', makeTransfer);
};

// Realiza una transferencia
const makeTransfer = (event) => {
  event.preventDefault();
  const user = getSession()?.session_data.user;
  const transferAmount = parseFloat(transferAmountInput.value);
  if (user.id === transferRecipientInput.value.toLowerCase()) {
    transferRecipientErrorMessage.innerText =
      'No puedes transferirte a ti mismo';
    return;
  }
  if (transferAmount <= 10) {
    transferAmountErrorMessage.innerText =
      'El monto a transferir debe ser mayor a $10.00';
    return;
  }
  if (user.balance < transferAmount) {
    transferAmountErrorMessage.innerText = 'No tienes suficiente saldo';
    return;
  } else {
    transferAmountErrorMessage.innerText = '';
  }
  if (!transferRecipientInput.value) {
    transferRecipientErrorMessage.innerText = 'El destinatario es requerido';
    return;
  } else {
    transferRecipientErrorMessage.innerText = '';
  }
  const recipientUser = getItemById(
    transferRecipientInput.value.toLowerCase(),
    'users'
  );
  if (!recipientUser) {
    transferRecipientErrorMessage.innerText = 'El destinatario no existe';
    return;
  } else {
    transferRecipientErrorMessage.innerText = '';
  }
  user.balance -= transferAmount;
  recipientUser.balance += transferAmount;
  updateItem(user, 'users');
  updateItem(recipientUser, 'users');
  newMovement({
    username: user.id,
    movement_date: new Date().getTime(),
    movement_type: 'transferencia',
    recipientUsername: recipientUser.id,
    amount: transferAmount,
  });

  newMovement({
    username: recipientUser.id,
    movement_date: new Date().getTime(),
    movement_type: 'transferencia',
    senderUsername: user.id,
    amount: transferAmount,
  });
  alert(`Se ha retirado $${transferAmount} de su cuenta`);
  window.location.href = 'account.html';
};

// Actualiza la pantalla con los datos del usuario
const updateScreen = (userData) => {
  if (!userData) return;
  const formattedBalance = `$${userData.balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  if (accountBalanceElement) accountBalanceElement.innerText = formattedBalance;
};

// Funciones de depósito
let depositInput, depositBtn, depositErrorMessage;

// Obtiene referencias a los elementos del DOM relacionados con los depósitos
const getDepositReferences = () => {
  depositInput = document.getElementById('deposit-amount');
  depositBtn = document.getElementById('deposit-btn');
  depositErrorMessage = document.getElementById('deposit-amount-error');
};

// Establece los listeners para los botones de depósito
const setDepositListeners = () => {
  depositBtn?.addEventListener('click', makeDeposit);
};

// Realiza un depósito
const makeDeposit = (event) => {
  event.preventDefault();
  const user = getSession()?.session_data.user;
  const depositAmount = depositInput.value;
  if (depositAmount <= 0) {
    depositErrorMessage.innerText = 'El monto a depositar debe ser mayor a 0';
    return;
  }
  user.balance += Number(depositAmount);
  updateItem(user, 'users');
  newMovement({
    username: user.id,
    movement_date: new Date().getTime(),
    movement_type: 'deposito',
    amount: depositAmount,
  });
  alert(`Se ha depositado $${depositAmount} a su cuenta`);
  window.location.href = 'account.html';
};

// Funciones del pie de página
let logoutBtn;

// Obtiene referencias a los elementos del DOM relacionados con el pie de página
const getFooterReferences = () => {
  logoutBtn = document.getElementById('logout-btn');
};

// Establece los listeners para los botones del pie de página
const setFooterListeners = () => {
  logoutBtn?.addEventListener('click', logoutUser);
};

// Inicia el pie de página
const initiateFooter = () => {
  getFooterReferences();
  setFooterListeners();
};

// Inicia el documento
const initiateDocument = () => {
  getDb();
  const session = validateSession();
  return session;
};

// Listeners para el evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const session = initiateDocument();
  getAuthElementReferences();
  setAuthListeners();
  getWithdrawListeners();
  setWithdrawListeners();
  getTransfersListeners();
  setTransfersListeners();
  getDepositReferences();
  setDepositListeners();
  getMovementReferences();
  renderMovements(session?.session_data?.user);
  initiateFooter();
  console.log('MARTIN_LOG=> session', session);
  updateScreen(session?.session_data?.user);
});
