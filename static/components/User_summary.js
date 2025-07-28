export default {
  template: `
    <div class="row border">
      <div class="col-7">
        <h2>Welcome {{ userData.username }}</h2>
      </div>
      <div class="col-5" style="text-align:right;">
        <router-link to="/User_Dashboard" class="btn btn-outline-primary">Dashboard</router-link>
        <router-link to="/" class="btn btn-outline-danger">Logout</router-link>
      </div>
      <div class="border mt-4 p-3" style="height:700px; overflow-y:auto;">
        <div class="row">
          <div class="col-md-6 text-center">
            <h4 class="mb-3">Subject-wise Attempt Distribution</h4>
            <canvas ref="donutChart" width="400" height="300"></canvas>
          </div>
          <div class="col-md-6 text-center">
            <h4 class="mb-3">Quiz Performance Overview</h4>
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
  methods: {
    fetchScores() {
      const user_id = this.userData.id;
      fetch(`/api/scoreview/get/${user_id}`, {
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
      const subjectCount = {};
      this.scores.forEach(entry => {
        const subjectName = entry.subject || "Unknown Subject";
        subjectCount[subjectName] = (subjectCount[subjectName] || 0) + 1;
      });

      const labels = Object.keys(subjectCount);
      const values = Object.values(subjectCount);
      const colors = labels.map((_, i) => `hsl(${i * 50}, 65%, 60%)`);

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
      const labels = this.scores.map(entry => `Quiz ${entry.quiz_id}`);
      const values = this.scores.map(entry => entry.score);

      new Chart(this.$refs.barChart.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Score',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Score' }
            },
            x: {
              title: { display: true, text: 'Quiz' }
            }
          }
        }
      });
    }
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
  }
};