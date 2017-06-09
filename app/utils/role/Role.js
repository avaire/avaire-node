class Role {

    /**
     * Checks if the context has the given role name.
     *
     * @param  {IGuildMember}  guildMember  The guild memer that should be checked.
     * @param  {String}        name         The role name that should be checked.
     * @return {Boolean}
     */
    has(guildMember, name) {
        return guildMember.roles.find(role => {
            return role.name.toLowerCase() === name.toLowerCase();
        }) !== undefined;
    }
}

module.exports = new Role;
