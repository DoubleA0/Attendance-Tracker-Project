document.getElementById('classSelect').addEventListener('change', function() {
    const selectedClass = this.value;
    const rosterContainer = document.getElementById('rosterContainer');

    // Clear previous roster
    rosterContainer.innerHTML = '';

    if (selectedClass) {
        // Fetch roster data based on selected class
        // For demonstration, using static data. Replace this with actual data fetching logic.
        const rosters = {
            class1: ['Student A', 'Student B', 'Student C'],
            class2: ['Student D', 'Student E', 'Student F'],
            class3: ['Student G', 'Student H', 'Student I']
            // Add more classes and their rosters as needed
        };

        const roster = rosters[selectedClass];

        if (roster) {
            const ul = document.createElement('ul');
            roster.forEach(student => {
                const li = document.createElement('li');
                li.textContent = student;
                ul.appendChild(li);
            });
            rosterContainer.appendChild(ul);
        } else {
            rosterContainer.textContent = 'No roster available for the selected class.';
        }
    }
});
