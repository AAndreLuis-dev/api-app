import {supabase} from "../supabase/client.js";

class Ingrediente {
    constructor({ nomeIngrediente, quantidade, medida }) {
        this.nomeIngrediente = nomeIngrediente;
        this.quantidade = quantidade;
        this.medida = medida;
    }

    validate() {
        const errors = [];

        if (this.nomeIngrediente.length < 1 || this.nomeIngrediente.length > 20) {
            errors.push('Nome do ingrediente deve ter entre 1 e 20 caracteres.');
        }

        if (this.quantidade <= 0) {
            errors.push('Quantidade deve ser maior que 0.');
        }

        if (typeof this.medida !== 'string') {
            errors.push('Medida deve ser uma string, ex: Unidade, Centímetros.');
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
                    ingrediente: this.nomeIngrediente,
                    quantidade: this.quantidade,
                    medida: this.medida,
                    postagemId: postagemId
                }
            ]);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}
export default Ingrediente;
