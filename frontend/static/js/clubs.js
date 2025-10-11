document.addEventListener('DOMContentLoaded', function() {
    // Fetch clubs
    fetch('/api/clubs/')
        .then(res => res.json())
        .then(data => {
            let html = '<ul>';
            data.forEach(club => {
                html += `<li><b>${club.name}</b>: ${club.description || ''}</li>`;
            });
            html += '</ul>';
            document.getElementById('clubs').innerHTML = html;
        });

    // Fetch club events
    fetch('/api/events/clubs/')
        .then(res => res.json())
        .then(data => {
            let html = '<ul>';
            data.forEach(event => {
                html += `<li><b>${event.name}</b> (${event.date}): ${event.description || ''}</li>`;
            });
            html += '</ul>';
            document.getElementById('events').innerHTML = html;
        });
});