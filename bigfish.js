// Importa la libreria D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const datasetprova = await d3.csv("datasetprova.csv")

const height = 15300;
const marginLeft = 50;
const marginRight = 10;
const marginTop = 150;
const marginBottom = 50;
const marginBottomExtended = 200; // Per aumentare lo scroll in fondo
const width = window.innerWidth - marginLeft;

// Creazione di un elemento SVG
const svg = d3.create("svg")
.attr("height", height + marginBottomExtended)
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
.range([marginTop, height - marginBottom - marginBottomExtended])
.domain([0, 120])

// Creazione di una scala lineare basata sulla colonna "START" del dataset
const sScale = d3.scaleLinear()
.range([marginTop, height - marginBottom*58.55 - marginBottomExtended]) // Per far sì che rientri nella scala
.domain(d3.extent(datasetprova, d => d["START"]));

// Estrazione dei personaggi dalle colonne dalla 3 in poi
const personaggi = Object.keys(datasetprova[0]).slice(3)

// Creazione di una scala scaleBand basata sui personaggi
const xScale = d3.scaleBand()
.domain(personaggi)
.range([marginLeft, width - marginRight])
.padding(12)



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
.call((g) => g.select (".domain").remove())
.attr("class", "numbers");

// Aggiungo l'asse a sinistra con sScale con i tick corrispondenti ai valori della scala (e quindi all'inizio della scena)
svg.append("g")
.attr("transform", "translate(" + marginLeft + " , 0)")
.call(d3.axisLeft(sScale)
.tickFormat(formatTime)
.tickValues(datasetprova.map(d => d["START"])))
.attr("class", "numbers")
.call((g) => g.select (".domain").remove());

// Aggiungo l'asse x e aggiusto le etichette
svg.append("g")
.attr("transform", "translate(0, " + marginTop + ")")
.call(d3.axisBottom(xScale).tickSize(0))
.call((g) => g.select (".domain").remove())
.selectAll("text")
.attr("text-anchor", "start")
.attr("class", "axis-label")
.attr("dx", "10") // Regola la posizione orizzontale
.attr("dy", "0") // Regola la posizione verticale
.attr("transform", "rotate(-45), translate(10,-50)")
.text(d => d.replace(/_/g, ' ')) // Per togliere l'underscore



// Estrazione dei colori dalla colonna "COLOR" del dataset
const colors = datasetprova.map(d => d["COLOR"]);

// Calcolo delle differenze tra i tempi di START consecutivi
const heightData = datasetprova.map((d, i, arr) => i < arr.length - 1 ? (arr[i + 1]["START"] - d["START"]) : 0);

// Selezione di tutti i div "luogo" dell'HTML
d3.select("body")
    .selectAll("div.luogo")
    .data(datasetprova)
    .join("div")
    .attr("class", "luogo")
    .style("height", (d, i, nodes) => i < nodes.length - 1 ? (sScale(heightData[i]) - 150) + "px" : sScale(heightData[i]) + "px")
    .style("width", (width - marginLeft - marginRight) + "px")
    .style("position", "absolute")
    .style("top", d => (sScale(d["START"]) + marginTop*2.03) + "px")  // Regola il valore top
    .style("left", marginLeft + "px")
    .style("background-color", (d, i) => colors[i]);

// Selezione di tutti i div "luogo-copia" dell'HTML (immagini)
d3.select("body")
    .selectAll("div.luogo-copia")
    .data(datasetprova)
    .join("div")
    .attr("class", "luogo-copia")
    .style("height", (d, i, nodes) => i < nodes.length - 1 ? (sScale(heightData[i]) - 150) + "px" : sScale(heightData[i]) + "px")
    .style("width", (width - marginLeft - marginRight) + "px")
    .style("position", "absolute")
    .style("top", d => (sScale(d["START"]) + marginTop*2.03) + "px")  // Regola il valore top
    .style("left", marginLeft + "px")
    .style("background-color", "none");


    

// Mappatura dei colori per personaggio
const colorMap = {
    STREGA: "#B792F8",
    AMOS_CALLOWAY: "#939393",
    JENNY: "#D77600",
    DON_PRICE: "#b3001a",
    SANDRA: "#F8E436",
    EDWARD: "#406C25",
    KARL: "#4F3E27",
    NORTHER_WINSLOW: "#e1bc77",
    JING_E_PING: "#9b223b",
    WILL: "#171c61",
    JOSEPHINE: "#e1c2c1"
};

// Aggiunta delle linee verticali per indicare la presenza di un personaggio
datasetprova.columns.slice(3).forEach((personaggio) => {
const isPresent = datasetprova.map(d => d[personaggio] === "P");
const lineData = datasetprova.map((d, i) => ({
    isPresent: isPresent[i],
    start: d["START"],
    nextStart: i < datasetprova.length - 1 ? datasetprova[i + 1]["START"] : height
}));

  
svg.selectAll(".line" + personaggio)
  .data(lineData.filter(d => d.isPresent))
  .enter()
  .append("line")
  .attr("class", "line" + personaggio)
  .attr("x1", xScale(personaggio) + xScale.bandwidth() / 2)
  .attr("x2", xScale(personaggio) + xScale.bandwidth() / 2)
  .attr("y1", d => sScale(d.start))
  .attr("y2", d => Math.min(sScale(d.nextStart), yScale.range()[1]))
  .attr("stroke", colorMap[personaggio])
  .attr("stroke-width", 4)
  .style("z-index", 1)
});

