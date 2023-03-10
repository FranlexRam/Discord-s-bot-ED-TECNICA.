const { default: axios } = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

const createEmbed = (team) => {
  // 2. Create embed with builder
  const exampleEmbed = new EmbedBuilder()
    //.setColor()
    .setTitle(team.name_en)
    //.setURL(`https://en.wikipedia.org/wiki/${team.name.common}`)
    .setDescription('Show team information')
    //.setThumbnail(`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`)
    .addFields(
      { name: 'Team', value: team.name_en },
      { name: 'Fifa code', value: team.fifa_code, inline: true },
      { name: 'Group', value: team.groups, inline: true },
      //{ name: 'Temperature', value: `${weather.main.temp} C`, inline: true },
      //{ name: 'Weather', value: `${weather.weather[0].description[0].toUpperCase() + weather.weather[0].description.substring(1)}`, inline: true },
    )
    //.addFields({ name: 'Time-zone', value: team.timezones[0], inline: true })
    .setImage(team.flag);
    //.setFooter({ text: 'Some climate here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

  return exampleEmbed;

};






module.exports = {
  data: new SlashCommandBuilder()
    .setName('buscar-equipo')
    .setDescription('Muestra informacion del equipo en el mundial!')
    .addStringOption(option =>
      option.setName('equipo')
        .setDescription('Nombre del equipo')
        .setRequired(true)),
  async execute(interaction) {

    try {
      const team = interaction.options.getString('equipo');

      const { token } = db.prepare(`
      SELECT token from users
      WHERE discord_id = ?
      `).get(interaction.user.id);

      console.log(token);

      const { data:response } = await axios.get('http://api.cup2022.ir/api/v1/team', {
        headers: { 'Authorization' : `Bearer ${token}` }
      });
      const t = response.data.find(equipo => equipo.name_en === team);

      if (!t) {
        return await interaction.reply('El pais no participo en el mundial Qatar22');
      }

      console.log(response);
      const embed = createEmbed(t);
      await interaction.reply( { embeds: [embed] } );
    } catch (error) {
      //ver errores de la API
      console.log(error?.response?.data?.message);
      if (error?.response?.data?.message) {
        return await interaction.reply('User validation failed: email: Please provide a valid email, password: Path `password` (`00`) is shorter than the minimum allowed length (8)., passwordConfirm: Path `passwordConfirm` (`00`) is shorter than the minimum allowed length (8)');
      }

      //otros errores
      console.log(error.message);
      switch (error.message) {
      case 'Cannot read properties of undefined (reading name_en)':
        return await interaction.reply('El pais no participo en el mundial');
      case 'UNIQUE constraint failed: users.email':
        return await interaction.reply('Tu email ya se encuentra registrado');
      default:
        return await interaction.reply('Hubo un error!');
      }

    }
  },
};