import jsonData from "../presenze-e-votazioni.json" assert { type: "json" };

const app = Vue.createApp({
	data() {
		return {
			sedDay: window.location.href.split('?')[1].split('=')[1],
			pres: 0,
			abs: 0,
			participants: [],
			partProps: {},
			groups: [],
			groupsParticipants: {},
			graphToShow: "presenze"
		}
	},
	mounted:function(){
		this.loadData()
	},
	methods: {
		loadData(){
			jsonData.forEach((c) => {
				if(c.data_seduta == this.sedDay){
					if(!this.groups.includes(c.gruppo_politico)){
						this.groups.push(c.gruppo_politico)
					}
					let currGroup = {pres: 0, abs: 0, votes: 0}
					if(c.gruppo_politico in this.groupsParticipants){
						currGroup = this.groupsParticipants[c.gruppo_politico]
					}
					currGroup.votes = currGroup.votes + c.num_votazioni
					if(c.presenza == "P"){
						this.pres++
						currGroup.pres++
					} else {
						this.abs++
						currGroup.abs++
					}
					this.groupsParticipants[c.gruppo_politico] = currGroup

					if(!this.participants.includes(c.nominativo)){
						this.participants.push(c.nominativo)
						const props = {
							numVot: 0,
							percVot: 0
						}
						if(c.presenza == "P"){
							props.presence = true
						} else {
							props.presence = false
						}
						props.group = c.gruppo_politico
						if(c.num_votazioni != null){
							props.numVot = c.num_votazioni
						}
						if(c.percentuale_presenza_alle_votazioni != null){
							props.percVot = c.percentuale_presenza_alle_votazioni
						}
						this.partProps[c.nominativo] = props
					}
				}
			})
			this.participants.sort()
			this.groups.sort()

			const chartColors = []
			const groupVotes = []
			this.groups.forEach(g => {
				groupVotes.push(this.groupsParticipants[g].votes)
				
				let red = Math.floor(Math.random() * 256);
				let green = Math.floor(Math.random() * 256);
				let blue = Math.floor(Math.random() * 256);
				chartColors.push(`rgb(${red}, ${green}, ${blue})`);
			})

			const votesChart = new Chart("votazioni-chart", {
				type: "pie",
				data: {
					labels: this.groups,
					datasets: [{
						data: groupVotes,
						backgroundColor: chartColors
					}]
				},
				options: {
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: true,
							position: 'bottom'
						}
					}
    			}
			});
		},
		changeChart(id){
			this.graphToShow = id
		}
	}
})

app.component('presence-div', {
	template: `<div class="presence-div"></div>`
})

app.component('absence-div', {
	template: `<div class="absence-div"></div>`
})

app.component('vote-div', {
	template: `<div class="vote-div"></div>`
})

app.mount('#app')