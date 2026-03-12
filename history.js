document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('history-body');

    try {
        const response = await fetch('/api/games');
        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="loading">No games have been played yet.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        
        data.forEach(game => {
            const tr = document.createElement('tr');
            
            // Format timestamp
            const date = new Date(game.timestamp);
            const dateString = date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const timeString = date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            tr.innerHTML = `
                <td>#${game.id}</td>
                <td><strong>${game.game_played}</strong></td>
                <td>${dateString} at ${timeString}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error('Failed to load history:', err);
        tbody.innerHTML = '<tr><td colspan="3" class="loading" style="color: #ff7b72;">Error loading history data. Is the database connected?</td></tr>';
    }
});
