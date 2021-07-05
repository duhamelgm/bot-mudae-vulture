import dotenv from "dotenv";
dotenv.config();
import moment from "moment";
import { PrismaClient } from "@prisma/client";
import { formatMessage } from "./utils/format";

const Discord = require("discord.js");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"]
});

const prisma = new PrismaClient();

client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageReactionAdd", async (reaction: any, user: any) => {
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message: ", error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  // Mudae heart reaction
  if (
    !reaction._emoji ||
    !reaction._emoji.name ||
    reaction.message.channel.name !== "mudae-roll" ||
    reaction.message.embeds[0].description.includes("*Ruleta de animanga*") ||
    reaction.message.embeds[0].description.includes("Harem value") ||
    !["💓", "💕", "💖", "♥️", "💗", "💘", "❤️"].includes(reaction._emoji.name)
  )
    return;

  if (user.username === "Mudae") return;
  const date = moment(reaction.message.createdTimestamp);
  // Only edit messages newer than 2 minutes
  if (date < moment().subtract(30, "seconds")) return;

  // Less than a minute ago

  // Save claim

  //const date = moment(reaction.message.createdTimestamp);
  //const formatDate = date.format("h[:]mm[:]SSS");

  // Find if message exists
  // zamuro message
  let messageClaim: any = await prisma.messageClaim.upsert({
    update: {
      mudaeMessageId: reaction.message.id
    },
    create: {
      mudaeMessageId: reaction.message.id
    },
    where: {
      mudaeMessageId: reaction.message.id
    }
  });
  // Try to find user if existent
  const claimUser = await prisma.user.upsert({
    create: {
      discordUserId: user.id,
      username: user.username,
      discriminator: user.discriminator
    },
    update: {
      discordUserId: user.id,
      username: user.username,
      discriminator: user.discriminator
    },
    where: {
      discordUserId: user.id
    }
  });

  // mudae message
  const claim = await prisma.claim.upsert({
    create: {
      mudaeMessageId: reaction.message.id,
      metadata: {
        authorName: reaction.message.embeds[0].author.name
      },
      successfull: false,
      messageClaimId: messageClaim.id,
      userId: claimUser.id,
      claimedAt: new Date(),
      mudaeMessageAt: new Date(reaction.message.createdTimestamp)
    },
    update: {
      mudaeMessageId: reaction.message.id,
      metadata: {
        authorName: reaction.message.embeds[0].author.name
      },
      successfull: false,
      messageClaimId: messageClaim.id,
      userId: claimUser.id
    },
    where: {
      claimPerMessageConstraint: {
        mudaeMessageId: reaction.message.id,
        userId: claimUser.id
      }
    }
  });

  messageClaim = await prisma.messageClaim.findUnique({
    where: {
      mudaeMessageId: reaction.message.id
    },
    include: {
      claims: {
        include: {
          User: true
        }
      }
    }
  });

  const embed = formatMessage(messageClaim);

  let message: any;

  if (messageClaim.messageId) {
    message = await client.channels.cache
      .get(reaction.message.channel.id)
      .messages.fetch(messageClaim.messageId);
    await message.edit({ embed });
  } else {
    message = await reaction.message.channel.send({ embed });
  }

  //  If messageClaim.messageId exists then update
  //      messageClaim.messageId
  //  else
  //      create message

  // const messageText = `El/la zamuro/a tardo ${Math.abs(
  //   (date.utc().valueOf() - Date.now()) / 1000
  // )} segundo(s) en reclamar a ${reaction.message.embeds[0].author.name}`;

  // const firstEmbed = new Discord.MessageEmbed()
  //   .setTitle("ZAMUROS ASSEMBLED")
  //   .addFields({ name: user.username, value: messageText })
  //   .setColor([30, 215, 96]);
  // const message = await reaction.message.channel.send({ firstEmbed });

  // message.edit(newEmbed)

  // zamuro message
  messageClaim = await prisma.messageClaim.upsert({
    create: {
      mudaeMessageId: reaction.message.id,
      messageId: message.id
    },
    update: {
      mudaeMessageId: reaction.message.id,
      messageId: message.id
    },
    where: {
      mudaeMessageId: reaction.message.id
    }
  });
});

client.login(process.env.BOT_TOKEN);
