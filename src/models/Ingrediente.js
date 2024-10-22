class Ingrendiente {

    constructor({ nomeIngrediente, quantidade, medida }) {

        this.nomeIngrediente = nomeIngrediente;
        this.quantidade = quantidade;
        this.medida = medida;
    }

    validate() {
        const errors = [];

        if (this.nomeIngrediente.length < 1 || this.nomeCriador.length > 20) {
            errors.push('Nome do ingrediente deve ter entre 1 e 20 caracteres.');
        }

        if (this.quantidade.length < 0) {
            errors.push('Quantidade deve ser acima de 0');
        }

        if (typeof this.medida === 'number') {
            errors.push('Medida deve ser uma sting, ex: Unidade, Centimetros.');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true };
    }

    async save(postagemId) {
        const { data, error } = await supabase
            .from('ingredientes')
            .insert([
                {
                    nomeingrediente: this.nomeIngrediente,
                    quantidade: this.quantidade,
                    medida: this.medida,
                    postagem_id: postagemId,
                },
            ]);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}

export default Ingrendiente;