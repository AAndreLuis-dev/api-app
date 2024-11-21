import { supabase } from '../supabase/client.js';
import Tema from '../models/Tema.js';

const temaController = {
    async index(req, res) {
        try {
            const { data, error } = await supabase.from('tema').select('*');

            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar temas', details: error.message });
            }

            return res.status(200).json(data);

        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    },

    async checkIfExists(req, res) {
        try {
            const { id } = req.params;

            const tema = await Tema.findById(id);
            if (!tema) {
                return res.status(404).json({ exists: false });
            }

            return res.status(200).json({ exists: true });

        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    },

    async getSubtemasByTema(req, res) {

        const tema = req.params.tema;
        
        try {
            const { data: subtemasData, error } = await supabase
                .from('temaSubtema')
                .select('subtema')
                .eq('tema', tema);

            if (error) throw error;

            res.status(200).json(subtemasData);
        } catch (error) {
            res.status(500).json({
                error: "Erro ao buscar subtemas",
                details: error.message,
            });
        }
    },
    

    async delete(req, res) {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('tema')
                .delete()
                .eq('id', id)
                .select();

            if (error) {
                return res.status(500).json({ error: 'Erro ao deletar tema', details: error.message });
            }

            if (!data || data.length === 0) {
                return res.status(404).json({ error: `Tema com id ${id} não encontrado` });
            }

            return res.status(204).end();

        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    }
};

export default temaController;