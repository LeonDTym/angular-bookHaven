const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const server = jsonServer.create();
// const router = jsonServer.router('D:\\!Project\\GItHub\\angular-bookHaven\\db.json');
 const router = jsonServer.router('D:\\Программы\\VsCode\\angular-bookHaven\\db.json');
const middlewares = jsonServer.defaults();
const SECRET_KEY = 'my-secret-key';
const PORT = 3000;

server.use(middlewares);
server.use(bodyParser.json({ limit: '10mb' })); // Увеличиваем лимит тела запроса
server.use(bodyParser.urlencoded({ extended: true }));

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token is missing' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Эндпоинт для авторизации
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = router.db.get('users').find({ email, password }).value();

  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Эндпоинт для регистрации
server.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  const users = router.db.get('users');
  const userExists = users.find({ email }).value();

  if (userExists) {
    return res.status(400).json({ message: 'Пользователь с таким email уже зарегистрирован' });
  }

  const newUser = { id: Date.now(), email, password, name };
  users.push(newUser).write();
  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

//Добавление любимых книг только для авторизованного пользователя
server.post('/favorite_books', authenticateToken, (req, res) => {
  const newFavoriteBook = req.body;
  const favorite_books = router.db.get('favorite_books');

  favorite_books.push(newFavoriteBook).write();
  res.status(201).json({ message: 'Book added in favorite successfully', book: newFavoriteBook });
});

// Удалкение любимых книг только для авторизованного пользователя
server.delete('/favorite_books', authenticateToken, (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  const bookId = req.query.bookId;

  // Находим запись, которую нужно удалить
  const favoriteBook = router.db.get('favorite_books').find({ userId: userId, bookId: bookId }).value();

  if (favoriteBook) {
    // Удаляем запись
    router.db.get('favorite_books').remove(favoriteBook).write();
    res.status(200).json({ message: 'Book removed from favorites successfully' });
  } else {
    res.status(404).json({ message: 'Favorite book not found' });
  }
});

// Удалкение книг только для авторизованного пользователя
server.delete('/books', authenticateToken, (req, res) => {

  const bookId = req.query.id;

  // Находим запись, которую нужно удалить
  const Book = router.db.get('books').find({bookId: bookId }).value();

  if (Book) {
    // Удаляем запись
    router.db.get('books').remove(Book).write();
    res.status(200).json({ message: 'Book removed from favorites successfully' });
  } else {
    res.status(404).json({ message: 'Favorite book not found' });
  }
});

// Пример защищённого маршрута
server.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Эндпоинт для получения текущего пользователя
server.get('/auth/me', authenticateToken, (req, res) => {
  console.log('из токена пользователь:', req.user);
  const user = router.db.get('users').find({ id: req.user.id }).value();
  if (user) {
    res.json({ id: user.id, name: user.name, email: user.email });
  } else {
    console.error('если нету:', req.user.id);
    res.status(404).json({ message: 'User not found' });
  }
});

// Эндпоинт для добавления книги
server.post('/books', (req, res) => {
  try {
    const { title, description, author, publicationDate, img, genre } = req.body;

    if (!title || !description || !author || !publicationDate || !img || !genre) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения.' });
    }

    const newBook = {
      id: Date.now().toString(),
      title,
      description,
      author,
      publicationDate,
      img,
      genre, // Добавляем жанр
    };

    console.log('Добавление книги:', newBook); // Логируем данные книги

    const books = router.db.get('books');
    books.push(newBook).write();

    res.status(201).json({ message: 'Книга успешно добавлена.', book: newBook });
  } catch (error) {
    console.error('Ошибка при добавлении книги:', error);
    res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
  }
});

server.put('/books/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updatedBook = req.body;

  if (!updatedBook || !id) {
    return res.status(400).json({ message: 'Некорректные данные для обновления книги.' });
  }

  const books = router.db.get('books');
  const book = books.find({ id }).value();

  if (book) {
    books.find({ id }).assign(updatedBook).write();
    res.status(200).json({ message: 'Книга успешно обновлена.', book: updatedBook });
  } else {
    res.status(404).json({ message: 'Книга не найдена.' });
  }
});
// Используйте router после проверки токена
server.use(router);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
