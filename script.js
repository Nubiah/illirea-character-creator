// Todo
// Système de sauvegarde
// Prise en compte des stats de la voie du peuple -> Reste à faire en sorte de le sommer dans les caractéristiques / Il manque également le R5
// Prise en compte des stats des voies martiales
// Voie de prestige ?
// Voie des mages !

// MAJ des informations du personnage
document.getElementById('pseudo').addEventListener('input', function() {
    CharacterData.pseudo = this.value;
    document.getElementById('pseudoChar').innerHTML = `
        <p>Pseudo : ${CharacterData.pseudo}</p>
    `;
});

document.getElementById('lvl').addEventListener('input', function() {
    CharacterData.level = parseInt(this.value);
    document.getElementById('lvlChar').innerHTML = `
        <p>Niveau : ${CharacterData.level}</p>
    `;
});

document.getElementById('race').addEventListener('change', function() {
    CharacterData.voiePeuple.id = this.value;
    document.getElementById('raceChar').innerHTML = `
        <p>Voie du peuple : ${CharacterData.voiePeuple.id}</p>
    `;
});

//Character
let CharacterData = {
    pseudo: "",
    maxHP: 0,
    maxMP: 0,
    CP: 0,
    SP: 0,
    level: 1,
    voiePeuple: {id :"", rang:"1"},
    profil: null,
    stats: {
        FORCE: {id: "FOR", value: 0},
        DEXTERITE: {id: "DEX", value: 0},
        CONSTITUTION: {id: "CON", value: 0},
        INTELLIGENCE: {id: "INT", value: 0},
        VOLONTE: {id: "VOL", value: 0},
        CHARISME: {id: "CHA", value: 0}
    },
    skills: {},
    voies: {
        voie1: {nom: "", type: "", rang: 1},
        voie2: {nom: "", type: "", rang: 1},
        voie3: {nom: "", type: "", rang: 0},
        voie4: {nom: "", type: "", rang: 0},
        voieP: {nom: "", type: "", rang: 0}
    }
};

// Calcul maxHP & maxMP

function calculHP() {
    const HPTypes = {
        "Puissance" : 5,
        "Finesse" : 4,
        "Magie" : 3
    };
    const CharacterVoies = Object.values(CharacterData.voies);
    const CharacterV12 = [CharacterVoies[0], CharacterVoies[1]];
    const CharacterV34 = [CharacterVoies[2], CharacterVoies[3]];
    const HPCon = parseInt(CharacterData.level) * parseInt(CharacterData.stats.CONSTITUTION.value);

    let gainLVL = 0;
    
    //Cas des deux voies initiales
    CharacterV12.forEach(v =>{
        if (v.rang == 1) {
            gainLVL += HPTypes[v.type];
        } else if (v.rang < 3) {
            gainLVL += HPTypes[v.type] * 1.5;
        } else if (v.rang >= 3) {
            gainLVL += (v.rang-2) * HPTypes[v.type] + HPTypes[v.type] * 1.5;
        }
    });

    //Cas des voies 3 et 4
    CharacterV34.forEach(v => {
        if (v.rang == 0) {
            gainLVL += 0;
        } else if (v.rang < 3){
            gainLVL += HPTypes[v.type] *v.rang * 0.5;
        } else {
            gainLVL += (v.rang-2) * HPTypes[v.type] + HPTypes[v.type];
        }
    });

    CharacterData.maxHP = Math.round(gainLVL + HPCon);

    document.getElementById("HP").innerHTML = `
        <p> HP max : ${CharacterData.maxHP}</p>
    `;
}

function calculMP() {
    const CharacterVoies = Object.values(CharacterData.voies);
    const voieMagie = CharacterVoies.filter((v) => v.type === "Magie");
    let MP = 0;
    voieMagie.forEach(voie => {
        MP += voie.rang;
    })
    
    CharacterData.maxMP = CharacterData.stats.VOLONTE.value + MP;

    document.getElementById("MP").innerHTML = `
        <p>MP max : ${CharacterData.maxMP}</p>
    `;
}

// Calcul des points de capacité, et du dé évolutif------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function calculCP() {
    const niveau = parseInt(document.getElementById("lvl").value) || 1;

    if (calculInputCP() > niveau * 2) {
        document.getElementById("resultCP").innerHTML = `
            <p style="color: red;"><strong>Points de capacité (voies) : ${calculInputCP()} / ${niveau * 2}</strong></p>
        `;
    } else {
        document.getElementById("resultCP").innerHTML = `
            <p>Points de capacité (voies) : ${calculInputCP()} / ${niveau * 2}</p>
        `;
    }
}

