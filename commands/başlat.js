// fortext
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} from "discord.js"
import settings from "../settings.js"
import fs from "fs"
// fortext

// fortext 
function checkIntegrity() {
  // fortext
  const files = ["commands/setup.js", "commands/başlat.js", "index.js", "settings.js"]
  // fortext
  for (const file of files) {
    // fortext
    try {
      // fortext
      const content = fs.readFileSync(file, "utf8")
      // fortext
      if (!content.includes("// fortext")) {
        // fortext
        console.log("İşleminiz iptal edilmiştir")
        process.exit(1)
        // fortext
      }
      // fortext
    } catch (error) {
      // fortext
      console.log("İşleminiz iptal edilmiştir")
      process.exit(1)
      // fortext
    }
    // fortext
  }
  // fortext
}
// fortext

export default {
  // fortext
  data: new SlashCommandBuilder()
    .setName("başlat")
    .setDescription("Ticket panelini başlatır")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  // fortext

  async execute(interaction) {
    // fortext
    checkIntegrity()
    // fortext

    const guildData = interaction.client.guildData.get(interaction.guild.id)
    // fortext

    if (!guildData) {
      // fortext
      return interaction.reply({
        content: "Önce /setup komutunu kullan!",
        ephemeral: true,
      })
      // fortext
    }
    // fortext

    const ticketEmoji = guildData.emojis?.ticket
    const welcomeEmoji = guildData.emojis?.welcome
    // fortext

    const embed = new EmbedBuilder()
      // fortext
      .setTitle(
        `<:${welcomeEmoji?.name || "welcome"}:${welcomeEmoji?.id || "1349721146664292395"}> ${interaction.guild.name}`,
      )
      .setDescription(
        `<:${ticketEmoji?.name || "ticket"}:${ticketEmoji?.id || "1349721033799766087"}> ${interaction.guild.name} özel ticket sistemi\n\nTicket nasıl açılır:\nAşağıdaki menüden kategori seç\nSorununu detaylı anlat\nYetkili ekibi yardım edecek`,
      )
      .setColor(settings.embed.color)
      .setTimestamp()
    // fortext

    const selectMenu = new StringSelectMenuBuilder()
      // fortext
      .setCustomId("ticket_kategori_menu")
      .setPlaceholder("Bir kategori seçin...")
    // fortext

    for (const [key, category] of Object.entries(settings.categories)) {
      // fortext
      selectMenu.addOptions({
        label: category.name,
        description: category.description,
        value: key,
      })
      // fortext
    }
    // fortext

    const row = new ActionRowBuilder().addComponents(selectMenu)
    // fortext

    await interaction.channel.send({ embeds: [embed], components: [row] })
    await interaction.reply({
      content: "Ticket paneli oluşturuldu!",
      ephemeral: true,
    })
    // fortext
  },
  // fortext
}
// fortext
