/**

  - Usar fetch para algo, podemos usar una api real o usar rutas relativas y simular una
  - Usar alguna libreria externa. Por ejemplo, Sweet Alert o Toastify.
 */

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
};

// Guarda la base de datos en el localStorage
const saveDb = () => {
  localStorage.setItem(dbName, JSON.stringify(database));
};

// Obtiene un ítem por su ID de una tabla específica
const getItemById = (id, table) => {
  const item = database?.[table]?.[id];
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

// resuelve la ruta relativa dentro de "pages"
const pathResolver = (path) => {
  if (path.startsWith('/')) {
    window.location.pathname = path;
  } else {
    const pathList = window.location.pathname.split('/').filter((part) => part);
    const pagesIndex = pathList.indexOf('pages');
    path.split('/').forEach((pathPart, index) => {
      pathList[pagesIndex + index + 1] = pathPart;
    });
    if (!pathList.includes('pages')) pathList.unshift('pages');
    if (pathList[0] !== 'entrega3') pathList.unshift('entrega3');
    window.location.pathname = pathList.join('/');
  }
};

const getCurrentPath = () => {
  return window.location.pathname
    .replace('/entrega3', '')
    .replace('/pages', '');
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
  const pathName = getCurrentPath();

  if (
    !session &&
    pathName !== '/auth/login.html' &&
    pathName !== '/auth/register.html' &&
    pathName !== '/index.html'
  ) {
    pathResolver('auth/login.html');
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
  passwordErrorMessage = document.getElementById('password-error');
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
const registerUser = async (event) => {
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

  if (passwordValue.length < 6) {
    passwordErrorMessage.innerText =
      'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  if (passwordValue !== passwordConfirmValue) {
    passwordErrorMessage.innerText = 'Las contraseñas no coinciden';
    return;
  }

  const newUser = {
    id: usernameValue,
    password: passwordValue,
    balance: {
      ars: 0,
      usd: 0,
    },
  };
  const user = getItemById(usernameValue, 'users');
  if (user) {
    nameErrorMessage.innerText = 'El usuario ya existe';
    return;
  }
  addItem(newUser, 'users');

  const swalResult = await Swal.fire({
    title: 'Registro exitoso',
    icon: 'success',
    confirmButtonText: 'Cool',
    timer: 2000,
    timerProgressBar: true,
  });

  if (swalResult.isConfirmed || swalResult.isDismissed) {
    pathResolver('auth/login.html');
  }
};

// Inicia sesión de usuario
const loginUser = async (event) => {
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

  const swalResult = await Swal.fire({
    title: 'Ingreso exitoso',
    icon: 'success',
    confirmButtonText: 'Cool',
    timer: 2000,
    timerProgressBar: true,
  });

  if (swalResult.isConfirmed || swalResult.isDismissed) {
    pathResolver('account/account.html');
  }
};

// Cierra sesión de usuario
const logoutUser = () => {
  validateSession();
  deleteSession();
  pathResolver('/entrega3/index.html');
};

// Funciones de movimientos
const recipientComponentModel = `<span class='movement-recipient'>:recipient</span>`;
const movementComponentModel = `<li>
    <div class="movement">
      <div class="movement-left">
        :recipient-component
        <span class="movement-sender">:sender</span>
        <span class="movement-type">:type</span>
        <span class="movement-date">:date</span>
      </div>
      <div class="movement-right">
        <span class="movement-amount">:amount</span>
        <span class="movement-currency">:currency</span>
      </div>
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
      // si es una transferencia hacia otro, el monto es negativo
      if (movement.amount > 0) {
        movement.amount = -movement.amount;
      }
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

  // si es un retiro o una compra de dolares, el monto es negativo
  if (['retiro'].includes(movement.movement_type)) {
    movement.amount = -movement.amount;
  }

  movementComponent = movementComponent.replace(
    ':date',
    formatDate(movement.movement_date)
  );
  movementComponent = movementComponent.replace(
    ':type',
    movement.movement_type
  );

  movementComponent = movementComponent.replace(
    ':currency',
    currencyConfig[movement?.currency || 'ars']?.label
  );

  const formatedAmount = formatMoneyValue(movement.amount);

  movementComponent = movementComponent.replace(':amount', formatedAmount);
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

  // lo invertimos para que se vea en orden cronologico
  // y no tener que hacer un sort
  for (let i = movements.length - 1; i >= 0; i--) {
    const movement = movements[i];
    const movementComponent = buildMovementComponent(movement);
    if (movementsContainer) movementsContainer.innerHTML += movementComponent;
  }
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
const makeWithdraw = async (event) => {
  event.preventDefault();
  const user = getSession()?.session_data.user;
  const withdrawAmount = withdrawInput.value;
  if (withdrawAmount <= 0) {
    withdrawErrorMessage.innerText = 'El monto debe ser mayor a 0';
    return;
  }

  if (user.balance.ars < withdrawAmount) {
    withdrawErrorMessage.innerText = 'No tienes suficiente saldo';
    return;
  }

  user.balance.ars -= Number(withdrawAmount);
  updateItem(user, 'users');
  newMovement({
    username: user.id,
    movement_date: new Date().getTime(),
    movement_type: 'retiro',
    amount: withdrawAmount,
  });

  const swalResult = await Swal.fire({
    title: 'Retiro exitoso',
    text: `Se ha retirado $${formatMoneyValue(withdrawAmount)} de su cuenta`,
    icon: 'success',
    confirmButtonText: 'Cool',
  });

  if (swalResult.isConfirmed || swalResult.isDismissed) {
    pathResolver('account/account.html');
  }
};

// Funciones de transferencia
let accountBalanceElement,
  transferAmountInput,
  transferAmountErrorMessage,
  transferRecipientInput,
  transferRecipientErrorMessage,
  transferCurrencyBtn,
  transferBtn;

let selectedCurrency = 'ars';
const currencyConfig = {
  ars: {
    label: 'AR$',
    minimum: 10,
  },
  usd: {
    label: 'U$D',
    minimum: 1,
  },
};

// Obtiene referencias a los elementos del DOM relacionados con las transferencias
const getTransfersListeners = () => {
  transferRecipientInput = document.getElementById('transfer-recipient');
  transferAmountInput = document.getElementById('transfer-amount');
  transferBtn = document.getElementById('transfer-btn');
  transferAmountErrorMessage = document.getElementById('transfer-amount-error');
  transferRecipientErrorMessage = document.getElementById(
    'transfer-recipient-error'
  );
  transferCurrencyBtn = document.getElementById('transfer-currency-btn');
  if (transferCurrencyBtn) {
    const config = currencyConfig[selectedCurrency];
    transferCurrencyBtn.innerHTML = `<i class="fa-solid fa-rotate"></i>${config.label}`;
  }
};

// Establece los listeners para los botones de transferencia
const setTransfersListeners = () => {
  transferBtn?.addEventListener('click', makeTransfer);

  transferCurrencyBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    selectedCurrency = selectedCurrency === 'ars' ? 'usd' : 'ars';
    const config = currencyConfig[selectedCurrency];
    transferCurrencyBtn.innerHTML = `<i class="fa-solid fa-rotate"></i>${config.label}`;
  });
};

// Realiza una transferencia
const makeTransfer = async (event) => {
  event.preventDefault();
  const user = getSession()?.session_data.user;
  const config = currencyConfig[selectedCurrency];
  const transferAmount = parseFloat(transferAmountInput.value);
  if (user.id === transferRecipientInput.value.toLowerCase()) {
    transferRecipientErrorMessage.innerText =
      'No puedes transferirte a ti mismo';
    return;
  }
  if (transferAmount < config.minimum || isNaN(transferAmount)) {
    transferAmountErrorMessage.innerText =
      'El monto mínimo a transferir es de $10.00';
    return;
  }
  if (user.balance[selectedCurrency] < transferAmount) {
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
  user.balance[selectedCurrency] -= transferAmount;
  recipientUser.balance[selectedCurrency] += transferAmount;
  updateItem(user, 'users');
  updateItem(recipientUser, 'users');
  newMovement({
    username: user.id,
    movement_date: new Date().getTime(),
    movement_type: `transferencia`,
    currency: selectedCurrency,
    recipientUsername: recipientUser.id,
    amount: transferAmount,
  });

  newMovement({
    username: recipientUser.id,
    movement_date: new Date().getTime(),
    movement_type: 'transferencia',
    currency: selectedCurrency,
    senderUsername: user.id,
    amount: transferAmount,
  });

  const swalResult = await Swal.fire({
    title: 'Transferencia exitosa',
    text: `Se ha retirado $${formatMoneyValue(transferAmount)} de su cuenta`,
    icon: 'success',
    confirmButtonText: 'Cool',
  });

  if (swalResult.isConfirmed || swalResult.isDismissed) {
    pathResolver('account/account.html');
  }
};

// Obtiene el valor del dolar blue
const getUsdToArs = async () => {
  const response = await fetch('https://dolarapi.com/v1/dolares/blue');
  const data = await response.json();
  // no se cual elegir, asi que saco el promedio entre ambos valores
  return (data.compra + data.venta) / 2;
};

const formatMoneyValue = (value) => {
  if (isNaN(value)) return value;

  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Actualiza la pantalla con los datos del usuario
const updateScreen = async (userData) => {
  accountBalanceElement = document.getElementById('account-balance');
  if (!userData) return;
  const formattedBalance = `<li>$${formatMoneyValue(
    userData.balance.ars
  )} ARS </li>  
  <li>$${formatMoneyValue(userData.balance.usd)} USD </li>
  `;
  if (accountBalanceElement) accountBalanceElement.innerHTML = formattedBalance;
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
  // Realiza un depósito
  depositBtn?.addEventListener('click', async (event) => {
    event.preventDefault();
    const user = getSession()?.session_data.user;
    const depositAmount = depositInput.value;
    if (depositAmount <= 0) {
      depositErrorMessage.innerText = 'El monto a depositar debe ser mayor a 0';
      return;
    }
    user.balance.ars += Number(depositAmount);
    updateItem(user, 'users');
    newMovement({
      username: user.id,
      movement_date: new Date().getTime(),
      movement_type: 'deposito',
      currency: 'ars',
      amount: depositAmount,
    });

    const swalResult = await Swal.fire({
      title: 'Deposito exitoso',
      text: `Se ha depositado $${formatMoneyValue(depositAmount)} a su cuenta`,
      icon: 'success',
      confirmButtonText: 'Cool',
    });

    if (swalResult.isConfirmed || swalResult.isDismissed) {
      pathResolver('account/account.html');
    }
  });
};

let usdCheckoutInput,
  usdCheckoutBtn,
  usdCheckoutErrorMessage,
  usdMarketValue,
  usdToGet;
// Obtiene referencias a los elementos del DOM relacionados con la compra de dolares
const getUsdCheckoutReferences = () => {
  usdCheckoutInput = document.getElementById('usd-checkout-amount');
  usdCheckoutBtn = document.getElementById('usd-checkout-btn');
  usdToGet = document.getElementById('usd-to-get');
  usdMarketValue = document.getElementById('usd-market-value');
  usdCheckoutErrorMessage = document.getElementById(
    'usd-checkout-amount-error'
  );
};

// Establece los listeners para los botones de compra de dolares
const setUsdCheckoutListeners = async () => {
  const usdValue = await getUsdToArs().catch(() => 1);
  if (usdMarketValue) {
    usdMarketValue.innerHTML = `$${formatMoneyValue(usdValue)}`;
  }
  const user = getSession()?.session_data.user;

  usdCheckoutBtn?.addEventListener('click', async (event) => {
    event.preventDefault();

    // redondeamos a 2 decimales para evitar problemas con el dinero
    const usdCheckoutAmount = (usdCheckoutInput.value / usdValue).toFixed(2);

    if (usdCheckoutAmount <= 0) {
      usdCheckoutErrorMessage.innerText = `El monto mínimo a comprar es de $${formatMoneyValue(
        usdValue
      )}`;
      return;
    }

    if (usdCheckoutInput.value < usdValue) {
      usdCheckoutErrorMessage.innerText = `El monto mínimo a comprar es de $${formatMoneyValue(
        usdValue
      )}`;
      return;
    }

    user.balance.usd += Number(usdCheckoutAmount);
    user.balance.ars -= Number(usdCheckoutInput.value);
    updateItem(user, 'users');
    newMovement({
      username: user.id,
      movement_date: new Date().getTime(),
      movement_type: 'compra usd',
      currency: 'usd',
      amount: usdCheckoutAmount,
    });

    const swalResult = await Swal.fire({
      title: 'Compra exitosa',
      text: `Se han depositado $${formatMoneyValue(usdCheckoutAmount)} ${
        currencyConfig.usd.label
      } a su cuenta`,
      icon: 'success',
      confirmButtonText: 'Cool',
    });

    if (swalResult.isConfirmed || swalResult.isDismissed) {
      pathResolver('account/account.html');
    }
  });

  usdCheckoutInput?.addEventListener('input', async (event) => {
    event.preventDefault();
    if (event.target.value > user.balance.ars) {
      event.target.value = user.balance.ars;
    }
    const value = event.target.value;
    if (value < usdValue) {
      usdCheckoutErrorMessage.innerText = `El monto mínimo a comprar es de $${formatMoneyValue(
        usdValue
      )}`;
      return;
    }

    usdCheckoutErrorMessage.innerText = '';
    usdToGet.innerHTML = `USD: <strong>$${formatMoneyValue(
      value / usdValue
    )}</strong>`;
  });
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

let usernameHtmlValue = document.getElementsByClassName('username');

// Inicia el pie de página
const initiateFooter = () => {
  getFooterReferences();
  setFooterListeners();
};

// Inicia el documento
const initiateDocument = () => {
  getDb();
  const session = validateSession();
  if (session) {
    for (let i = 0; i < usernameHtmlValue.length; i++) {
      usernameHtmlValue[i].innerText = session.session_data.user.id;
    }
  }
  return session;
};

// Listeners para el evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  const session = initiateDocument();
  const currentPath = getCurrentPath();
  if (
    currentPath === '/auth/login.html' ||
    currentPath === '/auth/register.html'
  ) {
    getAuthElementReferences();
    setAuthListeners();
  } else {
    await updateScreen(session?.session_data?.user);
  }

  if (currentPath === '/account/withdraw.html') {
    getWithdrawListeners();
    setWithdrawListeners();
  }

  if (currentPath === '/account/transfer.html') {
    getTransfersListeners();
    setTransfersListeners();
  }

  if (currentPath === '/account/deposit.html') {
    getDepositReferences();
    setDepositListeners();
  }

  if (currentPath === '/account/buyUsd.html') {
    getUsdCheckoutReferences();
    await setUsdCheckoutListeners();
  }

  if (currentPath === '/account/movement-history.html') {
    getMovementReferences();
    renderMovements(session?.session_data?.user);
  }

  initiateFooter();
});