function calculInputCP() {
    let totalCP = 0;
    const CharacterVoies = Object.values(CharacterData.voies);
    const CharacterPeuple = CharacterData.voiePeuple.rang;

    //Calcul des voies martiales
    CharacterVoies.forEach(v => {
        if (v.rang < 3){
            totalCP += v.rang;
        } else {
            totalCP += 2 + (v.rang-2)*2; 
        }
    });
    
    //Calcul de la voie du peuple
    if (CharacterPeuple == 1){
        totalCP += 0;
    } else if (CharacterPeuple < 3){
        totalCP += 1;
    } else {
        totalCP += 1 + (CharacterPeuple-2)*2
    }

    return totalCP;
}

function calculDice() {
    const niveau = parseInt(document.getElementById("lvl").value) || 1;
    if (niveau >= 15) {
        document.getElementById("dice").innerHTML = `
            <p>Dé évolutif : D12</p>
        `;
    } else if (niveau >= 12) {
        document.getElementById("dice").innerHTML = `
            <p>Dé évolutif : D10</p>
        `;
    } else if (niveau >= 9) {
        document.getElementById("dice").innerHTML = `
            <p>Dé évolutif : D8</p>
        `;
    } else if (niveau >= 6) {
        document.getElementById("dice").innerHTML = `
            <p>Dé évolutif : D6</p>
        `;
    } else {
        document.getElementById("dice").innerHTML = `
            <p>Dé évolutif : D4</p>
        `;
    }
}

// Gestion des voies du peuple------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const races = [
    {peuple: "Humain", id: "humain", statsChoice: "Autre", statsMalus: "", R5Stats:"Autre"},
    {peuple: "Elfe", id: "elfe", statsChoice: "DEX, CHA", statsMalus:"FOR", R5Stats:"DEX, CHA"},
    {peuple: "Nain", id: "nain", statsChoice: "CON, FOR", statsMalus:"DEX", R5Stats:"CON, FOR"},
    {peuple: "Gnome", id: "gnome", statsChoice: "INT, DEX", statsMalus:"FOR", R5Stats:"CON, CHA"},
    {peuple: "Halfelin", id: "halfelin", statsChoice: "DEX, CON", statsMalus:"FOR", R5Stats:"DEX, CON"},
    {peuple: "Reptilien", id: "reptilien", statsChoice: "FOR, INT", statsMalus:"CHA", R5Stats:"FOR, INT"}, 
    {peuple: "Orc", id: "orc", statsChoice: "FOR", statsMalus:"", R5Stats:""},
    {peuple: "Gobelin", id: "gobelin", statsChoice: "INT", statsMalus:"", R5Stats:""},
    {peuple: "Hobgobelin", id: "hobgobelin", statsChoice: "DEX", statsMalus:"", R5Stats:""},
    {peuple: "Ogre", id: "ogre", statsChoice: "", statsMalus:"CON", R5Stats:""},
    {peuple: "Skaven", id: "skaven", statsChoice: "DEX, CON", statsMalus:"FOR", R5Stats:"DEX, CON"}
];

function chargerRaces() {
    const select = document.getElementById('race');
    races.forEach(race => {
        const option = document.createElement('option');
        //option.value = race.id;  // Valeur cachée pour JS
        option.textContent = race.peuple;  // Affiché à l'utilisateur
        select.appendChild(option);
    });
}

document.getElementById('race').addEventListener('change', function() {
    CharacterData.race = this.value;
    chargerStatPeuple(this.value);
});

function chargerStatPeuple(peuple) {
    const raceChoisie = races.find(r => r.peuple === peuple); //On trouve la race correspondante
    const bonus = raceChoisie.statsChoice ? raceChoisie.statsChoice.split(', ') : 'Aucun'; //Condition ? vrai : faux
    const select = document.getElementById('bonusPeuple'); //On récupère la zone
    select.innerHTML= '<select name="" id="bonusPeuple"></select>';
    const choix = Object.values(bonus);
    choix.forEach(b =>{
        const option = document.createElement('option');
        select.style.display = 'block';
        option.textContent = b;
        select.appendChild(option);
    });
}


