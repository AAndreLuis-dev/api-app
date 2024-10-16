import { supabase } from '../supabase/client.js';
import Tema from '../models/Tema.js';

class TemaController {
    
    async index(req, res) {
        try {
            const { data, error } = await supabase
                .from('Temas')
                .select('*');

            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar temas', details: error.message });
            }

            return res.status(200).json(data);

        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { tema } = req.params;

            const { data, error } = await supabase
                .from('Temas')
                .delete()
                .eq('tema', tema);

            if (error) {
                return res.status(500).json({ error: 'Erro ao deletar tema', details: error.message });
            }

            if (data.length === 0) {
                return res.status(404).json({ error: `Tema ${tema} não encontrado` });
            }

            return res.status(204).end();

        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    }
}

export default new TemaController();
