// Importa la libreria D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"


const datasetprova = await d3.csv("datasetprova.csv")

const height = 15300;
const marginLeft = 50;
const marginRight = 10;
const marginTop = 154;
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
.attr("display", "none")



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
    .style("top", d => (sScale(d["START"]) + marginTop*17.25) + "px")  // Regola il valore top
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
    .style("top", d => (sScale(d["START"]) + marginTop*17.25) + "px")  // Regola il valore top
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
//datasetprova.columns.slice(3).forEach((personaggio) => {
//const isPresent = datasetprova.map(d => d[personaggio] === "P");
//const lineData = datasetprova.map((d, i) => ({
//    isPresent: isPresent[i],
//    start: d["START"],
//    nextStart: i < datasetprova.length - 1 ? datasetprova[i + 1]["START"] : height
//}));

  
//svg.selectAll(".line" + personaggio)
//  .data(lineData.filter(d => d.isPresent))
//  .enter()
//  .append("line")
//  .attr("class", "line" + personaggio)
//  .attr("x1", xScale(personaggio) + xScale.bandwidth() / 2)
//  .attr("x2", xScale(personaggio) + xScale.bandwidth() / 2)
//  .attr("y1", d => sScale(d.start))
//  .attr("y2", d => Math.min(sScale(d.nextStart), yScale.range()[1]))
//  .attr("stroke", colorMap[personaggio])
//  .attr("stroke-width", 4)
//  .style("z-index", 1)
//});


// Array di valori di "START" per i tick desiderati
const tickValues = [7, 9, 15, 19, 41, 46, 66, 67, 75, 82, 88, 92, 97, 101, 106, 119];

// Filtra i dati solo per i tick desiderati
const tickData = datasetprova.filter(d => tickValues.includes(+d["START"]));

// Aggiungi le linee bianche sfumate solo nei tick desiderati
//svg.selectAll(".cloud")
//  .data(tickData)
//  .enter()
//  .append("line")
//  .attr("class", "line")
//  .attr("x1", marginLeft)
//  .attr("x2", width - marginRight)
//  .attr("y1", d => sScale(d["START"]))
//  .attr("y2", d => sScale(d["START"]))
//  .style("stroke", "grey")
//  .style("stroke-width", 3)



// Return del nodo SVG
document.body.appendChild(svg.node());

// Array di testi da visualizzare
var texts = ["Edward pesca il pesce gatto pi&#249; grande del mondo in un lago, usando come esca la sua fede nuziale, facendosela poi ridare dal pesce stritolandolo.",
            "",
            "Una notte Edward e i suoi amici si ritrovano fuori citt&#224; nei pressi della casa di una strega con un occhio di vetro, quando questi si ritrovano davanti la donna, guardano l&#8217;occhio e scoprono il modo in cui moriranno.",
            "",
            "Durante una messa, Edward scopre che i suoi muscoli e le sue ossa crescono troppo in fretta, cosa che lo porta a stare per 3 anni a letto legato a macchinari, potendo solo consultare l&#8217;enciclopedia come mezzo di informazione.",
            "Edward si reca nella caverna dove vive un gigante di nome Karl che minaccia la citt&#224; di Ashton, a quel punto dopo una discussione entrambi decidono di andarsene insieme, verso nuovi orizzonti.",
            "Dopo essersi divisi, Edward prende un sentiero cupo, arrivando nell'adorabile cittadina di Spectre: qui conosce Norther Winslow, un poeta, e Jenny, una bambina che si innamora di lui. Edward decide di non rimanere a Spectre, diventando il primo a farlo, per poi tornare in futuro, quando sar&#224; giusto farlo.",
            "Edward si smarrisce all&#8217;interno del bosco, ancor pi&#249; spaventoso di notte, trovandosi in un attimo tra le grinfie di alberi, che per&#242; lo rilasciano. Uscendo dalla foresta, Edward ritrova Karl, e insieme riprendono la strada.",
            "",
            "Edward e Karl arrivano al Callow Circus. Durante lo spettacolo, Edward vede una ragazza, della quale si innamora perdutamente a prima vista, ma non riesce a parlarci. Disperato, Edward chiede aiuto a Amos Calloway, il proprietario del circo, che si rivela amico di famiglia di questa ragazza. Amos dunque propone un lavoro non pagato ad Edward, dove la ricompensa &#232; un&#8217;informazione sulla ragazza una volta al mese. Una notte, Edward scopre che Amos &#232; un lupo mannaro: quando si sveglia il giorno dopo, Amos, riconoscente per non avergli fatto del male, gli rivela il nome della ragazza, Sandra.",
            "Edward arriva al college dove studia Sandra con i suoi fiori preferiti e si dichiara a lei, ma scopre che quest&#8217;ultima &#232; gi&#224; promessa a Don Price, concittadino di Edward. Don Price scopre le intenzioni di Edward e lo picchia, ma ci&#242; si ritorce contro di lui: Sandra, infatti, notando la violenza del fidanzato, lo lascia per stare con Edward.",
            "",
            "Edward scopre di dover partire per il servizio di leva militare obbligatoria.",
            "Edward si getta in una missione molto pericolosa per cercare di ridurre la sua permanenza nell&#8217;esercito e tornare a casa il prima possibile.",
            "Edward riesce a recuperare il materiale chiesto dall&#8217;esercito durante uno spettacolo di due gemelle siamesi, Jing e Ping, che per&#242; scoprono la missione. Edward spiega loro che &#232; l&#236; per volere dell&#8217;esercito e che vorrebbe solo tornare a casa; le gemelle si commuovono e addirittura partono con lui.",
            "Sandra apprende la morte di Edward, in quanto l&#8217;esercito lo ha dato per disperso. Dopo 4 mesi, per&#242;, Edward riesce a tornare da Sandra.",
            "",
            "Dopo l&#8217;esperienza dell&#8217;esercito, Edward inizia a lavorare come rappresentante di commercio.",
            "Edward rincontra Norther Winslow nel bel mezzo di una rapina organizzata da quest&#8217;ultimo. Dopo una chiacchierata, Norther decide di partire per Wall Street per cercare la fortuna.",
            "",
            "Una sera, tornando a casa, a causa di un temporale Edward finisce per caso a Spectre. Trovandola in fallimento, decide di comprarla per 50 mila dollari. Non chiedeva soldi ai cittadini: voleva solo che la citt&#224; non morisse. Qui Edward ritrova Jenny, ormai cresciuta e non pi&#249; bambina. Si offre di sistemare la sua casa senza nulla in cambio, ma lei rifiuta. Il protagonista decide di sistemarla lo stesso, creando un legame con Jenny.",
            "Jenny vorrebbe baciare Edward ma lui si rifiuta, dicendo che &#232; innamorato di sua moglie. Jenny d&#224; a Edward l&#8217;atto di vendita della casa.",
            "",
            "Edward &#232; in punto di morte e Sandra, il figlio Will e la nuora Josephine lo portano via dall'ospedale.",
            "Tutti i personaggi delle storie sono riuniti per celebrare l&#8217;ultimo saluto ad Edward.",
            "",
            "Edward si trasforma in un pesce gatto e nuota via lontano."];

