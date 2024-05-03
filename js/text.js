/*Ici, c'est la partie js*/

/*Cette fonction permet de charger le footer et le header dès que la page est prete */
$(document).ready(
  function() {
    $("#header").load("header.html");
    $("#footer").load("footer.html");
    get_data([loadDest, loadDest2,loadDesttest]);
  }
);





/*Ici, on a la classe destination qui permet de créer un objet destination avec ses attributs*/
class destination {
  constructor(id, nom, description, prix, images, animaux, europe) {
    this.id = id;
    this.nom = nom;
    this.description = description;
    this.prix = prix;
    this.images = images;
    this.animaux = animaux;
    this.europe = europe;
  }
}




/*On va avoir toute la partie JSON ici, qui va permettre de venir récupérer les données des destinations*/
var Dest = [];
var Dest_Json;

async function get_data(callBacks) {
  await fetch("../destinations.json").then(response => response.json()).then(data => Dest_Json = data);
  create_dest(Dest_Json);
    for (var callBack of callBacks){
    callBack();
    }
}

function create_dest(Dest_Json){
  for (var e of Dest_Json){
    var d = new destination(e.id, e.nom, e.description, e.prix, e.images, e.animaux, e.europe);
    Dest.push(d);
  }
}




/*Ici, on a la fonction qui permet de charger les destinations sur la page d'accueil*/
function loadDest() {
  if (window.location.href.endsWith("/index.html")) { // On vérifie si l'URL se termine par "/index.html" afin d'éviter des erreurs inutiles sur les autres pages
    let template = document.querySelector("#dest");
    for (const d of Dest ) {	
        // On parcourt le tableau Dest
      let clone = document.importNode(template.content, true);      
      newContent = clone.firstElementChild.innerHTML		// Puis on remplace id, nom et images par
        .replace(/{{ID}}/g, d.id)				
        .replace(/{{NOM}}/g, d.nom)				
        .replace(/{{IMAGES}}/g, d.images)		

      clone.firstElementChild.innerHTML = newContent;		
      const mainNode = document.getElementById("mainGrid");		// On récupère la balise 
      mainNode.appendChild(clone);				// On ajoute le clone créé
    }
  }
}





/*Ici, on a le calcul de la date d'aujourd'hui afin de griser les jours avant lors de la reservation*/
$(document).click(
  function () {
    var d = new Date();

    /*Le mois qu'on récupère avec getMonth commence à 0 donc on ajoute 1*/
    var intermDate = d.getMonth()+1

    /*Ensuite on récupère l'année puis le mois et le jour du mois en mettant des "-" entre chaque pour avoir la bonne écriture pris en charge par le calendrier*/
    var strDate = d.getFullYear() + "-" + ("0"+intermDate) + "-" + d.getDate();

    /*Ensuite on modifie l'attribut minimum de la date de départ avec cette date */
    $('#depart').attr('min', strDate);

    /*On fait la même chose pour la date de retour afin de ne pas partir avant la date choisi comme date de départ*/
    var debutDate = document.getElementById("depart").value;
    $('#retour').attr('min', debutDate);
  }
);




/*Ici, on a la fonction qui permet de charger les informations sur la page de reservation*/
function loadDest2() {
  if ((window.location.search.match(/id=\d+/))) { // Vérifie si l'URL contient "id" suivi d'un nombre
    var sejour_id = new URLSearchParams(window.location.search).get("id");

    /*Ici, on récupère l'id du voyage selectionné pour la page reservation afin d'afficher la bonne image et la bonne destination choisi*/
    $(document).ready(
      function () {
        document.getElementById("nomVoyage").innerText = Dest[sejour_id-1].nom;
        document.getElementById("descriptionVoyage").innerText = Dest[sejour_id-1].description;
      }
    );
  }
}




