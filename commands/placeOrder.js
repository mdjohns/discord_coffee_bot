const Customer = require("../models/customer");
const Bean = require("../models/bean");
const Discord = require("discord.js");
const moment = require("moment");
const { amountPrecision } = require("../config.json");
const Embeds = require("../embeds");
const Util = require("../utils");
const generateOrderNumber = require("../utils/generateOrderNumber");

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
async function getOrderChannel(client) {
  const ORDER_CHANNEL = "755493354728456322";
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
        const originArg = args[0];
        const amountArg = args[1];

        if (isNaN(amountArg)) {
          throw new Error("Invalid amount! Please try again.");
        } else if (!Util.checkPrecision(amountArg, amountPrecision)) {
          throw new Error("Amount too precise! Please try again.");
        }
        // Check stock for beans first
        const beanSearch = await Bean.findOne({
          origin: originArg.toLowerCase(),
          stock: { $gte: amountArg },
        });

        if (!beanSearch) {
          throw new Error(
            `Sorry! ${originArg} either doesn't exist, or we don't have enough stock. \n Check available stock with \`!inventory\``
          );
        }

        beanSearch.stock -= amountArg;
        let cust;
        const result = await Customer.findOne({ discordId: message.author.id });

        //TODO: this should probably use model constructor
        let order = {
          orderedItems: {
            origin: originArg,
            amount: amountArg,
          },
          status: "pending",
          orderDate: moment().format("ddd MMM D YYYY hh:mm:ss"),
        };
        // No customer found, create one
        if (!result) {
          cust = new Customer({
            name: message.author.username,
            discordId: message.author.id,
          });

          // First order
          order.orderNum = Util.generateOrderNumber(cust.name, 0);
          cust.orders.push(order);
        }
        // Customer exists, add a new order
        else {
          order.orderNum = Util.generateOrderNumber(result.name, num);
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
                  const orderUser = collected.first().author;
                  // Save database changes
                  if (result) {
                    await result.save();
                  } else {
                    await cust.save();
                  }
                  await beanSearch.save();

                  // Message customer
                  let embed = Embeds.SuccessEmbed;
                  embed.addField("Message", "Order confirmed!");
                  message.reply(embed);

                  try {
                    // Send notification to roaster
                    const orderChannel = await getOrderChannel(message.client);
                    let orderEmbed = Embeds.InfoEmbed;
                    orderEmbed.setTitle("Order Update");
                    orderEmbed.addFields(
                      { name: "Customer", value: orderUser },
                      {
                        name: "Order Details",
                        value: Util.stringifyObject(order),
                      }
                    );
                    orderChannel.send(orderEmbed);
                  } catch (e) {
                    console.log(e);
                    let embed = Embeds.ErrorEmbed;
                    embed.addFields(
                      {
                        name: "Message",
                        value:
                          "There was an error notifying the roaster." +
                          "\n There is no need to re-place your order, but please let the roaster know you placed it!",
                      },
                      { name: "Detail", value: `\`${e}\`` }
                    );
                    message.reply(embed);
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
        let embed = Embeds.ErrorEmbed;
        embed.addFields(
          { name: "Error", value: "We encountered an error." },
          { name: "Detail", value: e }
        );
        message.reply(embed);
      }
    })();
  },
};
