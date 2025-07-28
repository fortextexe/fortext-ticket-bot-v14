// fortext
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js"
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
    .setName("setup")
    .setDescription("Ticket sistemini kurar")
    .addRoleOption((option) =>
      option.setName("yetkili-rol").setDescription("Ticket yetkili rolünü seçin").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  // fortext

  async execute(interaction) {
    // fortext
    checkIntegrity()
    // fortext

    const ticketRole = interaction.options.getRole("yetkili-rol")
    const guild = interaction.guild
    // fortext

    await interaction.deferReply({ ephemeral: true })
    // fortext

    try {
      // fortext
      const guildData = interaction.client.guildData.get(guild.id) || {}
      const uploadedEmojis = guildData.emojis || {}
      // fortext

      for (const [key, emojiData] of Object.entries(settings.emojis)) {
        // fortext
        if (!uploadedEmojis[key] && typeof emojiData === "object" && emojiData.id) {
          // fortext
          try {
            // fortext
            const existingEmoji = guild.emojis.cache.find((e) => e.name === emojiData.name)
            if (existingEmoji) {
              // fortext
              uploadedEmojis[key] = existingEmoji
              continue
              // fortext
            }
            // fortext

            const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiData.id}.png`
            const emoji = await guild.emojis.create({
              // fortext
              attachment: emojiUrl,
              name: emojiData.name,
              reason: "Ticket Bot Kurulumu",
              // fortext
            })
            uploadedEmojis[key] = emoji
            // fortext

            await new Promise((resolve) => setTimeout(resolve, 1000))
            // fortext
          } catch (error) {
            // fortext
          }
          // fortext
        }
        // fortext
      }
      // fortext

      const logChannel = await guild.channels.create({
        // fortext
        name: "ticket-logları",
        type: ChannelType.GuildText,
        topic: "Ticket sistemi log kanalı",
        // fortext
        permissionOverwrites: [
          // fortext
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: ticketRole.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          // fortext
        ],
        // fortext
      })
      // fortext

      const ticketCategory = await guild.channels.create({
        // fortext
        name: "TICKETS",
        type: ChannelType.GuildCategory,
        // fortext
        permissionOverwrites: [
          // fortext
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: ticketRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
            ],
          },
          // fortext
        ],
        // fortext
      })
      // fortext

      interaction.client.guildData.set(guild.id, {
        // fortext
        logChannelId: logChannel.id,
        categoryId: ticketCategory.id,
        ticketRoleId: ticketRole.id,
        emojis: uploadedEmojis,
        // fortext
      })
      // fortext

      const welcomeEmoji = uploadedEmojis.welcome
      const infoEmoji = uploadedEmojis.info
      const katagoriEmoji = uploadedEmojis.katagori
      const kullaniciEmoji = uploadedEmojis.kullanici

      const setupEmbed = new EmbedBuilder()
        .setTitle(
          `<:${welcomeEmoji?.name || "welcome"}:${welcomeEmoji?.id || "1349721146664292395"}> Kurulum Tamamlandı`,
        )
        .setDescription(
          `<:${infoEmoji?.name || "info"}:${infoEmoji?.id || "1349721438604624023"}> Log Kanalı: ${logChannel}\n<:${katagoriEmoji?.name || "katagori"}:${katagoriEmoji?.id || "1374120223057117204"}> Kategori: ${ticketCategory.name}\n<:${kullaniciEmoji?.name || "kullanici"}:${kullaniciEmoji?.id || "1349720954573688957"}> Yetkili Rol: ${ticketRole}\n<:${welcomeEmoji?.name || "welcome"}:${welcomeEmoji?.id || "1349721146664292395"}> Emojiler: ${Object.keys(uploadedEmojis).length}/8 adet hazır\n\nŞimdi \`/başlat\` komutunu kullan`,
        )
        .setColor(settings.embed.color)
        .setTimestamp()

      // fortext

      await interaction.editReply({ embeds: [setupEmbed] })
      // fortext
    } catch (error) {
      // fortext
      console.error("Kurulum hatası:", error)
      await interaction.editReply({
        content: "Kurulum hatası! Bot yetkileri kontrol et.",
      })
      // fortext
    }
    // fortext
  },
  // fortext
}
// fortext
