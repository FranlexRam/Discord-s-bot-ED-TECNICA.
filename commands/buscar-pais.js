

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios').default;

const createEmbed = (country, weather) => {
  // 1. Get colors from flag

  // 2. Create embed with builder
  const exampleEmbed = new EmbedBuilder()
    //.setColor()
    .setTitle(country.name.common)
    .setURL(`https://en.wikipedia.org/wiki/${country.name.common}`)
    .setDescription('Show country information')
    .setThumbnail(`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`)
    .addFields(
      { name: 'Capital', value: country.capital[0] },
      { name: 'Region', value: country.subregion, inline: true },
      { name: 'Population', value: Intl.NumberFormat('de-DE').format(`${country.population}`), inline: true },
      { name: 'Temperature', value: `${weather.main.temp} C`, inline: true },
      { name: 'Weather', value: `${weather.weather[0].description[0].toUpperCase() + weather.weather[0].description.substring(1)}`, inline: true },
    )
    .addFields({ name: 'Time-zone', value: country.timezones[0], inline: true })
    .setImage(country.flags.png)
    .setFooter({ text: 'Some climate here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

  return exampleEmbed;

};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buscar-pais')
    .setDescription('Muestra informacion del pais suminstrado')
    .addStringOption(option =>
      option.setName('pais')
        .setDescription('Nombre del pais')),
  //.setRequired(true)),
  async execute(interaction) {
    const country = interaction.options.getString('pais');
    //const discord = interaction.user.id;
    try {
      // if (country) {
      //   const embed = getEmbedByCountry(country);
      //   return await interaction.reply({ embeds: [embed] });
      // }
      const { data: [countryApi] } = await axios.get(`https://restcountries.com/v3.1/name/${country}`);

      const [lat, lon] = countryApi.latlng; //tomando valores de la API country requeridos en la variable weather
      const { data: weatherApi } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=ea3e909bea13b9ee23b45658c6702774&units=metric`);
      //console.log(countryApi);
      console.log(weatherApi);


      const embed = createEmbed(countryApi, weatherApi);
      await interaction.reply( { embeds: [embed] } );




    } catch (error) {
      console.log(error);
      await interaction.reply('El pais no existe. Intenta con otro.');
    }
  },
};


