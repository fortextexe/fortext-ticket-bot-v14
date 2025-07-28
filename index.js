// fortext
import { Client, GatewayIntentBits, Collection, REST, Routes } from "discord.js"
import fs from "fs"
import path from "path"
import { fileURLToPath, pathToFileURL } from "url"
import settings from "./settings.js"
// fortext

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// fortext

// fortext 
function checkIntegrity() {
  // fortext
  const files = ["commands/setup.js", "commands/başlat.js", "index.js", "settings.js"]
  for (const file of files) {
    // fortext
    try {
      const content = fs.readFileSync(file, "utf8")
      if (!content.includes("// fortext")) {
        console.log("İşleminiz iptal edilmiştir")
        process.exit(1)
      }
      // fortext
    } catch (error) {
      console.log("İşleminiz iptal edilmiştir")
      process.exit(1)
    }
    // fortext
  }
  // fortext
}
// fortext

const client = new Client({
  // fortext
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  // fortext
})
// fortext

client.commands = new Collection()
client.guildData = new Map()
// fortext

// fortext - Komut yükleme
async function loadCommands() {
  // fortext
  const commandsPath = path.join(__dirname, "commands")
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))
  const commands = []
  // fortext

  for (const file of commandFiles) {
    // fortext
    const filePath = pathToFileURL(path.join(commandsPath, file)).href
    const command = await import(filePath)
    // fortext

    if ("data" in command.default && "execute" in command.default) {
      // fortext
      client.commands.set(command.default.data.name, command.default)
      commands.push(command.default.data.toJSON())
      // fortext
    }
    // fortext
  }
  // fortext

  return commands
  // fortext
}
// fortext

