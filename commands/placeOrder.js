const Customer = require("../models/customer");
const Bean = require("../models/bean");
const Discord = require("discord.js");

/* Place order using command arguments
   !order [origin] [amount in lbs]
   First check stock
   1. Find or create customer for user
   2. Create order
   2. Update Bean to reflect changes
   3. Ping headRoaster with order
   4. Reply to user

   TODO: Add functionality for blends
*/

//TODO: Can this be managed better?
// Channel id for posting order updates

function createTimestamp(d) {
  let year = d.getFullYear();
  let month = ("0" + (d.getMonth() + 1)).slice(-2);
  let day = ("0" + d.getDate()).slice(-2);
  let hours = d.getHours();
  let minutes = d.getMinutes();
  let seconds = d.getSeconds();
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//TODO: this is ugly, make this cleaner
function formatOrderEmbed(order, embed, title) {
  embed.setTitle(title);

  return embed;
}

//TODO: move these to a config file
// Embed templates
const notifyEmbed = new Discord.MessageEmbed()
  .setColor("#fce303")
  .setTitle("Order Update");
const successEmbed = new Discord.MessageEmbed()
  .setColor("#42ff00")
  .setTitle("Success");
const errorEmbed = new Discord.MessageEmbed()
  .setColor("#ff0000")
  .setTitle("Error");

async function getOrderChannel(client) {
  const ORDER_CHANNEL = "755153184682410076";
  try {
    const channel = await client.channels.fetch(ORDER_CHANNEL);
    return channel;
  } catch (e) {
    console.log(e);
    throw new Error(`Error finding orders channel: ${e}`);
  }
}

module.exports = {
  name: "order",
  description: "Place order",
  args: true,
  usage: "<origin> <amount>",
  execute(message, args) {
    (async () => {
      try {
        // Check stock for beans first
        const beanSearch = await Bean.findOne({
          origin: args[0].toLowerCase(),
          stock: { $gte: args[1] },
        });

        if (!beanSearch) {
          throw new Error(
            `Sorry! ${args[0]} either doesn't exist, or we don't have enough stock. \n Check available stock with \`!inventory\``
          );
        }

        beanSearch.stock -= args[1];
        let cust;
        const date = new Date();
        const result = await Customer.findOne({ discordId: message.author.id });
        //TODO: validation of arguments
        const order = {
          orderedItems: {
            origin: args[0],
            amount: args[1],
          },
          status: "pending",
          orderDate: createTimestamp(date),
        };
        // No customer found, create one
        if (!result) {
          cust = new Customer({
            name: message.author.username,
            discordId: message.author.id,
          });
          cust.orders.push(order);
        }
        // Customer exists, add a new order
        else {
          result.orders.push(order);
        }

        // Confirm order
        //TODO: refactor with async/await instead of thens
        const confirmations = ["yes", "no"];
        const filterId = result ? result.discordId : cust.discordId;
        const filter = (msg) =>
          msg.author.id === filterId &&
          confirmations.includes(msg.content.toLowerCase());
        message
          .reply(
            `You want to order ${order.orderedItems.amount} lbs of ${order.orderedItems.origin}. \n Is this correct?`
          )
          .then(() => {
            message.channel
              .awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] })
              .then(async (collected) => {
                if (collected.first().content === "yes") {
                  // Save database changes
                  if (result) {
                    await result.save();
                  } else {
                    await cust.save();
                  }
                  await beanSearch.save();

                  // Message customer
                  successEmbed.addField("Message", "Order confirmed!");
                  message.reply(successEmbed);

                  try {
                    const custSearch = await Customer.findOne(
                      {
                        name: message.author.username,
                      },
                      { _id: 0, orders: 1 }
                    )
                      .lean()
                      .sort({ orderDate: 1 });

                    console.log(custSearch);

                    const orderChannel = await getOrderChannel(message.client);

                    //orderChannel.send(orderChannelEmbed);
                  } catch (e) {
                    console.log(e);
                    errorEmbed.addFields(
                      {
                        name: "Error",
                        value: "There was an error notifying the roaster.",
                      },
                      { name: "Detail", value: e }
                    );
                    message.reply(errorEmbed);
                  }
                } else {
                  message.reply("order cancelled!");
                }
              })
              //TODO: capture address
              .catch((collected) => {
                console.log(collected);
                message.reply(
                  "Order confirmation timed out, please re-place your order."
                );
              });
          });
      } catch (e) {
        errorEmbed.addFields(
          { name: "Error", value: "There was an error placing your order" },
          { name: "Detail", value: e }
        );
        message.reply(errorEmbed);
      }
    })();
  },
};
