import Tema from '../models/Tema.js';
import { supabase } from '../supabase/client.js';

class TemaController {

    async index(req, res) {
        try {
            const { data: temas, error } = await supabase
                .from('Tema')
                .select('*');

            if (error) {
                throw new Error('Erro ao buscar temas: ' + error.message);
            }

            return res.status(200).json(temas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar temas' });
        }
    }

    async store(req, res) {
        try {
            const novoTema = new Tema(req.body);

            const { valid, errors } = novoTema.validate();
            if (!valid) {
                return res.status(400).json({ errors });
            }

            const savedTema = await novoTema.save();
            return res.status(201).json(savedTema);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar tema' });
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params;
            const tema = await Tema.findById(id);

            if (!tema) {
                return res.status(404).json({ error: 'Tema não encontrado' });
            }

            return res.json(tema);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar tema' });
        }
    }

    async update(req, res) {
        try {
            const novoTema = new Tema(req.body);
    
            const { valid, errors } = novoTema.validate();
            if (!valid) {
                return res.status(400).json({ errors });
            }
    
            const { data: updatedTema, error: updateError } = await supabase
                .from('Tema')
                .update({
                    tema: novoTema.tema
                })
                .eq('id', req.params.id)
                .select();

            if (updateError) {
                return res.status(500).json({ error: updateError.message });
            }
    
            if (!updatedTema || updatedTema.length === 0) {
                return res.status(404).json({ error: 'Tema não encontrado' });
            }
    
            return res.status(200).json({ message: 'Tema atualizado com sucesso', data: updatedTema[0] });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar tema' });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
    
            const { data, error: deleteError } = await supabase
                .from('Tema')
                .delete()
                .eq('id', id)
                .select();
    
            if (deleteError) {
                return res.status(500).json({ error: deleteError.message });
            }
    
            if (!data || data.length === 0) {
                return res.status(404).json({ error: 'Tema não encontrado' });
            }
    
            return res.status(204).end();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar tema' });
        }
    }
}

export default new TemaController();