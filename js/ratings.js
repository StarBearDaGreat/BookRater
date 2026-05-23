BookRater.ratings = {
  currentRating: 0,
  currentBookId: null,

  init: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    const stars = document.querySelectorAll('#personal-stars span');
    
    stars.forEach(star => {
      // Hover effects
      star.addEventListener('mouseover', (e) => {
        const val = parseInt(e.target.dataset.val);
        this.highlightStars(val, 'hover-active');
      });
      
      star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover-active'));
      });
      
      // Click to set rating
      star.addEventListener('click', (e) => {
        this.currentRating = parseInt(e.target.dataset.val);
        this.highlightStars(this.currentRating, 'active');
      });
    });

    document.getElementById('save-rating-btn').addEventListener('click', async () => {
      if (!this.currentBookId) return;
      
      const comment = document.getElementById('personal-comment').value;
      await BookRater.db.saveRating(this.currentBookId, this.currentRating, comment);
      
      const msg = document.getElementById('rating-save-msg');
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 3000);
    });
  },

  highlightStars: function(val, className) {
    const stars = document.querySelectorAll('#personal-stars span');
    stars.forEach(star => {
      if (parseInt(star.dataset.val) <= val) {
        star.classList.add(className);
      } else {
        if (className === 'active') {
          star.classList.remove('active');
        }
      }
    });
  },

  loadForBook: async function(ol_id) {
    this.currentBookId = ol_id;
    this.currentRating = 0;
    document.getElementById('personal-comment').value = '';
    this.highlightStars(0, 'active'); // Reset stars
    
    const data = await BookRater.db.getRating(ol_id);
    if (data) {
      this.currentRating = data.rating || 0;
      this.highlightStars(this.currentRating, 'active');
      document.getElementById('personal-comment').value = data.comment || '';
    }
  }
};
