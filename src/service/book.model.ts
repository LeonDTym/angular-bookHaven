export interface Book {
  id: string;
  title: string;
  description: string;
  img: string;
  author: string;
  publicationDate: string;
  genre: string[]; // Поле жанра как массив строк
}
