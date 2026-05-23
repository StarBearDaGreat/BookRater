BookRater.goals = {
  currentYear: new Date().getFullYear(),

  init: function() {
    document.getElementById('current-year').textContent = this.currentYear;
    
    document.getElementById('save-goal-btn').addEventListener('click', async () => {
      const target = parseInt(document.getElementById('goal-input').value);
      if (target > 0) {
        await BookRater.db.saveGoal(this.currentYear, target);
        this.render(); // Refresh UI
      }
    });
  },

  render: async function() {
    const goalData = await BookRater.db.getGoal(this.currentYear);
    const readCount = await BookRater.db.getBooksReadCount(this.currentYear);
    
    const display = document.querySelector('.goal-progress-display');
    const targetInput = document.getElementById('goal-input');
    
    if (goalData && goalData.target > 0) {
      display.classList.remove('hidden');
      targetInput.value = goalData.target;
      
      document.getElementById('goal-target').textContent = goalData.target;
      document.getElementById('books-read-count').textContent = readCount;
      
      const percentage = Math.min(100, Math.round((readCount / goalData.target) * 100));
      document.getElementById('goal-progress-bar').style.width = `${percentage}%`;
    } else {
      display.classList.add('hidden');
      targetInput.value = '';
    }
  }
};
