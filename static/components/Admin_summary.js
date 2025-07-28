export default {
  template: `
    <div class="row border">
      <div class="col-7">
        <h2>Welcome {{ userData.username }}</h2>
      </div>
      <div class="col-5 text-end">
        <router-link to="/Admin_Dashboard" class="btn btn-outline-primary me-2">Dashboard</router-link>
        <router-link to="/" class="btn btn-outline-danger">Logout</router-link>
      </div>
      <div class="border mt-4 p-3" style="height:700px; overflow-y:auto;">
        <div class="row">
          <div class="col-md-6 text-center">
            <h4 class="mb-3">Subject-wise Attempt Distribution</h4>
            <canvas ref="donutChart" width="400" height="300"></canvas>
          </div>
          <div class="col-md-6 text-center">
            <h4 class="mb-3">Top Performing Quizzes</h4>
            <canvas ref="barChart" width="400" height="300"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      userData: {},
      scores: []
    };
  },
  mounted() {
    fetch('/api/user', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token": localStorage.getItem("auth_token")
      }
    })
    .then(res => res.json())
    .then(data => {
      this.userData = data;
      this.fetchScores();
    });
  },
  methods: {
    fetchScores() {
      // Replace with admin-wide API endpoint for all scores, not per user
      fetch('/api/adminscoreview/get', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(res => res.json())
      .then(data => {
        this.scores = Array.isArray(data) ? data : [data];
        this.$nextTick(() => {
          this.renderDonutChart();
          this.renderBarChart();
        });
      });
    },
    renderDonutChart() {
      const subjectCounts = {};
      this.scores.forEach(entry => {
        const subject = entry.subject || "Unknown";
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
      const labels = Object.keys(subjectCounts);
      const values = Object.values(subjectCounts);
      const colors = labels.map((_, i) => `hsl(${i * 45}, 70%, 60%)`);
      new Chart(this.$refs.donutChart.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.label}: ${ctx.raw} attempts`
              }
            }
          }
        }
      });
    },
    renderBarChart() {
      const quizScoresMap = {};

      this.scores.forEach(entry => {
        const quiz = `Quiz ${entry.quiz_id}`;
        if (!quizScoresMap[quiz]) quizScoresMap[quiz] = [];
        quizScoresMap[quiz].push(entry.score);
      });

      const labels = Object.keys(quizScoresMap);
      const averages = labels.map(q => {
        const scores = quizScoresMap[q];
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return parseFloat(avg.toFixed(2));
      });

      new Chart(this.$refs.barChart.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Avg Score',
            data: averages,
            backgroundColor: 'rgba(255, 99, 132, 0.6)'
          }]
        },
        options: {
          indexAxis: 'x',
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Average Score' }
            },
            x: {
              title: { display: true, text: 'Quiz' }
            }
          }
        }
      });
    }
  }
};
