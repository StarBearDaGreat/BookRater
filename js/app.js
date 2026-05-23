BookRater.app = {
  currentView: 'search-view',
  currentBook: null, // holds currently viewed book object

  init: function() {
    this.bindNav();
    this.bindSearch();
    this.bindModalActions();
    
    // Init modules
    if (BookRater.shelves) BookRater.shelves.init();
    if (BookRater.ratings) BookRater.ratings.init();
    if (BookRater.goals) BookRater.goals.init();
  },

  bindNav: function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update nav UI
        navBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Switch view
        const targetViewId = e.target.dataset.target;
        document.querySelectorAll('.view').forEach(view => {
          view.classList.add('hidden');
        });
        document.getElementById(targetViewId).classList.remove('hidden');
        this.currentView = targetViewId;
        
        // Trigger view-specific render
        if (targetViewId === 'shelves-view') {
          BookRater.shelves.render();
        } else if (targetViewId === 'goals-view') {
          BookRater.goals.render();
        }
      });
    });
  },

  bindSearch: function() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    
    const performSearch = async () => {
      const query = searchInput.value.trim();
      if (!query) return;
      
      const loading = document.getElementById('search-loading');
      const resultsContainer = document.getElementById('search-results');
      
      loading.classList.remove('hidden');
      resultsContainer.innerHTML = '';
      
      const sortBy = sortSelect.value;
      const books = await BookRater.api.search(query, sortBy);
      
      loading.classList.add('hidden');
      
      if (books.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted">No results found.</p>';
        return;
      }
      
      books.forEach(book => {
        const card = this.createBookCard(book);
        resultsContainer.appendChild(card);
      });
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    sortSelect.addEventListener('change', performSearch); // Re-search with new sort (API side handles it in our mock, or client side)
  },

  createBookCard: function(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const img = document.createElement('img');
    img.src = book.cover_url;
    img.alt = `Cover of ${book.title}`;
    img.onerror = function() { this.src = 'assets/placeholder-cover.png'; };
    
    const title = document.createElement('div');
    title.className = 'book-card-title';
    title.textContent = book.title;
    
    const author = document.createElement('div');
    author.className = 'book-card-author';
    author.textContent = book.author_name;
    
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(author);
    
    card.addEventListener('click', () => this.openBookDetails(book));
    
    return card;
  },

  openBookDetails: async function(book) {
    this.currentBook = book;
    
    document.getElementById('detail-cover').src = book.cover_url;
    document.getElementById('detail-title').textContent = book.title;
    document.getElementById('detail-author').textContent = book.author_name;
    document.getElementById('detail-year').textContent = book.first_publish_year;
    document.getElementById('detail-comm-rating').textContent = book.ratings_average ? book.ratings_average : 'N/A';
    document.getElementById('detail-blurb').textContent = book.first_sentence || 'No description available.';
    
    // Reset shelf buttons
    const btnWantToRead = document.getElementById('btn-want-to-read');
    const btnRead = document.getElementById('btn-read');
    btnWantToRead.classList.remove('in-shelf');
    btnRead.classList.remove('in-shelf');
    
    // Check shelf status
    const status = await BookRater.shelves.checkShelfStatus(book.ol_id);
    if (status.want_to_read) btnWantToRead.classList.add('in-shelf');
    if (status.read) btnRead.classList.add('in-shelf');
    
    // Populate list assignment dropdown
    await this.populateListDropdown();
    if (status.list_name) {
      document.getElementById('assign-list-select').value = status.list_name;
    }
    
    // Load personal rating
    await BookRater.ratings.loadForBook(book.ol_id);
    
    document.getElementById('book-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  },

  populateListDropdown: async function() {
    const select = document.getElementById('assign-list-select');
    select.innerHTML = '<option value="">(None)</option>';
    
    // We get lists from both shelves or maybe we should only show lists for current shelf?
    // Let's just aggregate all lists for simplicity in the UI
    const wantLists = await BookRater.db.getCustomLists('want_to_read');
    const readLists = await BookRater.db.getCustomLists('read');
    const allLists = new Set([...wantLists, ...readLists]);
    
    allLists.forEach(listName => {
      const option = document.createElement('option');
      option.value = listName;
      option.textContent = listName;
      select.appendChild(option);
    });
  },

  bindModalActions: function() {
    const modal = document.getElementById('book-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
    
    document.getElementById('btn-want-to-read').addEventListener('click', async () => {
      if (!this.currentBook) return;
      const listName = document.getElementById('assign-list-select').value || null;
      await BookRater.shelves.addToShelf(this.currentBook, 'want_to_read', listName);
      
      document.getElementById('btn-want-to-read').classList.add('in-shelf');
      document.getElementById('btn-read').classList.remove('in-shelf');
    });
    
    document.getElementById('btn-read').addEventListener('click', async () => {
      if (!this.currentBook) return;
      const listName = document.getElementById('assign-list-select').value || null;
      await BookRater.shelves.addToShelf(this.currentBook, 'read', listName);
      
      document.getElementById('btn-want-to-read').classList.remove('in-shelf');
      document.getElementById('btn-read').classList.add('in-shelf');
    });
  }
};

// Start app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  BookRater.app.init();
});