// Return del nodo SVG
document.body.appendChild(svg.node());


// Scrollama
var scrolly = document.querySelector("#scrolly");
var article = scrolly.querySelector("article");
var step = article.querySelectorAll(".luogo-copia");

// initialize the scrollama
var scroller = scrollama();

var activeElements = [];

function handleStepEnter(response) {
    response.element.classList.add("is-active");
    updateHtmlBackgroundColor(response.index);
    activeElements.push(response.element);
}

function handleStepExit(response) {
    response.element.classList.remove("is-active");
    const index = activeElements.indexOf(response.element);
    if (index > -1) {
        activeElements.splice(index, 1);
    }
    // Se non ci sono più elementi attivi, imposta lo sfondo su #1d1d1d
    if (activeElements.length === 0) {
        document.documentElement.style.backgroundColor = "#1d1d1d";
      // Se non ci sono più elementi attivi
    if (activeElements.length === 0) {
      // Se si esce dall'ultimo step verso il basso, imposta lo sfondo su #1d1d1d
      if (response.index === step.length - 1 && response.direction === 'down') {
          document.documentElement.style.backgroundColor = "#1d1d1d";
      }}
    }
}

// Funzione per aggiornare il colore di sfondo dell'elemento HTML
function updateHtmlBackgroundColor(index) {
  const luogoElements = document.querySelectorAll(".luogo");
   if (index < luogoElements.length) {
       const backgroundColor = getComputedStyle(luogoElements[index]).backgroundColor;
       document.documentElement.style.backgroundColor = backgroundColor;
    }
}

function init() {
  scroller
      .setup({
          step: "#scrolly article .luogo-copia", // Mantieni questo invariato
          debug: false,
          offset: 0.4
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit)
}

// kick things off
init();





// SEZIONE ICONE

// EDWARD
const edward = d3.select("body")
  .append("img")
  .attr("id", "edward")
  .attr("src", "icons/edward.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", "50.8%")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")

// Aggiungi un gestore di eventi di scorrimento alla finestra
window.addEventListener("scroll", function () {
  // Ottieni il valore corrente di pageYOffset (scorrimento verticale)
  const scrollY = window.scrollY;

  // Verifica se lo scorrimento è compreso tra START = 0 e START = 119
  if (scrollY >= yScale(0)*2 && scrollY <= yScale(120)) {
    // Calcola la posizione desiderata dell'icona in base allo scorrimento
    const desiredTop = sScale.invert(scrollY) + marginTop;

    // Imposta la posizione dell'icona in base alla posizione calcolata
    edward.style("top", desiredTop + "px");

    // Mostra l'icona se è nascosta
    if (edward.style("opacity") === "0") {
      edward.style("opacity", 1);
    }
  } else {
    // Nascondi l'icona se lo scorrimento è al di fuori del range desiderato
    edward.style("opacity", 0);
  }
});


// STREGA
const desiredLeftStrega = xScale("STREGA") + xScale.bandwidth() / 2;
const strega = d3.select("body")
  .append("img")
  .attr("id", "strega")
  .attr("src", "icons/strega.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftStrega*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(9)*1.1 && scrollY <= sScale(15)*1.05) ||
      (scrollY >= sScale(102)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    strega.style("top", desiredTop + "px");
    
    if (strega.style("opacity") === "0") {
      strega.style("opacity", 1);
    }
  } else {
    strega.style("opacity", 0);
  }
});

// SANDRA
const desiredLeftSandra = xScale("SANDRA") + xScale.bandwidth() / 2;
const sandra = d3.select("body")
  .append("img")
  .attr("id", "sandra")
  .attr("src", "icons/sandra.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftSandra*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(46)*1.01 && scrollY <= sScale(66)*1.01) ||
      (scrollY >= sScale(67)*1.005 && scrollY <= sScale(68)*1.005) ||
      (scrollY >= sScale(73)*1.005 && scrollY <= sScale(75)*1.003) ||
      (scrollY >= sScale(101)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    sandra.style("top", desiredTop + "px");
    
    if (sandra.style("opacity") === "0") {
      sandra.style("opacity", 1);
    }
  } else {
    sandra.style("opacity", 0);
  }
});


// JENNY
const desiredLeftJenny = xScale("JENNY") + xScale.bandwidth() / 2;
const jenny = d3.select("body")
  .append("img")
  .attr("id", "jenny")
  .attr("src", "icons/jenny.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftJenny*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(28)*1.03 && scrollY <= sScale(40)*1.02) ||
      (scrollY >= sScale(96)*1.003 && scrollY <= sScale(97)*1.003) ||
      (scrollY >= sScale(102)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    jenny.style("top", desiredTop + "px");
    
    if (jenny.style("opacity") === "0") {
      jenny.style("opacity", 1);
    }
  } else {
    jenny.style("opacity", 0);
  }
});

