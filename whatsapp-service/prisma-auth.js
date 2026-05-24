const { initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys');

module.exports = async function usePrismaAuthState(prisma) {
  const writeData = async (data, id) => {
    try {
      const informationToStore = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
      const updateData = { value: JSON.stringify(informationToStore) };
      await prisma.whatsAppSession.upsert({
        where: { key: id },
        update: updateData,
        create: { key: id, ...updateData },
      });
    } catch (error) {
      console.error(`Erro ao salvar dados no Prisma para a chave ${id}:`, error);
    }
  };

  const readData = async (id) => {
    try {
      const data = await prisma.whatsAppSession.findUnique({ where: { key: id } });
      if (data && data.value) {
        return JSON.parse(data.value, BufferJSON.reviver);
      }
      return null;
    } catch (error) {
      console.error(`Erro ao ler dados no Prisma para a chave ${id}:`, error);
      return null;
    }
  };

  const removeData = async (id) => {
    try {
      await prisma.whatsAppSession.deleteMany({ where: { key: id } });
    } catch (error) {
      console.error(`Erro ao deletar dados no Prisma para a chave ${id}:`, error);
    }
  };

  let creds = await readData('creds');
  if (!creds) {
    creds = initAuthCreds();
    await writeData(creds, 'creds');
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = require('@whiskeysockets/baileys').proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeData(creds, 'creds'),
  };
};
