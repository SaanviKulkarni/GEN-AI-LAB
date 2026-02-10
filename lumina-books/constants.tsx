
import { Book, BlogPost } from './types';

export const CATEGORIES = [
  "Fiction", "Non-Fiction", "Academic", "Children", "Comics", "Exam Prep", "Science", "Business"
];

export const SAMPLE_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    price: 18.99,
    discountPrice: 14.99,
    rating: 4.8,
    reviews: 1250,
    coverImage: "https://picsum.photos/seed/book1/400/600",
    isbn: "978-0525559474",
    publisher: "Viking",
    format: "Hardcover",
    language: "English",
    pages: 304,
    stock: 25,
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    featured: true,
    bestseller: true
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Non-Fiction",
    price: 27.00,
    discountPrice: 21.60,
    rating: 4.9,
    reviews: 84000,
    coverImage: "https://picsum.photos/seed/book2/400/600",
    isbn: "978-0735211292",
    publisher: "Avery",
    format: "Paperback",
    language: "English",
    pages: 320,
    stock: 100,
    description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day.",
    bestseller: true
  },
  {
    id: "3",
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    price: 15.99,
    rating: 4.7,
    reviews: 45000,
    coverImage: "https://picsum.photos/seed/book3/400/600",
    isbn: "978-0062315007",
    publisher: "HarperOne",
    format: "Paperback",
    language: "English",
    pages: 208,
    stock: 50,
    description: "A fable about following your dream.",
    featured: true
  },
  {
    id: "4",
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Business",
    price: 24.99,
    discountPrice: 19.99,
    rating: 4.6,
    reviews: 12000,
    coverImage: "https://picsum.photos/seed/book4/400/600",
    isbn: "978-1455586691",
    publisher: "Grand Central Publishing",
    format: "Hardcover",
    language: "English",
    pages: 304,
    stock: 12,
    description: "Rules for Focused Success in a Distracted World.",
    newArrival: true
  },
  {
    id: "5",
    title: "The Very Hungry Caterpillar",
    author: "Eric Carle",
    genre: "Children",
    price: 10.99,
    rating: 4.9,
    reviews: 150000,
    coverImage: "https://picsum.photos/seed/book5/400/600",
    isbn: "978-0399226908",
    publisher: "Philomel Books",
    format: "Hardcover",
    language: "English",
    pages: 26,
    stock: 80,
    description: "The all-time classic story of a hungry caterpillar.",
    bestseller: true
  },
  {
    id: "6",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "Science",
    price: 22.50,
    rating: 4.8,
    reviews: 65000,
    coverImage: "https://picsum.photos/seed/book6/400/600",
    isbn: "978-0062316097",
    publisher: "Harper",
    format: "Paperback",
    language: "English",
    pages: 464,
    stock: 35,
    description: "A fascinating narrative of humanity's creation and evolution.",
    featured: true
  }
];

export const SAMPLE_BLOGS: BlogPost[] = [
  {
    id: "b1",
    title: "Top 10 Reads for Autumn 2024",
    excerpt: "As the leaves change, our reading list evolves. Discover the coziest mysteries and heart-wrenching dramas to dive into this season.",
    author: "Elena Reed",
    date: "Oct 15, 2024",
    image: "https://picsum.photos/seed/blog1/800/400",
    content: "Full content about autumn reading list..."
  },
  {
    id: "b2",
    title: "The Art of Reading Deeply",
    excerpt: "In a world of fast-scrolling, how do we return to the immersive experience of deep reading? We explore techniques for concentration.",
    author: "Marcus Thorne",
    date: "Oct 10, 2024",
    image: "https://picsum.photos/seed/blog2/800/400",
    content: "Full content about deep reading..."
  }
];
