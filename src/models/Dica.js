import { TEMAS_VALIDOS } from "../utils/temas_validos.js";

class Dica {

    constructor({ codigo = null, nomeCriador, conteudo, categoria, tema, eVerificado = false, aprovadoPor = null }) {
        this.codigo = codigo;
        this.nomeCriador = nomeCriador;
        this.conteudo = conteudo;
        this.tema = tema;
        this.categoria = categoria;
        this.eVerificado = eVerificado;
        this.aprovadoPor = aprovadoPor;
    }

    validate() {
        const errors = [];

        if (!this.nomeCriador || typeof this.nomeCriador !== 'string' || !(3 < this.nomeCriador.length <= 50)) {
            errors.push('Nome do criador deve ser um texto e ter entre 3 e 50 caracteres.');
        }

        if (!this.conteudo || typeof this.conteudo !== 'string' || !(3 < this.conteudo.length < 1000)) {
            errors.push('Conteúdo deve ser um texto e ter entre 3 e 1000 caracteres.');
        }

        if (!this.tema || !TEMAS_VALIDOS.includes(this.tema)) {
            errors.push(`O tema ${this.tema} não é um tema válido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}.`);
        }

        if (!this.categoria || typeof this.categoria !== 'string' || !(3 < this.categoria.length < 100)) {
            errors.push('Categoria deve ser um texto e ter entre 3 e 100 caracteres.');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true };
    }
}

export default Dica;