// Gestion des profils------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const profils = [
    {nom: "Déchainé des steppes", id: "steppes", mainStat: "FOR,CON", voieInitialesID: "brute, rage, mercenaire, bouclier"},
    {nom: "Sentinelle", id: "sentinelle", mainStat: "FOR,DEX", voieInitialesID: "bouclier, heros, guerre, maître_d_arme"},
    {nom: "Danseur de lame", id: "danseur", mainStat: "DEX,AGI", voieInitialesID: "combat_à_deux_armes, escrime, saltimbanque, mercenaire"},
    {nom: "Ombre", id: "ombre", mainStat: "AGI,DEX", voieInitialesID: "aventurier, déplacement, assassin, roublard"},
    {nom: "Veilleur", id: "veilleur", mainStat: "AGI,PER", voieInitialesID: "combat_à_deux_armes, survie, archer, aventurier"},
    {nom: "Ensorceleur", id: "ensorceleur", mainStat: "INT,PER", voieInitialesID: "eau, feu, foudre, terre", isMagique: true},
    {nom: "Mentat", id: "mentat", mainStat: "INT,WIS", voieInitialesID: "télékinésie, pensée, chaman, soigneur", isMagique: true},
//    {nom: "Apothicaire", id: "apothicaire", mainStat: "WIS,INT", voieInitialesID: "explosifs, toxines, mutagènes, élixirs", isMagique: true},
    {nom: "Arcanobretteur", id: "arcanobretteur", mainStat: "FOR,INT", voieInitialesID: "enchantement_d_arme, danseur_arcanique, escrime, sang_magique"}
];

function chargerProfils() {
    const select = document.getElementById('profil');
    profils.forEach(profil => {
        const option = document.createElement('option');
        option.value = profil.id;  // Valeur cachée pour JS
        option.textContent = profil.nom;  // Affiché à l'utilisateur
        select.appendChild(option);
    });
}

// Filtrage des voies initiales en fonction du profil sélectionné

document.getElementById('profil').addEventListener('change', function() {
    CharacterData.profil = this.value;
    const voiesSelect1 = document.querySelectorAll('#voie1Select, #voie2Select');
    const voiesSelect2 = document.querySelectorAll('#voie3Select, #voie4Select');
    
    // Récupère les voies du profil
    const voiesProfil = profils.find(p => p.id === CharacterData.profil).voieInitialesID.split(',').map(v => v.trim());
    //console.log("iD Profil sélectionné :", CharacterData.profil);
    
    // Filtre + popule
    voiesSelect1.forEach(select => {
        select.innerHTML = '<option value="" disabled selected>Voie initiale</option>';
    });
    voiesSelect2.forEach(select => {
        select.innerHTML = '<option value="" disabled selected>Voie secondaire</option>';
    });
    voiesProfil.forEach(voieId => {
        const voie = voies.find(v => v.id === voieId);
        const option = document.createElement('option');
        option.value = voieId;
        option.textContent = voie.nom;
        voiesSelect1.forEach(select => select.appendChild(option.cloneNode(true)));
    });
    voies.forEach(voie => {
        const option = document.createElement('option');
        option.value = voie.id;
        option.textContent = voie.nom;
        voiesSelect2.forEach(select => select.appendChild(option.cloneNode(true)));
    });
});

document.getElementById('voie1Select').addEventListener('change', function() {
    CharacterData.voies.voie1.nom = this.value;
    CharacterData.voies.voie1.type = voies.find(v => v.id === this.value).type;
});
document.getElementById('voie2Select').addEventListener('change', function() {
    CharacterData.voies.voie2.nom = this.value;
    CharacterData.voies.voie2.type = voies.find(v => v.id === this.value).type;
});
document.getElementById('voie3Select').addEventListener('change', function() {
    CharacterData.voies.voie3.nom = this.value;
    CharacterData.voies.voie3.type = voies.find(v => v.id === this.value).type;
});
document.getElementById('voie4Select').addEventListener('change', function() {
    CharacterData.voies.voie4.nom = this.value;
    CharacterData.voies.voie4.type = voies.find(v => v.id === this.value).type;
});

document.getElementById('voiePeupleRange').addEventListener('input', function() {
    document.getElementById('voiePeupleRangeValue').textContent = `R${this.value}`;
    CharacterData.voiePeuple.rang = parseInt(this.value);
});
document.getElementById('voie1Range').addEventListener('input', function() {
    document.getElementById('voie1RangeValue').textContent = `R${this.value}`;
    CharacterData.voies.voie1.rang = parseInt(this.value);
});
document.getElementById('voie2Range').addEventListener('input', function() {
    document.getElementById('voie2RangeValue').textContent = `R${this.value}`;
    CharacterData.voies.voie2.rang = parseInt(this.value);
});
document.getElementById('voie3Range').addEventListener('input', function() {
    document.getElementById('voie3RangeValue').textContent = `R${this.value}`;
    CharacterData.voies.voie3.rang = parseInt(this.value);
});
document.getElementById('voie4Range').addEventListener('input', function() {
    document.getElementById('voie4RangeValue').textContent = `R${this.value}`;
    CharacterData.voies.voie4.rang = parseInt(this.value);
});

