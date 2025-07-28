// fortext
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js"
import settings from "../settings.js"
import fs from "fs"
// fortext

// fortext 
function checkIntegrity() {
  // fortext
  const files = ["commands/setup.js", "commands/başlat.js", "commands/settings.js", "index.js", "settings.js"]
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
    .setName("settings")
    .setDescription("Ticket sistem ayarlarını düzenle")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("log")
        .setDescription("Log kanalını ayarla")
        .addChannelOption((option) => option.setName("kanal").setDescription("Log kanalını seç").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kategori")
        .setDescription("Ticket kategorisini ayarla")
        .addChannelOption((option) =>
          option.setName("kategori").setDescription("Ticket kategorisini seç").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("rol")
        .setDescription("Yetkili rolünü ayarla")
        .addRoleOption((option) => option.setName("rol").setDescription("Yetkili rolünü seç").setRequired(true)),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  // fortext

  async execute(interaction) {
    // fortext
    checkIntegrity()
    // fortext

    const subcommand = interaction.options.getSubcommand()
    const guildData = interaction.client.guildData.get(interaction.guild.id) || {}
    // fortext

    if (subcommand === "log") {
      // fortext
      const channel = interaction.options.getChannel("kanal")
      if (channel.type !== ChannelType.GuildText) {
        return interaction.reply({ content: "Sadece metin kanalları seçebilirsin!", ephemeral: true })
      }
      // fortext

      guildData.logChannelId = channel.id
      interaction.client.guildData.set(interaction.guild.id, guildData)
      // fortext

      const settingsEmoji = guildData.emojis?.settings
      const embed = new EmbedBuilder()
        .setTitle(
          `<:${settingsEmoji?.name || "settings"}:${settingsEmoji?.id || "1156331373049692161"}> Log Kanalı Ayarlandı`,
        )
        .setDescription(`Log kanalı ${channel} olarak ayarlandı`)
        .setColor(settings.embed.color)
        .setTimestamp()
      // fortext

      await interaction.reply({ embeds: [embed], ephemeral: true })
      // fortext
    }
    // fortext

    if (subcommand === "kategori") {
      // fortext
      const category = interaction.options.getChannel("kategori")
      if (category.type !== ChannelType.GuildCategory) {
        return interaction.reply({ content: "Sadece kategoriler seçebilirsin!", ephemeral: true })
      }
      // fortext

      guildData.categoryId = category.id
      interaction.client.guildData.set(interaction.guild.id, guildData)
      // fortext

      const settingsEmoji = guildData.emojis?.settings
      const embed = new EmbedBuilder()
        .setTitle(
          `<:${settingsEmoji?.name || "settings"}:${settingsEmoji?.id || "1156331373049692161"}> Kategori Ayarlandı`,
        )
        .setDescription(`Ticket kategorisi ${category.name} olarak ayarlandı`)
        .setColor(settings.embed.color)
        .setTimestamp()
      // fortext

      await interaction.reply({ embeds: [embed], ephemeral: true })
      // fortext
    }
    // fortext

    if (subcommand === "rol") {
      // fortext
      const role = interaction.options.getRole("rol")
      guildData.ticketRoleId = role.id
      interaction.client.guildData.set(interaction.guild.id, guildData)
      // fortext

      const settingsEmoji = guildData.emojis?.settings
      const embed = new EmbedBuilder()
        .setTitle(
          `<:${settingsEmoji?.name || "settings"}:${settingsEmoji?.id || "1156331373049692161"}> Yetkili Rol Ayarlandı`,
        )
        .setDescription(`Yetkili rol ${role} olarak ayarlandı`)
        .setColor(settings.embed.color)
        .setTimestamp()
      // fortext

      await interaction.reply({ embeds: [embed], ephemeral: true })
      // fortext
    }
    // fortext
  },
  // fortext
}
// fortext
