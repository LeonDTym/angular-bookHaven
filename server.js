const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-node server.jsparser');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const SECRET_KEY = 'ваш_секретный_ключ'; // Замените на свой секретный ключ
const PORT = 3000;

server.use(middlewares);
server.use(bodyParser.json());

// Эндпоинт для авторизации
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = router.db.get('users').find({ email, password }).value();

  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } else {
    res.status(401).json({ message: 'Неверные учетные данные' });
  }
});

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Получаем токен из заголовка

  if (!token) return res.sendStatus(401); // Если токен отсутствует, возвращаем 401

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Если токен недействителен, возвращаем 403
    req.user = user;
    next();
  });
};

// Защита маршрутов
server.use(authenticateToken);

// Используйте router после проверки токена
server.use(router);

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