// Gestion des statistiques du personnage------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const statsProfils = [
    {nom: "Polyvalent : +1, +1, +1, +1, +1, +1", id: "polyvalent", value: 6},
    {nom: "Expert : +3, +2, +1, +1, +0, +0", id: "expert", value: 7},
    {nom: "Spécialisé : +4, +2, +1, +0, +0, +0", id: "spécialisé", value: 7}
];

function chargerStatProfils() {
    const select = document.getElementById('statsProfil');
    statsProfils.forEach(profil => {
        const option = document.createElement('option');
        option.value = profil.id;  // Valeur cachée pour JS
        option.textContent = profil.nom;  // Affiché à l'utilisateur
        select.appendChild(option);
    });
}

let choixStat = [];
let profilStat = "";

//FOnction pour peupler les sélecteur de profil de stats
function optionStats() {
    profilStat = document.getElementById('statsProfil').value || 0;
    if (profilStat == "polyvalent") {
        document.getElementById("statsProfilChoice").innerHTML = '';
        return;

    } else if (profilStat == "expert") {
        //Profil expert : faire apparaitre un +3 un +2 et 2x +1 ?
        document.getElementById("statsProfilChoice").innerHTML = `
        <select name="" id="statsProfilChoice1" class="statsProfilSelect select select-success mb-2">
            <option value="" disabled selected>+3 sur quelle statistique</option>
            <option value="FORCE">FORCE</option>
            <option value="DEXTERITE">DEXTERITE</option>
            <option value="CONSTITUTION">CONSTITUTION</option>
            <option value="INTELLIGENCE">INTELLIGENCE</option>
            <option value="VOLONTE">VOLONTE</option>
            <option value="CHARISME">CHARISME</option>
        </select>
        <select name="" id="statsProfilChoice2" class="statsProfilSelect select select-success mb-2">
            <option value="" disabled selected>+2 sur quelle statistique</option>
            <option value="FORCE">FORCE</option>
            <option value="DEXTERITE">DEXTERITE</option>
            <option value="CONSTITUTION">CONSTITUTION</option>
            <option value="INTELLIGENCE">INTELLIGENCE</option>
            <option value="VOLONTE">VOLONTE</option>
            <option value="CHARISME">CHARISME</option>
        </select>
        <select name="" id="statsProfilChoice3" class="statsProfilSelect select select-success mb-2">
            <option value="" disabled selected>+1 sur quelle statistique</option>
            <option value="FORCE">FORCE</option>
            <option value="DEXTERITE">DEXTERITE</option>
            <option value="CONSTITUTION">CONSTITUTION</option>
            <option value="INTELLIGENCE">INTELLIGENCE</option>
            <option value="VOLONTE">VOLONTE</option>
            <option value="CHARISME">CHARISME</option>
        </select>
        <select name="" id="statsProfilChoice4" class="statsProfilSelect select select-success mb-2">
            <option value="" disabled selected>+1 sur quelle statistique</option>
            <option value="FORCE">FORCE</option>
            <option value="DEXTERITE">DEXTERITE</option>
            <option value="CONSTITUTION">CONSTITUTION</option>
            <option value="INTELLIGENCE">INTELLIGENCE</option>
            <option value="VOLONTE">VOLONTE</option>
            <option value="CHARISME">CHARISME</option>
        </select>
        `;
        choixStat = [
            {id: "statsProfilChoice1", stat: "", value:3},
            {id: "statsProfilChoice2", stat: "", value:2},
            {id: "statsProfilChoice3", stat: "", value:1},
            {id: "statsProfilChoice4", stat: "", value:1}
        ];

    } else if (profilStat == "spécialisé") {
        document.getElementById("statsProfilChoice").innerHTML = `
        <select name="" id="statsProfilChoice1" class="statsProfilSelect select select-success mb-2">
            <option value="" disabled selected>+4 sur quelle statistique</option>
            <option value="FORCE">FORCE</option>
            <option value="DEXTERITE">DEXTERITE</option>
            <option value="CONSTITUTION">CONSTITUTION</option>
            <option value="INTELLIGENCE">INTELLIGENCE</option>
            <option value="VOLONTE">VOLONTE</option>
            <option value="CHARISME">CHARISME</option>
        </select>
        <select name="" id="statsProfilChoice2" class="statsProfilSelect select select-success mb-2">
            <option value="" disabled selected>+2 sur quelle statistique</option>
            <option value="FORCE">FORCE</option>
            <option value="DEXTERITE">DEXTERITE</option>
            <option value="CONSTITUTION">CONSTITUTION</option>
            <option value="INTELLIGENCE">INTELLIGENCE</option>
            <option value="VOLONTE">VOLONTE</option>
            <option value="CHARISME">CHARISME</option>
        </select>
        <select name="" id="statsProfilChoice3" class="statsProfilSelect select select-success mb-2">
            <option value="" disabled selected>+1 sur quelle statistique</option>
            <option value="FORCE">FORCE</option>
            <option value="DEXTERITE">DEXTERITE</option>
            <option value="CONSTITUTION">CONSTITUTION</option>
            <option value="INTELLIGENCE">INTELLIGENCE</option>
            <option value="VOLONTE">VOLONTE</option>
            <option value="CHARISME">CHARISME</option>
        </select>
        `;
        choixStat = [
            {id: "statsProfilChoice1", stat: "", value:4},
            {id: "statsProfilChoice2", stat: "", value:2},
            {id: "statsProfilChoice3", stat: "", value:1}
        ];
    };
}

