import { TEMAS_VALIDOS } from "../utils/temas_validos.js";

class Receita {
    constructor(receita) {
        this.titulo = receita.titulo;
        this.conteudo = receita.conteudo;
        this.isVerify = receita.isVerify || false;
        this.nomeusu = receita.nomeusu;
    }

    validate() {
        const errors = [];

        if (!this.titulo || this.titulo.length < 3 || this.titulo.length > 100) {
            errors.push("Título deve ter entre 3 e 100 caracteres.");
        }

        if (!this.conteudo || this.conteudo.length < 3 || this.conteudo.length > 2000) {
            errors.push("Conteúdo deve ter entre 3 e 2000 caracteres.");
        }

        if (!this.nomeusu) {
            errors.push("Nome do usuário é obrigatório.");
        }

        if (this.isVerify !== undefined && typeof this.isVerify !== 'boolean') {
            errors.push("IsVerify deve ser um valor booleano.");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

export default Receita;