/** @ignore */
const Command = require('./../Command');

class SlowClapCommand extends Command {

    /**
     * Sets up the command by providing the prefix, command trigger, any
     * aliases the command might have and additional options that
     * might be usfull for the abstract command class.
     */
    constructor() {
        super('slowclap', ['sc']);

        this.hashes = [
            '1f0e3dad99908345f7439f8ffabdffc4', '1ff1de774005f8da13f42943881c655f',
            '3c59dc048e8850243be8079a5c74d079', '4e732ced3463d06de0ca9a15b6153677',
            '6f4922f45568161a8cdf4ad2299f6d23', '8e296a067a37563370ded05f5a3bf3ec',
            '8f14e45fceea167a5a36dedd4bea2543', '9bf31c7ff062936a96d3c8bd1f8f2ff3',
            '45c48cce2e2d7fbdea1afc51c7c6ad26', '70efdf2ec9b086079795c442636b55fb',
            '98f13708210194c475687be6106a3b84', '6512bd43d9caa6e02c990b0a82652dca',
            '37693cfc748049e45d87b8c7d8b9aacd', '1679091c5a880faf6fb5e6087eb1b2dc',
            'a87ff679a2f3e71d9181a67b7542122c', 'aab3238922bcc25a6f606eb525ffdc56',
            'b6d767d2f8ed5d21a44b0e5886680cb9', 'c4ca4238a0b923820dcc509a6f75849b',
            'c9f0f895fb98ab9159f51fd0297e236d', 'c20ad4d76fe97759aa27a0c99bff6710',
            'c51ce410c124a10e0db5e4b97fc2af39', 'c74d97b01eae257e44aa9d5bade97baf',
            'c81e728d9d4c2f636f067f89cc14862c', 'd3d9446802a44259755d38e6d163e820',
            'e4da3b7fbbce2345d7772b0674a318d5', 'eccbc87e4b5ce2fe28308fd9f2a7baf3'
        ];
    }

    /**
     * Executes the given command.
     *
     * @param  {IUser}     sender   The Discordie user object that ran the command.
     * @param  {IMessage}  message  The Discordie message object that triggered the command.
     * @param  {Array}     args     The arguments that was parsed to the command.
     * @return {mixed}
     */
    onCommand(sender, message, args) {
        let index = Math.floor(Math.random() * (this.hashes.length - 1));

        return app.envoyer.sendNormalMessage(message, `https://media.senither.com/static/reactions/sc-${this.hashes[index]}.gif`);
    }
}

module.exports = SlowClapCommand;
