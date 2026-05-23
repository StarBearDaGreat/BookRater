BookRater.shelves = {
  currentShelf: 'want_to_read',
  currentList: null,

  init: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    const tabBtns = document.querySelectorAll('.shelf-tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentShelf = e.target.dataset.shelf;
        this.currentList = null; // Reset sub-list filter
        this.render();
      });
    });

    document.getElementById('add-list-btn').addEventListener('click', async () => {
      const input = document.getElementById('new-list-input');
      const listName = input.value.trim();
      if (listName) {
        // Just render the new list tag, it won't be saved to DB until a book is added to it
        this.addCustomListTag(listName);
        input.value = '';
      }
    });
  },

  render: async function() {
    const container = document.getElementById('shelf-books');
    container.innerHTML = 'Loading shelves...';
    
    // Load custom lists tags
    await this.renderCustomLists();

    // Load shelf entries
    const entries = await BookRater.db.getShelfEntries(this.currentShelf);
    
    // Filter by custom list if selected
    const filteredEntries = this.currentList 
      ? entries.filter(e => e.list_name === this.currentList)
      : entries;

    if (filteredEntries.length === 0) {
      container.innerHTML = '<p class="text-muted">No books here yet.</p>';
      return;
    }

    container.innerHTML = '';
    
    // Fetch and render books
    for (const entry of filteredEntries) {
      const book = await BookRater.db.getBook(entry.ol_id);
      if (book) {
        const card = BookRater.app.createBookCard(book);
        container.appendChild(card);
      }
    }
  },

  renderCustomLists: async function() {
    const listContainer = document.getElementById('custom-lists');
    listContainer.innerHTML = '';
    
    const lists = await BookRater.db.getCustomLists(this.currentShelf);
    
    // Add "All" tag
    const allTag = document.createElement('li');
    allTag.className = `custom-list-tag ${this.currentList === null ? 'active' : ''}`;
    allTag.textContent = 'All';
    allTag.addEventListener('click', () => {
      this.currentList = null;
      this.render();
    });
    listContainer.appendChild(allTag);

    lists.forEach(listName => {
      this.addCustomListTag(listName);
    });
  },

  addCustomListTag: function(listName) {
    const listContainer = document.getElementById('custom-lists');
    // Check if exists
    const existing = Array.from(listContainer.children).find(el => el.textContent === listName);
    if (existing) return;

    const tag = document.createElement('li');
    tag.className = `custom-list-tag ${this.currentList === listName ? 'active' : ''}`;
    tag.textContent = listName;
    tag.addEventListener('click', () => {
      this.currentList = listName;
      this.render();
    });
    listContainer.appendChild(tag);
  },

  addToShelf: async function(book, shelfName, listName = null) {
    await BookRater.db.saveBook(book);
    
    // Auto-move logic: if moving to 'read', remove from 'want_to_read'
    if (shelfName === 'read') {
      await BookRater.db.deleteShelfEntry(book.ol_id, 'want_to_read');
    }
    
    await BookRater.db.saveShelfEntry(book.ol_id, shelfName, listName);
    
    // Refresh if currently on shelves view
    if (BookRater.app.currentView === 'shelves-view') {
      this.render();
    }
  },

  checkShelfStatus: async function(ol_id) {
    if (!BookRater.db) return { want_to_read: false, read: false, list_name: null };
    try {
      const wantToRead = await BookRater.db.getShelfEntries('want_to_read');
      const read = await BookRater.db.getShelfEntries('read');
      
      const inWantToRead = wantToRead.find(e => e.ol_id === ol_id);
      const inRead = read.find(e => e.ol_id === ol_id);
      
      return {
        want_to_read: !!inWantToRead,
        read: !!inRead,
        list_name: inWantToRead?.list_name || inRead?.list_name || null
      };
    } catch (e) {
      console.warn('checkShelfStatus failed:', e);
      return { want_to_read: false, read: false, list_name: null };
    }
  }
};
