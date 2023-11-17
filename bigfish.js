// Importa la libreria D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const datasetprova = await d3.csv("datasetprova.csv")

const height = 15100;
const marginLeft = 200;
const marginRight = 50;
const marginTop = 150;
const marginBottom = 50;
const width = window.innerWidth - marginLeft;

// Creazione di un elemento SVG
const svg = d3.create("svg")
.attr("height", height)
.attr("width", width);

// Nuovo formato del minutaggio
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes;
    return `${formattedHours}:${formattedMinutes}`;
}

// Creazione di una scala lineare da 0 a 120
const yScale = d3.scaleLinear()
.range([marginTop, height - marginBottom])
.domain([0, 120])

// Creazione di una scala lineare basata sulla colonna "START" del dataset
const sScale = d3.scaleLinear()
.range([marginTop, height - marginBottom*58.55]) // Per far sì che rientri nella scala
.domain(d3.extent(datasetprova, d => d["START"]));

// Estrazione dei personaggi dalle colonne dalla 3 in poi
const personaggi = Object.keys(datasetprova[0]).slice(3)

// Creazione di una scala scaleBand basata sui personaggi
const xScale = d3.scaleBand()
.domain(personaggi)
.range([marginLeft, width - marginRight])
.padding(7)



// Seleziona tutti gli elementi "g" e associa loro i dati del dataset
const gruppi = svg.selectAll("g")
.data(datasetprova)
.join("g");

// Aggiungo l'asse y con yScale che mi indica solo la fine del film (120)
svg.append("g")
.attr("transform", "translate(" + marginLeft + " , 0)")
.call(d3.axisLeft(yScale)
.tickFormat(d => d === 120 ? "02:00" : d)
.tickValues([yScale.domain()[1]]))
.attr("class", "axis-label");

// Aggiungo l'asse a sinistra con sScale con i tick corrispondenti ai valori della scala (e quindi all'inizio della scena)
svg.append("g")
.attr("transform", "translate(" + marginLeft + " , 0)")
.call(d3.axisLeft(sScale)
.tickFormat(formatTime)
.tickValues(datasetprova.map(d => d["START"])))
.selectAll(".tick text")
.attr("class", "axis-label");

// Aggiungo l'asse x e aggiusto le etichette
svg.append("g")
.attr("transform", "translate(0, " + marginTop + ")")
.call(d3.axisBottom(xScale).tickSize(0))
.call((g) => g.select (".domain").remove())
.selectAll("text")
.attr("text-anchor", "start")
.attr("class", "axis-label")
.attr("dx", "10 em") // Regola la posizione orizzontale
.attr("dy", "0 em") // Regola la posizione verticale
.attr("transform", "rotate(-90)")
.text(d => d.replace(/_/g, ' ')) // Per togliere l'underscore



// Estrazione dei colori dalla colonna "COLOR" del dataset
const colors = datasetprova.map(d => d["COLOR"]);

// Calcolo delle altezze dei rettangoli in base alle differenze tra i tempi "START" consecutivi
const heightData = datasetprova.map((d, i, arr) => i < arr.length - 1 ? arr[i + 1]["START"] - d["START"] : 0);

// Aggiunta dei rettangoli
gruppi.append("rect")
.attr("height", (d, i) => {
return sScale(heightData[i]); // Calcolo dell'altezza dei rettangoli (unico modo per non avere errore nella parte dopo)
})
.attr("width", width - marginLeft - marginRight)
.attr("x", marginLeft)
.attr("y", d => sScale(d["START"]))
.attr("fill", (d, i) => colors[i]);



// Funzione per determinare se il colore dovrebbe essere chiaro o scuro
function isColorLight(color) {
const rgb = d3.color(color).rgb();
// Calcola la luminosità del colore
const brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 255;
return brightness > 0.5; // Se la luminosità è superiore a 0.5, il colore è considerato chiaro
}

// Aggiunta del testo al centro di ciascun rettangolo
gruppi.append("text")
.text((d, i) => d["PLACE"]) // Prende il valore dalla colonna PLACE
.attr("x", marginLeft + (width - marginLeft - marginRight) / 2)
.attr("y", (d, i) => sScale(d["START"]) + sScale(heightData[i])/2.5)
.attr("dy", "-0.7em")
.attr("text-anchor", "middle")
.attr("fill", d => isColorLight(d["COLOR"]) ? "black" : "white") // Esegue la funzione isColorLight riferendosi al valore HEX della colonna COLOR e determina se rendere il testo bianco o nero

// Mappatura dei colori per personaggio
const colorMap = {
    STREGA: "grey",
    AMOS_CALLOWAY: "purple",
    JENNY: "chartreuse",
    DON_PRICE: "cornflowerblue",
    SANDRA: "yellow",
    EDWARD: "red",
    KARL: "brown",
    NORTHER_WINSLOW: "darkgreen",
    JING_E_PING: "blue",
    WILL: "orangered",
    JOSEPHINE: "magenta"
};

// Aggiunta delle linee verticali per indicare la presenza di un personaggio
datasetprova.columns.slice(3).forEach((personaggio) => {
const isPresent = datasetprova.map(d => d[personaggio] === "P");
const lineData = datasetprova.map((d, i) => ({
    isPresent: isPresent[i],
    start: d["START"],
    nextStart: i < datasetprova.length - 1 ? datasetprova[i + 1]["START"] : height
}));

  
svg.selectAll("line" + personaggio)
    .data(lineData.filter(d => d.isPresent))
    .enter()
    .append("line")
    .attr("x1", xScale(personaggio) + xScale.bandwidth() / 2)
    .attr("x2", xScale(personaggio) + xScale.bandwidth() / 2)
    .attr("y1", d => sScale(d.start))
    .attr("y2", d => Math.min(sScale(d.nextStart), yScale.range()[1])) // Per farlo finire quando finisce l'asse y
    .attr("stroke", colorMap[personaggio])
    .attr("stroke-width", 12)

});

// Return del nodo SVG
document.body.appendChild(svg.node());