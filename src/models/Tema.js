import { supabase } from '../supabase/client.js';

class Tema {
    constructor({ id, descricao }) {
        this.id = id;
        this.descricao = descricao;
    }

    validate() {
        const errors = [];

        if (!this.descricao || typeof this.descricao !== 'string') {
            errors.push(`A descrição "${this.descricao}" não é válida.`);
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true };
    }

    async save() {
        const { data, error } = await supabase
            .from('tema')
            .insert([{ descricao: this.descricao }])
            .select();

        if (error) {
            throw new Error('Erro ao salvar o tema: ' + error.message);
        }

        return data[0];
    }

    static async findById(id) {
        const { data, error } = await supabase
            .from('tema')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return null;
        }

        return data;
    }

    static async deleteById(id) {
        const { data, error } = await supabase
            .from('tema')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            throw new Error('Erro ao deletar o tema: ' + error.message);
        }

        return data;
    }
}

export default Tema;