/*Ici, on a la fonction qui permet de calculer le prix total du voyage*/
function loadDesttest() {
var sejour_id = new URLSearchParams(window.location.search).get("id");
  $(document).change(
    function () {
      /*On récupère les dates de départ et de retour*/
      let departInput = document.getElementById("depart").value;
      let retourInput = document.getElementById("retour").value;
      let departDate = new Date(departInput);
      let retourDate = new Date(retourInput);

      /*On calcule la différence entre les deux dates en jours*/
      let diffDates = Math.ceil((retourDate.getTime() - departDate.getTime()) / (1000 * 3600 * 24)) ;

      /*On récupère la case déjeuner si elle est coché ou pas*/
      var nbdejeuner;
      if (document.getElementById("dejeuner").checked == true) {nbdejeuner=15;} 
      else {nbdejeuner=0;}

      /*On récupère le nombre d'adultes et d'enfants*/
      var intermadultes = document.getElementById("adultes").value;
      var nbadultes = intermadultes*Dest[sejour_id-1].prix;
      var intermenfants = document.getElementById("enfants").value;
      var nbenfants = intermenfants* (Dest[sejour_id-1].prix)*0.4;

      /*On calcule le prix total avec toutes ces informations*/
      var prix = (nbdejeuner*intermenfants + nbdejeuner*intermadultes + nbenfants + nbadultes)*diffDates;
      /*On affiche le prix total*/
      document.getElementById("prixTotal").innerText = prix;
    }
  );
  }



/*Ici, on a la fonction qui permet filtrer les destinations sur la page de confirmation en fonction de si oui ou non elles acceptent les animaux*/
function filtrerAnimaux() {
  const divs = document.getElementsByClassName("test");

  for (i in divs){
    /*On test si la valeur animaux est a true */
    if (Dest[i].animaux == false) {
      /*Si oui, on affiche la destination*/
      divs[i].style.display = "none";
    }
  };
}





/*Ici, on a la fonction qui permet réinitialiser les filtres*/
function reinitialiser() 
{
  divs = document.getElementsByClassName("test");

  /*On affiche toutes les destinations*/
  for(i in divs){
    divs[i].style.display = "block";
  }
}





/*Ici, on a la fonction qui permet filtrer les destinations sur la page de confirmation en fonction de si oui ou non elles sont en europe*/
function filtrerEurope() 
{
  divs = document.getElementsByClassName("test"); 

  for(i in divs){                                     
    /*On test si la valeur europe est a false */ 
    if(Dest[i].europe == false){
      /*Si oui, on affiche la destination*/
      divs[i].style.display = "none";
    }
  }
}



