// Importa la libreria D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const datasetprova = await d3.csv("datasetprova.csv")

const height = 10000;
const marginLeft = 50;
const marginTop = 50;
const marginBottom = 50;
const width = window.innerWidth - marginLeft;

// Creazione di un elemento SVG
const svg = d3.create("svg")
    .attr("height", height)
    .attr("width", width);

// Creazione di una scala lineare da 0 a 120
const yScale = d3.scaleLinear()
.range([marginTop, height - marginBottom])
.domain([0, 120])

// Creazione di una scala lineare basata sulla colonna "START" del dataset
const sScale = d3.scaleLinear()
.range([marginTop, height - marginBottom*38.4]) // Per far sì che rientri nella scala
.domain(d3.extent(datasetprova, d => d["START"]));



// Seleziona tutti gli elementi "g" e associa loro i dati del dataset
const gruppi = svg.selectAll("g")
.data(datasetprova)
.join("g");

// Aggiungo l'asse y con yScale che mi indica solo la fine del film (120)
svg.append("g")
.attr("transform", "translate(" + marginLeft + " , 0)")
.call(d3.axisLeft(yScale)
.tickValues([yScale.domain()[1]]));

// Aggiungo l'asse a sinistra con sScale con i tick corrispondenti ai valori della scala (e quindi all'inizio della scena)
svg.append("g")
.attr("transform", "translate(" + marginLeft + " , 0)")
.call(d3.axisLeft(sScale)
.tickValues(datasetprova.map(d => d["START"])));



// Estrazione dei colori dalla colonna "COLOR" del dataset
const colors = datasetprova.map(d => d["COLOR"]);

// Calcolo delle altezze dei rettangoli in base alle differenze tra i tempi "START" consecutivi
const heightData = datasetprova.map((d, i, arr) => i < arr.length - 1 ? arr[i + 1]["START"] - d["START"] : 0);

// Aggiunta dei rettangoli
gruppi.append("rect")
.attr("height", (d, i) => {
return sScale(heightData[i]); // Calcolo dell'altezza dei rettangoli (unico modo per non avere errore nella parte dopo)
})
.attr("width", width - marginLeft)
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

// Aggiungta del testo al centro di ciascun rettangolo
gruppi.append("text")
.text((d, i) => d["PLACE"]) // Prende il valore dalla colonna PLACE
.attr("x", marginLeft + (width - marginLeft) / 2)
.attr("y", (d, i) => sScale(d["START"]) + sScale(heightData[i])/2)
.attr("dy", "-0.7em")
.attr("text-anchor", "middle")
.attr("fill", d => isColorLight(d["COLOR"]) ? "black" : "white") // Esegue la funzione isColorLight riferendosi al valore HEX della colonna COLOR e determina se rendere il testo bianco o nero

// Restituisci il nodo SVG
document.body.appendChild(svg.node());