document.getElementById('statsProfil').addEventListener('change', function(){
    optionStats();
});

//Fonction pour changer les stats dans l'objet Character
function incrementStats(){
    if (profilStat == "polyvalent") {
        CharacterData.stats.FORCE.value += 1;
        CharacterData.stats.DEXTERITE.value += 1;
        CharacterData.stats.CONSTITUTION.value += 1;
        CharacterData.stats.INTELLIGENCE.value += 1;
        CharacterData.stats.VOLONTE.value += 1;
        CharacterData.stats.CHARISME.value += 1;
    } else {
        choixStat.forEach(c =>{
            c.stat = document.getElementById(c.id).value;
            CharacterData.stats[c.stat].value = c.value;
        });
    };

}

//Fonction pour update les input number dans Résultat
function updateStats() {
    document.getElementById("force").innerHTML = CharacterData.stats.FORCE.value;
    document.getElementById("dexterite").innerHTML = CharacterData.stats.DEXTERITE.value;
    document.getElementById("constitution").innerHTML = CharacterData.stats.CONSTITUTION.value;
    document.getElementById("intelligence").innerHTML = CharacterData.stats.INTELLIGENCE.value;
    document.getElementById("will").innerHTML = CharacterData.stats.VOLONTE.value;
    document.getElementById("charisme").innerHTML = CharacterData.stats.CHARISME.value;
}

//Fonction pour empêcher les doublons dans les sélecteurs ----> Ne fonctionne pour le moment pas, il ne se passe rien
const selects = ['statsProfilChoice1', 'statsProfilChoice2', 'statsProfilChoice3', 'statsProfilChoice4'];

function majGrisage() {
    const valeursChoisies = [];
    
    // Collecte TOUTES les stats choisies
    selects.forEach(id => {
        const select = document.getElementById(id);
        const value = select.value;
        if (value) valeursChoisies.push(value);
    });
    
    // GRISAGE dans CHAQUE select
    selects.forEach(id => {
        const select = document.getElementById(id);
        Array.from(select.options).forEach(option => {
            if (option.value && valeursChoisies.includes(option.value)) {
                option.disabled = true;
                option.textContent += ' (pris)';
            } else {
                option.disabled = false;
                option.textContent = option.textContent.replace(' (pris)', '');
            }
        });
    });
}

// Sur CHAQUE changement
selects.forEach(id => {
    document.getElementById(id).addEventListener('change', majGrisage);
});

// Init
majGrisage();










