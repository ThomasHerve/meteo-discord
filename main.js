const Discord = require("discord.js");
const client = new Discord.Client();
const config = require('./config.json');
const meteo = require("weather-js");
const schedule = require('node-schedule');

client.login(config.token);
var prefix = config.prefix;

client.on('ready', () => {
   console.log("Je suis connecté !");

    const serv = client.guilds.find("id", config.servID);
    const channel = serv.channels.find("id", config.meteoID);

    var j = schedule.scheduleJob("22 12 * * *", () => {
        getWeather(channel);
    });
});

client.on('message', (message) => {
    if (message.guild.id != config.servID) {
        return;
    }

    if (message.content.startsWith(config.prefix)) {
        message.reply(`Prefix trouvé`);
    }
})

function getWeather(channel) {
    meteo.find({search: 'Grenoble', degreeType: 'C'}, (err, result) => {
        if (err) {
            return console.log(err);
        }
        
        let demain = result[0].forecast[2];
        let retour = {
            "min": demain.low,
            "max": demain.high,
            "temps": "",
            "precip": demain.precip,
            "image":""
        }
        console.log(demain.skytextday);
        console.log(demain.skytextday == "Partly Sunny");

        switch (demain.skytextday) {
            case "Partly Sunny":
                retour.temps = "Partiellement ensoleillé";
                retour.image = config.images.nuages;
                break;
            case "Mostly Sunny":
            case 'Mostly Clear':
                retour.temps = "Quelques nuages";
                retour.image = config.images.nuages;
                break;
            case "T-Storms":
                retour.temps = "Orages";
                retour.image = config.images.eclair;
                break;
            case "Sunny":
                retour.temps = "Ensoleillé";
                retour.image = config.images.soleil;
                break;
            case "Clear":
                retour.temps = "Rares nuages";
                retour.image = config.images.soleil;
                break;
            case "Light Rain":
                retour.temps = "Quelques pluies";
                retour.image = config.images.pluie;
                break;
            default:
                retour.temps = demain.skytextday;
                retour.image = config.images.nuages;
                break;
        }


        const embed = new Discord.RichEmbed()
        .setTitle(`Météo du ${demain.date}`)
        .setColor(0x00AE86)
        .setDescription(`SALUT BANDE DE SALOPE, VOICI DES INFOS POUR DEMAIN:`)
        .addField("Température min", `${retour.min} °C`, true)
        .addField("Température max", `${retour.max} °C`, true)
        .addField("Etat du ciel", `${retour.temps}`, true)
        .addField("Précipitations", `${retour.precip} %`, true)
        .setThumbnail(retour.image);

        channel.send({embed});
    });
}
