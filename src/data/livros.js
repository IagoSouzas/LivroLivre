// Catálogo interno de livros (21 títulos). Título, autor e número da capa foram obtidos uma única vez
// na Open Library. As capas são carregadas por imagem, sem consulta à API no app.
// Livros sem capa na Open Library ficam com imagem vazia (placeholder na tela).

export const CATEGORIA_LIVRO = 'Livros';

export const LIVROS = [
  { id: 'livro-01', nome: 'Dom Casmurro', autor: 'Machado de Assis', capa: 647501 },
  { id: 'livro-02', nome: 'Iracema', autor: 'José de Alencar', capa: 2664651 },
  { id: 'livro-03', nome: 'O Cortiço', autor: 'Aluísio Azevedo', capa: 13938346 },
  { id: 'livro-04', nome: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', capa: 123152 },
  { id: 'livro-05', nome: 'Capitães da Areia', autor: 'Jorge Amado', capa: 4178919 },
  { id: 'livro-06', nome: 'Vidas Secas', autor: 'Graciliano Ramos', capa: 12369687 },
  { id: 'livro-07', nome: 'O Alienista', autor: 'Machado de Assis', capa: 647504 },
  { id: 'livro-08', nome: 'Macunaíma', autor: 'Mário de Andrade', capa: 6921967 },
  { id: 'livro-09', nome: 'Grande Sertão: Veredas', autor: 'João Guimarães Rosa', capa: 13946180 },
  { id: 'livro-10', nome: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', capa: 15231561 },
  { id: 'livro-11', nome: 'Harry Potter e a Pedra Filosofal', autor: 'J. K. Rowling', capa: 15155833 },
  { id: 'livro-12', nome: 'O Hobbit', autor: 'J. R. R. Tolkien', capa: 15121777 },
  { id: 'livro-13', nome: '1984', autor: 'George Orwell', capa: 8745958 },
  { id: 'livro-14', nome: 'Dom Quixote', autor: 'Miguel de Cervantes', capa: 4918434 },
  { id: 'livro-15', nome: 'Orgulho e Preconceito', autor: 'Jane Austen', capa: null },
  { id: 'livro-16', nome: 'A Revolução dos Bichos', autor: 'George Orwell', capa: 12369960 },
  { id: 'livro-17', nome: 'Fahrenheit 451', autor: 'Ray Bradbury', capa: 12993656 },
  { id: 'livro-18', nome: 'Sapiens', autor: 'Yuval Noah Harari', capa: 8634250 },
  { id: 'livro-19', nome: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', capa: null },
  { id: 'livro-20', nome: 'O Senhor dos Anéis: A Sociedade do Anel', autor: 'J. R. R. Tolkien', capa: null },
  { id: 'livro-21', nome: 'O Diário de Anne Frank', autor: 'Anne Frank', capa: null },
];

export function imagemDoLivro(livro) {
  return livro.capa ? `https://covers.openlibrary.org/b/id/${livro.capa}-M.jpg` : null;
}
