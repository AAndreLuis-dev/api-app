class Receita {
    constructor({ codigo, titulo, imgURL, conteudo, categoria, verificado, tema, autor, verificadoPor }) {
        this.codigo = codigo || null;
        this.titulo = titulo;
        this.imgURL = imgURL;
        this.conteudo = conteudo;
        this.categoria = categoria;
        this.verificado = verificado || false;
        this.autor = autor;
        this.tema = tema || null;
        this.verificadoPor = verificadoPor || null;
    }

    validate() {
        const errors = [];

        if (typeof this.titulo !== 'string' || this.titulo.length < 3 || this.titulo.length > 100) {
            errors.push('Título deve ter entre 3 e 100 caracteres.');
        }

        if (typeof this.imgURL !== 'string' || this.imgURL.length > 500) {
            errors.push('URL da imagem deve ter no máximo 500 caracteres.');
        }

        if (typeof this.conteudo !== 'string' || this.conteudo.length < 3 || this.conteudo.length > 2000) {
            errors.push('Conteúdo deve ter entre 3 e 2000 caracteres.');
        }

        if (typeof this.categoria !== 'string' || this.categoria.length < 3 || this.categoria.length > 100) {
            errors.push('Categoria deve ter entre 3 e 100 caracteres.');
        }

        if (typeof this.verificado !== 'boolean') {
            errors.push('Verificado deve ser um valor booleano.');
        }

        if (typeof this.tema !== 'string' || this.tema.length === 0) {
            errors.push('Tema deve ser uma string não vazia.');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true };
    }
}

export default Receita;