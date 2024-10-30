import { TEMAS_VALIDOS } from "../utils/temas_validos.js";

class Receita {
    constructor(receita) {
        this.titulo = receita.titulo;
        this.conteudo = receita.conteudo;
        this.verificado = receita.verificado || false;
        this.autor = receita.autor;
        this.VerificadoPor = receita.VerificadoPor;
        this.subTema = receita.subTema;
        this.tema = receita.tema;
    }

    validate() {
        const errors = [];

        if (!this.titulo || this.titulo.length < 3 || this.titulo.length > 100) {
            errors.push("Título deve ter entre 3 e 100 caracteres.");
        }

        if (!this.conteudo || this.conteudo.length < 3 || this.conteudo.length > 2000) {
            errors.push("Conteúdo deve ter entre 3 e 2000 caracteres.");
        }

        if (!this.autor) {
            errors.push("Autor é obrigatório.");
        }

        if (!this.tema) {
            errors.push("Tema é obrigatório.");
        } else if (!TEMAS_VALIDOS.includes(this.tema)) {
            errors.push(`Tema inválido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}`);
        }

        if (!this.subTema) {
            errors.push("SubTema é obrigatório.");
        }

        if (this.verificado !== undefined && typeof this.verificado !== 'boolean') {
            errors.push("Verificado deve ser um valor booleano.");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

export default Receita;