import { supabase } from '../supabase/client.js';

class TemaController {
    
    async index(req, res) {
        try {
            const { data, error } = await supabase
                .from('tema')
                .select('*');

            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar temas', details: error.message });
            }

            return res.status(200).json(data);

        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    }

    async checkIfExists(req, res) {
        try {
            const { tema } = req.params;
    
            const { data, error } = await supabase
                .from('tema')
                .select('tema')
                .eq('tema', tema)
                .single();
    
            if (error || !data) {
                return res.status(404).json({ error: `Tema não encontrado.` });
            }
    
            return res.status(200).json({ message: `O Tema existe.` });

        } catch (error) {
            console.error('Erro no servidor:', error.message);
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    }
    

    async delete(req, res) {
        try {
            const { tema } = req.params;
    
            const { error } = await supabase
                .from('tema')
                .delete()
                .eq('tema', tema);
    
            if (error) {
                console.log('Erro retornado pela Supabase:', error.message);
                return res.status(500).json({ error: 'Erro ao deletar tema', details: error.message });
            }
            
            return res.status(204).end();
        } catch (error) {
            console.error('Erro no servidor:', error.message);
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    }

    async getSubtemas(req, res) {
        try {
            const { tema } = req.params;

            const { data, error } = await supabase
            .from('subTema')
            .select('*')
            .eq('subTemas', tema);

            if (error) {
                return res.status(500).json({ error: 'Erro ao buscar subtemas', details: error.message });
                }

            if (!data || data.length === 0) {
                return res.status(404).json({ error: `Nenhum subtema encontrado para o tema "${tema}".` });
            }

            return res.status(200).json(data);

        } catch (error) {
            console.error('Erro no servidor:', error.message);
            return res.status(500).json({ error: 'Erro no servidor', details: error.message });
        }
    }


}

export default new TemaController();
