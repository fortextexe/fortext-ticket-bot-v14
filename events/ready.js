export default {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`${client.user.tag} başarıyla giriş yaptı!`)
    console.log(`${client.guilds.cache.size} sunucuda aktif`)
    console.log(`${client.users.cache.size} kullanıcıya hizmet veriyor`)
    console.log(`Emojiler otomatik olarak yüklendi`)
  },
}