// Scrollama
var scrolly = document.querySelector("#scrolly");
var article = scrolly.querySelector("article");
var step = article.querySelectorAll(".luogo-copia");

// initialize the scrollama
var scroller = scrollama();

var activeIndex = null;

function updateTextContent(index) {
  const textContainer = document.querySelector("#text-container");
  if (index < texts.length) {
      textContainer.innerHTML = texts[index];
  }
}


function handleStepEnter(response) {
  response.element.classList.add("is-active");

  const currentIndex = response.index;

  // Imposta l'opacità; degli elementi .luogo a 1 solo per l'elemento corrente
  updateLuogoOpacity(currentIndex, 1);

  updateHtmlBackgroundColor(currentIndex);

  // Aggiorna il contenuto del testo in base all'indice corrente
  updateTextContent(currentIndex);

  activeIndex = currentIndex;
}

function handleStepExit(response) {
    response.element.classList.remove("is-active");

    // Ripristina l'opacità; degli elementi .luogo a 0 quando si esce dallo step
    updateLuogoOpacity(activeIndex, 0);

    if (activeIndex === response.index) {
        activeIndex = null;
    }

    if (activeIndex === null) {
        if (response.index === step.length - 1 && response.direction === 'down') {
            document.documentElement.style.backgroundColor = "#1d1d1d";
        }
    }
}

function updateHtmlBackgroundColor(index) {
  const luogoElements = document.querySelectorAll(".luogo");
  if (index < luogoElements.length) {
      const currentLuogo = luogoElements[index];
      const backgroundColor = currentLuogo.classList.contains("reality") ? "#1d1d1d" : getComputedStyle(currentLuogo).backgroundColor;
      document.documentElement.style.backgroundColor = backgroundColor;
  }
}

// Funzione per impostare l'opacità; degli elementi .luogo
function updateLuogoOpacity(currentIndex, opacity) {
    const luogoElements = document.querySelectorAll(".luogo");
    luogoElements.forEach((element, index) => {
        element.style.opacity = (index === currentIndex) ? "1" : "0";
    });
}


function init() {
    scroller
        .setup({
            step: "#scrolly article .luogo-copia",
            debug: false,
            offset: 0.4
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit);
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
  .style("width", "60px")
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

  // Verifica se lo scorrimento è; compreso tra START = 0 e START = 119
  if (scrollY >= yScale(0)*17 && scrollY <= yScale(120)*1.16) {
    // Calcola la posizione desiderata dell'icona in base allo scorrimento
    const desiredTop = sScale.invert(scrollY) + marginTop;

    // Imposta la posizione dell'icona in base alla posizione calcolata
    edward.style("top", desiredTop + "px");

    // Mostra l'icona se è; nascosta
    if (edward.style("opacity") === "0") {
      edward.style("opacity", 1);
    }
  } else {
    // Nascondi l'icona se lo scorrimento è; al di fuori del range desiderato
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
  .style("width", "60px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftStrega*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(9)*2.92 && scrollY <= sScale(15)*2.21) ||
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
  .style("width", "60px")
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
  .style("width", "60px")
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
  .style("width", "60px")
  .style("top", marginTop + "px")
  .style("left", desiredLeftDonPrice*1.01 + "px")
  .style("z-index", 3)
  .style("transform", "translateX(-50%)")
  .style("opacity", 0) // Nascondi l'icona all'inizio
  .style("transition", "opacity 0.3s ease-in-out")


window.addEventListener("scroll", function () {

  const scrollY = window.scrollY;

  if ((scrollY >= sScale(9)*2.92 && scrollY <= sScale(15)*2.21) ||
      (scrollY >= sScale(19) && scrollY <= sScale(23)) ||
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
  .style("width", "60px")
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
  .style("width", "60px")
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
  .style("width", "60px")
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
  .style("width", "60px")
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
  .style("width", "60px")
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
  .style("width", "60px")
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