/*On a ici une fonction utile au moment du formulaire qui permet de venir sauvegarder en local storage les informations du voyage selectionné*/
function envoyerEtSauvegarder(){
  var list_trip = []

  /*On test si il y a déjà des informations sauvegardées dans le local storage*/
  if (localStorage.getItem("envoyer") != undefined) {
    list_trip = JSON.parse(localStorage.getItem("envoyer"));}

  /*On récupère les informations du voyage selectionné, le premier est un traitement de la veleur checked du déjeuner*/
  if (document.getElementById("dejeuner").checked == true) 
    {dejeunerCheck="oui";}
  else
    {dejeunerCheck="non";}

  /*On crée un objet qui contient toutes les informations du voyage selectionné*/
  var intermEnvoyer = {
    nomVoyage : document.getElementById("nomVoyage").innerText,
    depart: document.getElementById("depart").value, 
    retour: document.getElementById("retour").value, 
    adultes: document.getElementById("adultes").value, 
    enfants: document.getElementById("enfants").value, 
    dejeuner: dejeunerCheck, 
    prixTotal: document.getElementById("prixTotal").innerText};

  /*On ajoute l'objet dans le tableau*/
  items=JSON.parse(localStorage.getItem("envoyer"));
  list_trip.push(intermEnvoyer);
  /*On sauvegarde le tableau dans le local storage*/
  localStorage.setItem("envoyer", JSON.stringify(list_trip));
}





  /*Ici, on a la fonction qui permet de venir afficher les informations du voyage selectionné dans le panier*/
  /*On récupère les information du local storage*/
  var list_trip = JSON.parse(localStorage.getItem("envoyer"));
  var test=0;
  /*On test si il y a des informations dans le local storage*/
  if (list_trip != null && list_trip.length > 0) {
    var tbody = document.querySelector("tbody");
    /*On parcourt le tableau pour afficher les informations*/
    for (var i = 0; i < list_trip.length; i++) {
      var trip = list_trip[i];

      /*On crée les éléments html pour afficher les informations*/
      var tr = document.createElement("tr");

      /*Ici on insère le nom du voyage*/
      var tdNom = document.createElement("td");
      tdNom.innerText = trip.nomVoyage;
      tr.appendChild(tdNom);

      /*Ici on insère la date de départ*/
      var tdDepart = document.createElement("td");
      tdDepart.innerText = trip.depart;
      tr.appendChild(tdDepart);

      /*Ici on insère la date de retour*/
      var tdRetour = document.createElement("td");
      tdRetour.innerText = trip.retour;
      tr.appendChild(tdRetour);

      /*Ici on insère le nombre d'adultes*/
      var tdAdultes = document.createElement("td");
      tdAdultes.innerText = trip.adultes;
      tr.appendChild(tdAdultes);

      /*Ici on insère le nombre d'enfants*/
      var tdEnfants = document.createElement("td");
      tdEnfants.innerText = trip.enfants;
      tr.appendChild(tdEnfants);

      /*Ici on insère le déjeuner*/
      var tdDejeuner = document.createElement("td");
      tdDejeuner.innerText = trip.dejeuner;
      tr.appendChild(tdDejeuner);

      /*Ici on insère le prix total*/
      var tdPrixTotal = document.createElement("td");
      tdPrixTotal.innerText = trip.prixTotal;
      tr.appendChild(tdPrixTotal);

      /*Ici on insère le bouton pour supprimer le voyage*/
      var suppr = document.createElement("td");
      suppr.innerHTML = '<button onclick="supprOnly()" id="buttonBasket2" name="test2">OUI !</button>';
      tr.appendChild(suppr);
      tbody.appendChild(tr);

      /*Calcl du prix total d panier*/
      test = test + parseInt(trip.prixTotal);
      document.getElementById("prixtotaldupanier").innerText = test +" €";
    }
  }





/*Ici, on a la fonction qui permet de venir supprimer tout les voyages selectionnés dans le panier*/
function supprimer(){
  JSON.parse(window.localStorage.getItem('envoyer'));

  localStorage.removeItem('envoyer');
  window.location.href = "basket.html";
}





/*Ici, on a la fonction qui permet de venir supprimer le voyage selectionné dans le panier (le bouton dans la dernière colonne du tableau)*/
supprOnly = function() {
  var items = JSON.parse(localStorage.getItem("envoyer"));
  items.splice(0, 1);
  localStorage.setItem("envoyer", JSON.stringify(items));
  window.location.href = "basket.html";
}


/*Ici, on a la fonction permettant de récupérer l'API pour générer la mmétéo de chaque destination */
function displayTemperatures() {
  const citiesContainer = document.getElementById('cities-container');
  const cityTemplate = document.getElementById('city-template');
  const apiKey = 'f917b4c5b9446725a6d5ca6643989fd1';
  const cities = {
    'Athènes': 'athens',
    'Madrid': 'madrid',
    'Ajaccio': 'ajaccio',
    'Fort-de-france': 'fort-de-france',
    'Papeete': 'papeete',
    'Yaoundé': 'yaounde'
  };

  for (const [city, cityKey] of Object.entries(cities)) {
    const cityElement = cityTemplate.content.cloneNode(true);
    const cityNameElement = cityElement.querySelector('.city-name');
    const cityTemperatureElement = cityElement.querySelector('.city-temperature');
    cityNameElement.innerText = city;
    citiesContainer.appendChild(cityElement);
    getTemperature(cityKey, apiKey)
      .then(temperature => {
        cityTemperatureElement.innerText = `${temperature}°C`;
      })
      .catch(error => {
        cityTemperatureElement.innerText = 'Erreur';
        console.error(error);
      });
  }
}

async function getTemperature(cityKey, apiKey) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityKey}&units=metric&appid=${apiKey}`);
  const data = await response.json();
  const temperature = data.main.temp;
  return temperature;
}
