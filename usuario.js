class Jugador{
    constructor(id, name, mmr, stored_hash, salt){
        this.id = id;
        this.name = name;
        this.mmr = mmr;
        this.stored_hash = stored_hash;
        this.salt = salt;
    }
    get_id() {
        return this.id;
    }
    get_name(){
        return this.name;
    }
    get_mmr(){
        return this.mmr;
    }
    get_stored_hash(){
        return this.stored_hash;
    }
    get_salt(){
        return this.salt;
    }
    set_id(id) {
        this.id = id;
    }
    set_name(name){
        this.name = name;
    }
    set_mmr(mmr){
        this.mmr = mmr;
    }
    set_stored_hash(stored_hash){
        this.stored_hash = stored_hash;
    }
    set_salt(salt){
        this.salt = salt;
    }
    player_to_string(){
        return `jugador {id: ${this.id}, name: ${this.name}, mmr: ${this.mmr}}`;
    }
}

module.exports = Jugador;