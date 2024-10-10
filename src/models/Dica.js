class Dica {

    constructor({ codigo, nomeCriador, conteudo, tema, categoria }) {
        this.codigo = codigo || null;
        this.nomeCriador = nomeCriador;
        this.conteudo = conteudo;
        this.tema = tema;
        this.categoria = categoria;
    }

    validate() {
        const errors = [];

        if (this.nomeCriador.length < 3 || this.nomeCriador.length > 50) {
            errors.push('Nome do criador deve ter entre 3 e 50 caracteres.');
        }

        if (this.conteudo.length < 3 || this.conteudo.length > 1000) {
            errors.push('Conteúdo deve ter entre 3 e 1000 caracteres.');
        }

        if (typeof this.tema !== 'number') {
            errors.push('Tema deve ser um número.');
        }

        if (this.categoria.length < 3 || this.categoria.length > 100) {
            errors.push('Categoria deve ter entre 3 e 100 caracteres.');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true };
    }
}

export default Dica;