const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const reportDB = require('../models/report.js')
const randomWords = require('random-words')
const mongoose = require('mongoose')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Reports a user.')
        .addUserOption((option) =>
            option.setName('reported')
            .setDescription('The member you want to report')
            .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('reason')
            .setDescription('Reason for the report')
            .setRequired(true)
        ),
    async execute(interaction, client) {
        let reportedUser = interaction.options.getMember('reported').user;
        let reason = interaction.options.getString('reason');
        let informant = interaction.user
        let identifier = `${randomWords()}.${randomWords()}.${randomWords()}`;

        let reportedEmbed = new MessageEmbed()
        let reportChannelEmbed = new MessageEmbed()

        if (reportedUser.bot) {
            reportedEmbed.setDescription("I can't report Bots.")
            .setColor('FFBF00');

            await interaction.reply({ embeds: [reportedEmbed] })
        } else if (informant.id === reportedUser.id) { 
            reportedEmbed.setDescription("You can't report yourself, silly!")
            .setColor('FFBF00');

            await interaction.reply({ embeds: [reportedEmbed], ephemeral: true });
        } else {

            reportedEmbed.setTitle("Report Sent.")
            .setColor('GREEN')
            .setDescription(`Remember this ID: \`${identifier}\``)
            await interaction.reply({ embeds: [reportedEmbed] })

            reportChannelEmbed.setTitle(`${reportedUser.tag} was reported. [Discord]`)            
            .setColor('FFBF00')
            .addFields(
                { name: 'Reported:', value: reportedUser.tag, inline: true},
                { name: 'Reported By:', value: informant.tag, inline: true},
                { name: 'Reason:', value: reason, inline: true},
            )
            .setFooter(`ID: \`${identifier}\``)
            .setTimestamp(new Date())
            client.channels.cache.get('992838852593070142').send({ embeds: [reportChannelEmbed] })

            const reportdb = new reportDB({
                _id: new mongoose.Types.ObjectId,
                reason: reason,
                reportedID: reportedUser.id,
                reporterID: interaction.user.id,
                identifier: identifier,
            })

            reportdb.save().catch();
        }
    }
}