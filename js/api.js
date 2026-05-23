BookRater.api = {
  search: async (query, sortBy = 'relevance') => {
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      let docs = data.docs.slice(0, 50); // Limit to 50 results for performance
      
      // Normalise data
      let books = docs.map(doc => {
        // Find ol_id from key or cover_edition_key
        const ol_id = doc.cover_edition_key || (doc.key ? doc.key.replace('/works/', '') : null);
        
        return {
          ol_id,
          title: doc.title,
          author_name: doc.author_name ? doc.author_name[0] : 'Unknown Author',
          first_publish_year: doc.first_publish_year || 'Unknown Year',
          cover_i: doc.cover_i,
          subject: doc.subject ? doc.subject.slice(0, 3) : [],
          ratings_average: doc.ratings_average ? doc.ratings_average.toFixed(1) : null,
          ratings_count: doc.ratings_count || 0,
          first_sentence: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : null,
          cover_url: doc.cover_i 
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
            : 'assets/placeholder-cover.png'
        };
      }).filter(b => b.ol_id); // Ensure we have an ID

      // Apply sorting
      if (sortBy === 'genre') {
        books.sort((a, b) => (a.subject[0] || '').localeCompare(b.subject[0] || ''));
      } else if (sortBy === 'popularity') {
        books.sort((a, b) => b.ratings_count - a.ratings_count);
      } else if (sortBy === 'release_date') {
        books.sort((a, b) => {
          const yearA = typeof a.first_publish_year === 'number' ? a.first_publish_year : 0;
          const yearB = typeof b.first_publish_year === 'number' ? b.first_publish_year : 0;
          return yearB - yearA; // Newest first
        });
      }
      // 'relevance' is default API order

      return books;
    } catch (error) {
      console.error("Error searching Open Library:", error);
      return [];
    }
  }
};
