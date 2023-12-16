document.addEventListener("DOMContentLoaded", function () {
  const users = ["smitkbgd", "sahilhedau49", "samrat3112", "ShreyashShahu", "saurabh7612"];
  const statsContainer = document.getElementById("stats-container");

  users.forEach(username => {
    fetchUserStats(username);
  });

  function fetchUserStats(username) {
    const url = "https://cute-cyan-scorpion-coat.cyclic.app/graphql-proxy"; // Replace with your server URL
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0"
    };

    const data = {
      "query": `
              query userProblemsSolved($username: String!) {
                  allQuestionsCount {
                      difficulty
                      count
                  }
                  matchedUser(username: $username) {
                      submitStatsGlobal {
                          acSubmissionNum {
                              difficulty
                              count
                          }
                      }
                  }
              }
          `,
      "variables": {
        "username": username
      }
    };

    fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(responseData => {
        displayUserStats(username, responseData);
      })
      .catch(error => console.error(`Error fetching data for ${username}: ${error}`));
  }

  function displayUserStats(username, data) {
    const statsRow = document.createElement("tr");

    const totalSolved = getTotalSolved(data);
    const easyCount = getCategoryCount(data, "Easy");
    const mediumCount = getCategoryCount(data, "Medium");
    const hardCount = getCategoryCount(data, "Hard");

    const output = `
          <td>${username}</td>
          <td>${totalSolved}</td>
          <td>${easyCount}</td>
          <td>${mediumCount}</td>
          <td>${hardCount}</td>
          <td>
              <canvas id="${username}-chart" width="150" height="150"></canvas>
          </td>
      `;

    statsRow.innerHTML = output;
    statsContainer.appendChild(statsRow);

    // Create and update the circular graph
    createCircularGraph(username, totalSolved, easyCount, mediumCount, hardCount);
  }

  function getTotalSolved(data) {
    return data.data.matchedUser.submitStatsGlobal.acSubmissionNum
      .find(item => item.difficulty === 'All').count;
  }

  function getCategoryCount(data, category) {
    return data.data.matchedUser.submitStatsGlobal.acSubmissionNum
      .find(item => item.difficulty === category).count;
  }

  function createCircularGraph(username, totalSolved, easyCount, mediumCount, hardCount) {
    const ctx = document.getElementById(`${username}-chart`).getContext('2d');

    // Adjust the height of the chart dynamically based on the window width
    const chartHeight = Math.min(window.innerWidth * 0.2, 200);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
          data: [easyCount, mediumCount, hardCount],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        }],
      },
      options: {
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
      },
    });
  }
});

// Refresh the charts when the window is resized
window.addEventListener('resize', function () {
  Chart.helpers.each(Chart.instances, function (instance) {
    instance.chart.update();
  });
});
