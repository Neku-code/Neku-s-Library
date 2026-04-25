    document.addEventListener('DOMContentLoaded', () => {
        const favoritesStorageKey = 'bookshelf-favorites';
        const state = {
            books: [],
            filteredBooks: [],
            currentSearch: '',
            currentCategory: 'all',
            currentTheme: 'light',
            favoriteBookIds: []
        };

        const bookGrid = document.getElementById('bookGrid');
        const searchInput = document.getElementById('searchInput');
        const noResults = document.getElementById('noResults');
        const modeBtns = document.querySelectorAll('.mode-btn');
        const navLinks = document.querySelectorAll('.nav-link');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        
        const toggleSidebar = () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        menuToggle.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

    
        state.books = [
             {
                title: "How to fail At almost Everything and Still win Big",
                category: "Self-Help",
                cover: "Book-covers/How to fail at almost Everything and still win Big.png",
                pdf: "pdf's/How to fail at everything and still win big.pdf"
            },
            {
                title: "Deep Work",
                category: "Self-Help",
                cover: "Book-covers/Deep Work.png",
                pdf: "pdf's/Deep Work.pdf"
            },
            {
                title: "Fact Fulness",
                category: "Self-Help",
                cover: "book-covers/Fact Fullness.png",
                pdf: "pdf's/Fact Fullness.pdf"
            },
            {
                title: "Clear Thinking",
                category: "Self-Help",
                cover: "Book-covers/Clear Thinking.png",
                pdf: "pdf's/Clear Thinking.pdf"
            },
            {
                title: "Animal Farm",
                category: "Classical",
                cover: "Book-covers/Animal Farm.png",
                pdf: "pdf's/Animal Farm.pdf"
            },
            {
                title: "Atomic Habits",
                category: "Self-Help",
                cover: "Book-covers/Atomic Habits.png",
                pdf: "pdf's/Atomic Habits.pdf"
            },
            {
                title: "Harry Potter and the Chamber of Secrets",
                category: "Fiction",
                cover: "Book-covers/Harry Potter and the Chamber of Secrets.png",
                pdf: "pdf's/Harry Potter and The Chamber of Secrets.pdf"
            },
            {
                title: "Harry Potter and the Philosopher's Stone",
                category: "Fiction",
                cover: "Book-covers/Harry Potter and the Philosopher's Stone.png",
                pdf: "pdf's/Harry-Potter-and-the-Philosophers-Stone.pdf"
            },
            {
                title: "Harry Potter and the Prisoner of Azkaban",
                category: "Fiction",
                cover: "Book-covers/Harry Potter and the Prisoner of Azkaban.png",
                pdf: "pdf's/Harry-Potter-and-the-Prisoner-of-Azkaban.pdf"
            },
            {
                title: "The Castle",
                category: "Literature",
                cover: "Book-covers/The Castle.png",
                pdf: "pdf's/The Castle (Franz Kafka).pdf"
            },
            {
                title: "The Courage to be Disliked",
                category: "Self-Help",
                cover: "Book-covers/The courage to be disliked Cover.png",
                pdf: "pdf's/The Courage to be Disliked.pdf"
            },
            {
                title: "The Great Gatsby",
                category: "Classical",
                cover: "Book-covers/The Great Gatsby.png",
                pdf: "pdf's/The-great-gatsby.pdf"
            },
            {
                title: "The Lessons of History",
                category: "Literature",
                cover: "Book-covers/The lessons of History.png",
                pdf: "pdf's/The Lessons of History.pdf"
            },
            {
                title: "The Metamorphosis",
                category: "Classical",
                cover: "Book-covers/The Metamorphosis.png",
                pdf: "pdf's/The-metamorphosis.pdf"
            },
            {
                title: "The Prince by Machiavelli",
                category: "Classical",
                cover: "Book-covers/The Prince By Machiavelli.png",
                pdf: "pdf's/The Prince by Machiavelli.pdf"
            },
            {
                title: "Fight Club",
                category: "Classical",
                cover: "Book-covers/Fight Club Book.png",
                pdf: "pdf's/Fight Club Book.pdf"
            },
            {
                title: "Thinking, Fast and Slow",
                category: "Self-Help",
                cover: "Book-covers/Thinking Fast and Slow.png",
                pdf: "pdf's/Thinking, Fast and Slow.pdf"
            },
            {
                title: "Can't Hurt Me",
                category: "Self-Help",
                cover: "Book-covers/Can't Hurt Me.png",
                pdf: "pdf's/Can't Hurt Me.pdf"
            },
            {
                title: "Fahrenheight",
                category: "Classical",
                cover: "Book-covers/Fahrenheight.png",
                pdf: "pdf's/Fahrenheit 451.pdf"
            },
            {
                title: "The Power of Habit",
                category: "Self-Help",
                cover: "Book-covers/The Power of Habit.png",
                pdf: "pdf's/The power of Habit.pdf"
            },
            {
                title: "Man's Search for Meaning",
                category: "Classical",
                cover: "Book-covers/Man's search for meaning.png",
                pdf: "pdf's/Mans search for meaning.pdf"
            },
            {
                title: "Al Kimyogar",
                category: "Fiction",
                cover: "Book-covers/AL Kimyogar.png",
                pdf: "pdf's/Al Kimyogar.pdf"
            },
            {
                title: "Shumbola",
                category: "Classical",
                cover: "Book-covers/Shum Bola.png",
                pdf: "pdf's/Shumbola.pdf"
            },
            {
                title: "Kichkina Shahzoda",
                category: "Fiction", 
                cover: "Book-covers/Kichkina Shahzoda.png",
                pdf: "pdf's/Kichkina Shahzoda.pdf"
            },
            {
                title: "Otamdan Qolgan Dalalar",
                category: "Literature",
                cover: "Book-covers/Otamdan Qolgan Dalalar.png",
                pdf: "pdf's/Otamdan qolgan dalalar.pdf"
            },
            {
                title: "JimJitlik Said Ahmad",
                category: "Literature",
                cover: "Book-covers/Jimjitlik.png",
                pdf: "pdf's/JimJitlik.pdf"
            },
            {
                title: "Sinchalak",
                category: "Literature",
                cover: "Book-covers/Sinchalak.png",
                pdf: "pdf's/Sinchalak.pdf"
            },
            {
                title: "Sariq Devni Minib",
                category: "Fiction",
                cover: "Book-covers/Sariq Devni Minib.png",
                pdf: "pdf's/Sariq Devni Minib.pdf"
            }
            // Ali ETgan kitoblanityam tezro qosh 
        ].map((book, index) => ({
            ...book,
            id: book.pdf,
            originalIndex: index
        }));

        try {
            const savedFavorites = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]');
            state.favoriteBookIds = Array.isArray(savedFavorites)
                ? savedFavorites.filter(id => state.books.some(book => book.id === id))
                : [];
        } catch (error) {
            state.favoriteBookIds = [];
        }

        state.filteredBooks = [...state.books];

        const saveFavorites = () => {
            localStorage.setItem(favoritesStorageKey, JSON.stringify(state.favoriteBookIds));
        };

        const sortBooks = books => {
            const favoriteOrder = new Map(state.favoriteBookIds.map((id, index) => [id, index]));

            return [...books].sort((firstBook, secondBook) => {
                const firstFavoriteIndex = favoriteOrder.get(firstBook.id);
                const secondFavoriteIndex = favoriteOrder.get(secondBook.id);
                const firstIsFavorite = firstFavoriteIndex !== undefined;
                const secondIsFavorite = secondFavoriteIndex !== undefined;

                if (firstIsFavorite && secondIsFavorite) {
                    return firstFavoriteIndex - secondFavoriteIndex;
                }

                if (firstIsFavorite) return -1;
                if (secondIsFavorite) return 1;

                return firstBook.originalIndex - secondBook.originalIndex;
            });
        };

        const toggleFavorite = bookId => {
            const favoriteIndex = state.favoriteBookIds.indexOf(bookId);

            if (favoriteIndex >= 0) {
                state.favoriteBookIds.splice(favoriteIndex, 1);
            } else {
                state.favoriteBookIds.push(bookId);
            }

            saveFavorites();
            filterBooks();
        };

        const renderBooks = () => {
            bookGrid.innerHTML = '';

            if (state.filteredBooks.length === 0) {
                noResults.classList.remove('hidden');
                return;
            }

            noResults.classList.add('hidden');

            sortBooks(state.filteredBooks).forEach(book => {
                const card = document.createElement('div');
                card.className = 'book-card';
                const isFavorite = state.favoriteBookIds.includes(book.id);

                card.innerHTML = `
                    <div class="cover-container">
                        <button class="favorite-button${isFavorite ? ' is-favorite' : ''}" type="button" aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${isFavorite}">
                            ★
                        </button>
                        <img src="${book.cover}" alt="${book.title}" loading="lazy" decoding="async">
                    </div>
                    <div class="book-info">
                        <span class="book-category">${book.category}</span>
                        <h3 class="book-title">${book.title}</h3>
                    </div>
                `;

                card.addEventListener('click', () => {
                    window.location.href = `reader.html?book=${encodeURIComponent(book.pdf)}&title=${encodeURIComponent(book.title)}`;
                });

                const favoriteButton = card.querySelector('.favorite-button');
                favoriteButton.addEventListener('click', event => {
                    event.stopPropagation();
                    toggleFavorite(book.id);
                });

                bookGrid.appendChild(card);
            });
        };

        const filterBooks = () => {
            const query = state.currentSearch.toLowerCase();

            state.filteredBooks = state.books.filter(book => {
                const matchSearch =
                    book.title.toLowerCase().includes(query) ||
                    book.category.toLowerCase().includes(query);

                const matchCategory =
                    state.currentCategory === 'all' ||
                    book.category === state.currentCategory;

                return matchSearch && matchCategory;
            });

            renderBooks();
        };

        searchInput.addEventListener('input', (e) => {
            state.currentSearch = e.target.value;
            filterBooks();
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                state.currentCategory = link.dataset.category;
                filterBooks();
                
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
        });

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;

                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.documentElement.setAttribute('data-theme', mode);
            }); 
        });

        renderBooks();
    });