// Gestion des compétences------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const skills = [
    {nom: "Acrobaties", maxlvl: 5},
    {nom: "Arme à distance", maxlvl: 5},
    {nom: "Arme de mêlée", maxlvl: 5},
    {nom: "Athlétisme", maxlvl: 5},
    {nom: "Connaissance", maxlvl: 5},
    {nom: "Diplomatie", maxlvl: 5},
    {nom: "Discrétion", maxlvl: 5},
    {nom: "Endurance", maxlvl: 5},
    {nom: "Escamotage", maxlvl: 5},
    {nom: "Intimidation", maxlvl: 5},
    {nom: "Intuition", maxlvl: 5},
    {nom: "Lancer d'objet", maxlvl: 5},
    {nom: "Magie", maxlvl: 5},
    {nom: "Médecine", maxlvl: 5},
    {nom: "Mêlée", maxlvl: 5},
    {nom: "Perception", maxlvl: 10},
    {nom: "Persuasion", maxlvl: 5},
    {nom: "Représentation", maxlvl: 5},
    {nom: "Survie", maxlvl: 5},
    {nom: "Tromperie", maxlvl: 5}
];

document.getElementById('lvl').addEventListener('input', function() {
    calculSP();
});
document.querySelectorAll('.skill').forEach(input => {
    input.addEventListener('input', function() {
        calculSP();
    });
});

function calculSP() {
    const niveau = parseInt(document.getElementById("lvl").value) || 1;

    if (calculInputSkill() > 5 + (niveau-1) * 4) {
        document.getElementById("resultSP").innerHTML = `
            <p style="color: red;"><strong>Points de compétence : ${calculInputSkill()} / ${5 + (niveau-1) * 4}</strong></p>
        `;
    } else {
        document.getElementById("resultSP").innerHTML = `
            <p>Points de compétence : ${calculInputSkill()} / ${5 + (niveau-1) * 4}</p>
        `;
    }
}

function calculInputSkill() {
    let totalSP = 0;
    
    // Somme TOUS les inputs .skill
    document.querySelectorAll('.skill').forEach(input => {
        totalSP += parseInt(input.value) || 0;
    });
    
    return totalSP;
}

//Gestion des voies
const voies = [
    {nom: "Voie de la brute", id: "brute", type: "Puissance"},
    {nom: "Voie de la guerre", id: "guerre", type: "Puissance"},
    {nom: "Voie de la rage", id: "rage", type: "Puissance"},
    {nom: "Voie du bouclier", id: "bouclier", type: "Puissance"},
    {nom: "Voie du héros", id: "heros", type: "Puissance"},
    {nom: "Voie du maître d'arme", id: "maître_d_arme", type: "Puissance"},
    {nom: "Voie du mercenaire", id: "mercenaire", type: "Puissance"},
    {nom: "Voie du roublard", id: "roublard", type: "Finesse"},
    {nom: "Voie de l'archer", id: "archer", type: "Finesse"},
    {nom: "Voie de l'assassin", id: "assassin", type: "Finesse"},
    {nom: "Voie de l'aventurier", id: "aventurier", type: "Finesse"},
    {nom: "Voie du l'escrime", id: "escrime", type: "Finesse"},
    {nom: "Voie de la survie", id: "survie", type: "Finesse"},
    {nom: "Voie du combat à deux armes", id: "combat_à_deux_armes", type: "Finesse"},
    {nom: "Voie du danseur arcanique", id: "danseur_arcanique", type: "Finesse"},
    {nom: "Voie du déplacement", id: "déplacement", type: "Finesse"},
    {nom: "Voie du saltimbanque", id: "saltimbanque", type: "Finesse"},
    {nom: "Voie de l'eau", id: "eau", type: "Magie"},
    {nom: "Voie de l'enchantement d'arme", id: "enchantement_d_arme", type: "Magie"},
    {nom: "Voie de la foudre", id: "foudre", type: "Magie"},
    {nom: "Voie de la pensée", id: "pensée", type: "Magie"},
    {nom: "Voie de la sirène", id: "sirène", type: "Magie"},
    {nom: "Voie de la télékinésie", id: "télékinésie", type: "Magie"},
    {nom: "Voie de la terre", id: "terre", type: "Magie"},
    {nom: "Voie du chamanisme totémique", id: "chaman", type: "Magie"},
    {nom: "Voie du feu", id: "feu", type: "Magie"},
    {nom: "Voie du sang magique", id: "sang_magique", type: "Magie"},
    {nom: "Voie du soigneur", id: "soigneur", type: "Magie"}
];

//Bouton de calcul
function MaJ() {
    Object.keys(CharacterData.stats).forEach(statName => {
        CharacterData.stats[statName].value = 0;
    });
    calculCP();
    calculDice();
    calculSP();
    incrementStats();
    updateStats();
    calculHP();
    calculMP();
    console.log("Character :", CharacterData);
}

//Initialisation des listes déroulantes
chargerProfils();
chargerRaces();
chargerStatProfils();