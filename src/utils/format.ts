import Discord from "discord.js";

const getTimestamp = (date: any) => new Date(date).valueOf();

export const formatMessage = (messageClaim: any) => {
  const embed = new Discord.MessageEmbed()
    .setTitle("ZAMUROS ASSEMBLED")
    .setColor([30, 215, 96]);

  if (!messageClaim.claims) return embed;

  // Añadir ganador
  const orderedMessageClaims = messageClaim.claims
    .slice()
    .sort((a: any, b: any) => a.claimedAt - b.claimedAt);
  const winner = orderedMessageClaims[0];

  // Ganador
  const messageText = `${winner.User.username} tardó ${Math.abs(
    (getTimestamp(winner.mudaeMessageAt) - getTimestamp(winner.claimedAt)) /
      1000
  )} segundo(s) en reclamar a ${winner.metadata.authorName}`;
  embed.addFields({ name: "Zamuro Ganador", value: messageText });

  // Perdedores
  if (orderedMessageClaims.length > 1) {
    const messageLosers = orderedMessageClaims
      .slice(1)
      .reduce(
        (res: string, el: any) =>
          res +
          `${el.User.username} tardó ${Math.abs(
            (getTimestamp(el.mudaeMessageAt) - getTimestamp(el.claimedAt)) /
              1000
          )} segundo(s) en reclamar a ${el.metadata.authorName} \n`,
        ""
      );
    embed.addFields({ name: "Zamuros Perdedores", value: messageLosers });
  }

  return embed;
};