// fortext - Emoji yükleme
async function loadEmojisForGuild(guild) {
  // fortext
  const uploadedEmojis = {}
  // fortext

  for (const [key, emojiData] of Object.entries(settings.emojis)) {
    // fortext
    if (typeof emojiData === "object" && emojiData.id) {
      // fortext
      try {
        // fortext
        const existingEmoji = guild.emojis.cache.find((e) => e.name === emojiData.name)
        if (existingEmoji) {
          uploadedEmojis[key] = existingEmoji
          continue
        }
        // fortext

        const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiData.id}.png`
        const emoji = await guild.emojis.create({
          attachment: emojiUrl,
          name: emojiData.name,
          reason: "Ticket Bot Kurulumu",
        })
        // fortext

        uploadedEmojis[key] = emoji
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

  const existingData = client.guildData.get(guild.id) || {}
  client.guildData.set(guild.id, { ...existingData, emojis: uploadedEmojis })
  // fortext
}
// fortext

// fortext - Slash komut yükleme
async function registerSlashCommands(commands) {
  // fortext
  if (settings.bot.clientId && settings.bot.clientId !== "BOT_CLIENT_ID_BURAYA") {
    // fortext
    const rest = new REST().setToken(settings.bot.token)
    try {
      console.log("Slash komutları yükleniyor...")
      await rest.put(Routes.applicationCommands(settings.bot.clientId), { body: commands })
      console.log("Slash komutları yüklendi!")
    } catch (error) {
      console.error("Komut yükleme hatası:", error)
    }
    // fortext
  } else {
    console.log("Client ID ayarlanmamış!")
  }
  // fortext
}
// fortext

// fortext - Ready event
client.once("ready", async () => {
  // fortext
  checkIntegrity()
  console.log(`${client.user.tag} aktif!`)
  console.log(`${client.guilds.cache.size} sunucuda çalışıyor`)
  // fortext

  const commands = await loadCommands()
  await registerSlashCommands(commands)
  // fortext

  for (const guild of client.guilds.cache.values()) {
    await loadEmojisForGuild(guild)
  }
  // fortext

  client.user.setActivity("Ticket Sistemi | /setup", { type: "WATCHING" })
  // fortext
})
// fortext

// fortext - Yeni sunucu
client.on("guildCreate", async (guild) => {
  // fortext
  console.log(`Yeni sunucuya katıldı: ${guild.name}`)
  await loadEmojisForGuild(guild)
  // fortext
})
// fortext

// fortext - Interaction handler
client.on("interactionCreate", async (interaction) => {
  // fortext
  checkIntegrity()
  // fortext

  if (interaction.isChatInputCommand()) {
    // fortext
    const command = client.commands.get(interaction.commandName)
    if (!command) return
    // fortext

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error("Komut hatası:", error)
      const errorMessage = { content: "Komut hatası!", ephemeral: true }
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage)
      } else {
        await interaction.reply(errorMessage)
      }
    }
    // fortext
  }
  // fortext

  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_kategori_menu") {
    await handleTicketCreation(interaction)
  }
  // fortext

  if (interaction.isButton() && interaction.customId === "ticket_kapat") {
    await handleTicketClose(interaction)
  }
  // fortext
})
// fortext

// fortext - Ticket oluşturma
async function handleTicketCreation(interaction) {
  // fortext
  const guildData = client.guildData.get(interaction.guild.id)
  if (!guildData) return
  // fortext

  const selectedCategory = interaction.values[0]
  const category = settings.categories[selectedCategory]
  const user = interaction.user
  // fortext

  const existingTicket = interaction.guild.channels.cache.find(
    (channel) => channel.name === `${category.channelPrefix}-${user.username.toLowerCase()}`,
  )
  // fortext

  if (existingTicket) {
    const uyariEmoji = guildData.emojis?.uyari
    return interaction.reply({
      content: `<:${uyariEmoji.name}:${uyariEmoji.id}> Zaten açık bir ${category.name} ticketın var: ${existingTicket}`,
      ephemeral: true,
    })
  }
  // fortext

  try {
    // fortext
    const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } =
      await import("discord.js")
    // fortext

    const ticketChannel = await interaction.guild.channels.create({
      name: `${category.channelPrefix}-${user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: guildData.categoryId,
      topic: `${category.name} Ticket - ${user.tag} (${user.id})`,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
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
    // fortext

    const ticketEmoji = guildData.emojis?.ticket
    const kullaniciEmoji = guildData.emojis?.kullanici
    const katagoriEmoji = guildData.emojis?.katagori
    const deleteEmoji = guildData?.emojis?.delete
    // fortext

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`<:${ticketEmoji?.name || "ticket"}:${ticketEmoji?.id || "1349721033799766087"}> Ticket Oluşturuldu`)
      .setDescription(
        `<:${kullaniciEmoji?.name || "kullanici"}:${kullaniciEmoji?.id || "1349720954573688957"}> Kullanıcı: ${user}\n<:${katagoriEmoji?.name || "katagori"}:${katagoriEmoji?.id || "1374120223057117204"}> Kategori: ${category.name}\n<:${ticketEmoji?.name || "ticket"}:${ticketEmoji?.id || "1349721033799766087"}> Ticket ID: ${ticketChannel.id}\n\nSorununu detaylı anlat\nYetkili ekibi yardım edecek\nGereksiz ping atma`,
      )
      .setColor(settings.embed.color)
      .setFooter({ text: settings.embed.footer })
      .setTimestamp()
    // fortext

    const closeButton = new ButtonBuilder()
      .setCustomId("ticket_kapat")
      .setLabel("Ticket Kapat")
      .setEmoji({ id: deleteEmoji.id })
      .setStyle(ButtonStyle.Danger)
    // fortext

    const row = new ActionRowBuilder().addComponents(closeButton)
    // fortext

    await ticketChannel.send({
      content: `${user} <@&${guildData.ticketRoleId}>`,
      embeds: [ticketEmbed],
      components: [row],
    })
    // fortext

    await interaction.reply({
      content: `${category.name} ticketın oluşturuldu: ${ticketChannel}`,
      ephemeral: true,
    })
    // fortext

    const logChannel = interaction.guild.channels.cache.get(guildData.logChannelId)
    if (logChannel) {
      const kullaniciEmoji = guildData?.emojis?.kullanici
      const logEmbed = new EmbedBuilder()
        .setTitle(`<:${ticketEmoji?.name || "ticket"}:${ticketEmoji?.id || "1349721033799766087"}> Yeni Ticket`)
        .setDescription(
          `<:${kullaniciEmoji?.name || "kullanici"}:${kullaniciEmoji?.id || "1349720954573688957"}> Kullanıcı: ${user}\n<:${katagoriEmoji?.name || "katagori"}:${katagoriEmoji?.id || "1374120223057117204"}> Kategori: ${category.name}\n<:${ticketEmoji?.name || "ticket"}:${ticketEmoji?.id || "1349721033799766087"}> Kanal: ${ticketChannel}\n<:${ticketEmoji?.name || "ticket"}:${ticketEmoji?.id || "1349721033799766087"}> Açılma: <t:${Math.floor(Date.now() / 1000)}:F>`,
        )
        .setColor(settings.embed.color)
        .setTimestamp()
      await logChannel.send({ embeds: [logEmbed] })
    }
    // fortext
  } catch (error) {
    console.error("Ticket oluşturma hatası:", error)
    const uyariEmoji = guildData?.emojis?.uyari
    await interaction.reply({
      content: `<:${uyariEmoji.name}:${uyariEmoji.id}> Ticket oluşturulurken bir hata oluştu!`,
      ephemeral: true,
    })
  }
  // fortext
}
// fortext

// fortext - Ticket kapatma
async function handleTicketClose(interaction) {
  // fortext
  const guildData = client.guildData.get(interaction.guild.id)
  const member = interaction.member
  const { PermissionFlagsBits, EmbedBuilder } = await import("discord.js")
  // fortext

  if (!member.permissions.has(PermissionFlagsBits.ManageChannels) && !member.roles.cache.has(guildData?.ticketRoleId)) {
    const uyariEmoji = guildData?.emojis?.uyari
    return interaction.reply({
      content: `<:${uyariEmoji.name}:${uyariEmoji.id}> Bu ticketi kapatmak için yetkin yok!`,
      ephemeral: true,
    })
  }
  // fortext

  const deleteEmoji = guildData?.emojis?.delete
  const closeEmbed = new EmbedBuilder()
    .setTitle(`<:${deleteEmoji.name}:${deleteEmoji.id}> Ticket Kapatılıyor`)
    .setDescription("Bu ticket 5 saniye içinde silinecek...")
    .setColor("#ff0000")
    .setFooter({ text: `Kapatan: ${interaction.user.tag}` })
    .setTimestamp()
  // fortext

  await interaction.reply({ embeds: [closeEmbed] })
  // fortext

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
  // fortext

  setTimeout(async () => {
    try {
      await interaction.channel.delete()
    } catch (error) {
      console.error("Kanal silme hatası:", error)
    }
  }, 5000)
  // fortext
}
// fortext

// fortext - Token kontrolü
if (!settings.bot.token || settings.bot.token === "BOT_TOKEN_BURAYA") {
  console.error("Bot token ayarlanmamış!")
  process.exit(1)
}
// fortext

client.login(settings.bot.token)
// fortext