// DON PRICE
const desiredLeftDonPrice = xScale("DON_PRICE") + xScale.bandwidth() / 2;
const donprice = d3.select("body")
  .append("img")
  .attr("id", "donprice")
  .attr("src", "icons/donprice.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftDonPrice*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(9)*1.1 && scrollY <= sScale(15)*1.05) ||
      (scrollY >= sScale(19)*1.03 && scrollY <= sScale(23)*1.03) ||
      (scrollY >= sScale(60)*1.01 && scrollY <= sScale(66)*1.01) ||
      (scrollY >= sScale(102)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    donprice.style("top", desiredTop + "px");
    
    if (donprice.style("opacity") === "0") {
      donprice.style("opacity", 1);
    }
  } else {
    donprice.style("opacity", 0);
  }
});


// JING E PING
const desiredLeftJingEPing = xScale("JING_E_PING") + xScale.bandwidth() / 2;

const jingeping = d3.select("body")
  .append("img")
  .attr("id", "jingeping")
  .attr("src", "icons/jingeping.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftJingEPing*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(69)*1.008 && scrollY <= sScale(73)*1.005) ||
      (scrollY >= sScale(102)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    jingeping.style("top", desiredTop + "px");
    
    if (jingeping.style("opacity") === "0") {
      jingeping.style("opacity", 1);
    }
  } else {
    jingeping.style("opacity", 0);
  }
});

// NORTHER WINSLOW
const desiredLeftNortherWinslow = xScale("NORTHER_WINSLOW") + xScale.bandwidth() / 2;

const northerwinslow = d3.select("body")
  .append("img")
  .attr("id", "northerwinslow")
  .attr("src", "icons/northerwinslow.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftNortherWinslow*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(28)*1.03 && scrollY <= sScale(40)*1.02) ||
      (scrollY >= sScale(84)*1.005 && scrollY <= sScale(88)*1.003) ||
      (scrollY >= sScale(102)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    northerwinslow.style("top", desiredTop + "px");
    
    if (northerwinslow.style("opacity") === "0") {
      northerwinslow.style("opacity", 1);
    }
  } else {
    northerwinslow.style("opacity", 0);
  }
});

// KARL
const desiredLeftKarl = xScale("KARL") + xScale.bandwidth() / 2;

const karl = d3.select("body")
  .append("img")
  .attr("id", "karl")
  .attr("src", "icons/karl.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftKarl*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(23)*1.03 && scrollY <= sScale(28)*1.03) ||
      (scrollY >= sScale(46)*1.01 && scrollY <= sScale(60)*1.01) ||
      (scrollY >= sScale(96)*1.003 && scrollY <= sScale(97)*1.003) ||
      (scrollY >= sScale(102)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    karl.style("top", desiredTop + "px");
    
    if (karl.style("opacity") === "0") {
      karl.style("opacity", 1);
    }
  } else {
    karl.style("opacity", 0);
  }
});

// AMOS CALLOWAY
const desiredLeftAmosCalloway = xScale("AMOS_CALLOWAY") + xScale.bandwidth() / 2;

const amoscalloway = d3.select("body")
  .append("img")
  .attr("id", "amoscalloway")
  .attr("src", "icons/amoscalloway.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftAmosCalloway*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(46)*1.01 && scrollY <= sScale(60)*1.01) ||
      (scrollY >= sScale(102)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    amoscalloway.style("top", desiredTop + "px");
    
    if (amoscalloway.style("opacity") === "0") {
      amoscalloway.style("opacity", 1);
    }
  } else {
    amoscalloway.style("opacity", 0);
  }
});

// JOSEPHINE
const desiredLeftJosephine = xScale("JOSEPHINE") + xScale.bandwidth() / 2;

const josephine = d3.select("body")
  .append("img")
  .attr("id", "josephine")
  .attr("src", "icons/josephine.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftJosephine*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(101)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    josephine.style("top", desiredTop + "px");
    
    if (josephine.style("opacity") === "0") {
      josephine.style("opacity", 1);
    }
  } else {
    josephine.style("opacity", 0);
  }
});

// WILL
const desiredLeftWill = xScale("WILL") + xScale.bandwidth() / 2;

const will = d3.select("body")
  .append("img")
  .attr("id", "will")
  .attr("src", "icons/will.png")
  .style("position", "fixed")
  .style("width", "50px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftWill*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(101)*1.001 && scrollY <= sScale(106)*1.001)) {
    
    const desiredTop = sScale.invert(scrollY) + marginTop;
   
    will.style("top", desiredTop + "px");
    
    if (will.style("opacity") === "0") {
      will.style("opacity", 1);
    }
  } else {
    will.style("opacity", 0);
  }
});

// Contenitore delle icone in cima
const iconcontainer = d3.select(".icontop-container")
window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if (scrollY < yScale(0)*2) {
    
    if (iconcontainer.style("opacity") === "0") {
      iconcontainer.style("opacity", 1);
    }
  } else {
    iconcontainer.style("opacity", 0);
  }
});