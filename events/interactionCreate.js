import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js"
import settings from "../settings.js"

export default {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName)

      if (!command) {
        console.error(`${interaction.commandName} komutu bulunamadı.`)
        return
      }

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error("Komut çalıştırma hatası:", error)

        const errorMessage = {
          content: "Bu komutu çalıştırırken bir hata oluştu!",
          ephemeral: true,
        }

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage)
        } else {
          await interaction.reply(errorMessage)
        }
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "ticket_kategori_menu") {
        await handleTicketCreation(interaction)
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === "ticket_kapat") {
        await handleTicketClose(interaction)
      }
    }
  },
}

async function handleTicketCreation(interaction) {
  const guildData = interaction.client.guildData.get(interaction.guild.id)
  if (!guildData) return

  const selectedCategory = interaction.values[0]
  const category = settings.categories[selectedCategory]
  const user = interaction.user

  const existingTicket = interaction.guild.channels.cache.find(
    (channel) => channel.name === `${category.channelPrefix}-${user.username.toLowerCase()}`,
  )

  if (existingTicket) {
    const uyariEmoji = guildData.emojis?.uyari
    return interaction.reply({
      content: `<:${uyariEmoji.name}:${uyariEmoji.id}> Zaten açık bir ${category.name} ticketın var: ${existingTicket}`,
      ephemeral: true,
    })
  }

  try {
    const ticketChannel = await interaction.guild.channels.create({
      name: `${category.channelPrefix}-${user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: guildData.categoryId,
      topic: `${category.name} Ticket - ${user.tag} (${user.id})`,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: guildData.ticketRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.AttachFiles,
          ],
        },
      ],
    })

    const ticketEmoji = guildData.emojis?.ticket
    const kullaniciEmoji = guildData.emojis?.kullanici
    const katagoriEmoji = guildData.emojis?.katagori
    const deleteEmoji = guildData?.emojis?.delete

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`<:${ticketEmoji.name}:${ticketEmoji.id}> ${settings.messages.ticketCreated.title}`)
      .setDescription(
        settings.messages.ticketCreated.description
          .replace("{user}", user)
          .replace("{category}", `<:${katagoriEmoji.name}:${katagoriEmoji.id}> ${category.name}`)
          .replace("{ticketId}", ticketChannel.id),
      )
      .setColor(settings.embed.color)
      .setFooter({ text: settings.embed.footer })
      .setTimestamp()

    const closeButton = new ButtonBuilder()
      .setCustomId("ticket_kapat")
      .setLabel("Ticket Kapat")
      .setEmoji({ id: deleteEmoji.id })
      .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder().addComponents(closeButton)

    await ticketChannel.send({
      content: `${user} <@&${guildData.ticketRoleId}>`,
      embeds: [ticketEmbed],
      components: [row],
    })

    await interaction.reply({
      content: `${category.name} ticketın oluşturuldu: ${ticketChannel}`,
      ephemeral: true,
    })

    const logChannel = interaction.guild.channels.cache.get(guildData.logChannelId)
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle(`<:${ticketEmoji.name}:${ticketEmoji.id}> Yeni Ticket Açıldı`)
        .setDescription(
          `<:${kullaniciEmoji.name}:${kullaniciEmoji.id}> Kullanıcı: ${user}\n<:${katagoriEmoji.name}:${katagoriEmoji.id}> Kategori: ${category.name}\nKanal: ${ticketChannel}\nAçılma Zamanı: <t:${Math.floor(Date.now() / 1000)}:F>`,
        )
        .setColor(settings.embed.color)
        .setTimestamp()

      await logChannel.send({ embeds: [logEmbed] })
    }
  } catch (error) {
    console.error("Ticket oluşturma hatası:", error)
    const uyariEmoji = guildData?.emojis?.uyari
    await interaction.reply({
      content: `<:${uyariEmoji.name}:${uyariEmoji.id}> Ticket oluşturulurken bir hata oluştu!`,
      ephemeral: true,
    })
  }
}

async function handleTicketClose(interaction) {
  const guildData = interaction.client.guildData.get(interaction.guild.id)
  const member = interaction.member

  if (!member.permissions.has(PermissionFlagsBits.ManageChannels) && !member.roles.cache.has(guildData?.ticketRoleId)) {
    const uyariEmoji = guildData?.emojis?.uyari
    return interaction.reply({
      content: `<:${uyariEmoji.name}:${uyariEmoji.id}> Bu ticketi kapatmak için yetkin yok!`,
      ephemeral: true,
    })
  }

  const deleteEmoji = guildData?.emojis?.delete

  const closeEmbed = new EmbedBuilder()
    .setTitle(`<:${deleteEmoji.name}:${deleteEmoji.id}> Ticket Kapatılıyor`)
    .setDescription("Bu ticket 5 saniye içinde silinecek...")
    .setColor("#ff0000")
    .setFooter({ text: `Kapatan: ${interaction.user.tag}` })
    .setTimestamp()

  await interaction.reply({ embeds: [closeEmbed] })

  const logChannel = interaction.guild.channels.cache.get(guildData?.logChannelId)
  if (logChannel) {
    const kullaniciEmoji = guildData?.emojis?.kullanici
    const logEmbed = new EmbedBuilder()
      .setTitle(`<:${deleteEmoji.name}:${deleteEmoji.id}> Ticket Kapatıldı`)
      .setDescription(
        `Kanal: ${interaction.channel.name}\n<:${kullaniciEmoji.name}:${kullaniciEmoji.id}> Kapatan: ${interaction.user}\nKapatılma Zamanı: <t:${Math.floor(Date.now() / 1000)}:F>`,
      )
      .setColor("#ff0000")
      .setTimestamp()

    await logChannel.send({ embeds: [logEmbed] })
  }

  setTimeout(async () => {
    try {
      await interaction.channel.delete()
    } catch (error) {
      console.error("Kanal silme hatası:", error)
    }
  }, 5000)
    }
