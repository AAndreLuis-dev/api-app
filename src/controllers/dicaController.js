import Dica from '../models/Dica.js';
import { supabase } from '../supabase/client.js';

class DicaController {

    async create(req, res) {
        try {
            const dica = new Dica(req.body);
            console.log(dica);
            const { valid, errors } = dica.validate();

            if (!valid) {
                handleError(res, errors, 400, 'Dica Inválida');
            }

            const { data, error } = await supabase
                .from('dicas')
                .insert([
                    {
                        codigo: dica.codigo || null,
                        nomecriador: dica.nomeCriador,
                        conteudo: dica.conteudo,
                        tema: dica.tema,
                        categoria: dica.categoria,
                        Isverificada: dica.isAprovado,
                        AprovadoPor: dica.aprovadoPor
                    },
                ])
                .select();

            if (error) throw error;

            return res.status(201).json({ message: 'Dica criada com sucesso', data: data });
        } catch (e) {
            console.log(e);
            handleError(res, e.message)
        }
    }

    async getAll(req, res) {
        try {
            const { data: dicas, error } = await supabase
                .from('dicas')
                .select();

            if (error) throw error;

            return res.status(200).json(dicas);
        } catch (e) {
            handleError(res, e)
        }
    }


    async getByCode(req, res) {
        try {
            const { data: dica, error } = await supabase
                .from('dicas')
                .select()
                .eq('codigo', req.params.codigo)
                .single();

            if (error || !dica) {
                handleError(res, `A dica com o código ${req.params.codigo} não foi encontrada.`, 404, 'Dica não encontrada')
            }

            return res.json(dica);
        } catch (e) {
            handleError(res, e.message);
        }
    }

    async update(req, res) {
        try {

            const newDica = new Dica(req.body);

            const { valid, errors } = newDica.validate();

            if (!valid) {
                return res.status(400).json({ message: 'Essa dica não é válida', errors: errors });
            }

            const { data: updatedDica, error: updateError } = await supabase
                .from('dicas')
                .update([{
                    nomecriador: newDica.nomeCriador,
                    conteudo: newDica.conteudo,
                    tema: newDica.tema,
                    categoria: newDica.categoria,
                    Isverificada: newDica.isAprovado,
                    AprovadoPor: newDica.aprovadoPor
                }])
                .eq('codigo', req.params.codigo)
                .select();

            if (updateError) throw updateError;

            if (!updatedDica) {
                handleError(res, `A dica com o código ${req.params.codigo} não foi encontrada.`, 404, 'Dica não encontrada')
            }

            return res.status(200).json({ message: 'Dica atualizada com sucesso', data: updatedDica[0] });

        } catch (e) {
            handleError(res, e.message);
        }
    }

    async delete(req, res) {
        try {

            const { data, error: deleteError } = await supabase
                .from('dicas')
                .delete()
                .eq('codigo', req.params.codigo)
                .select();

            if (deleteError) throw deleteError;

            if (!data) {
                handleError(res, `A dica com o código ${req.params.codigo} não foi encontrada.`, 404, 'Dica não encontrada')
            }

            return res.status(204).end();

        } catch (e) {
            handleError(res, e.message)
        }
    }
}

function handleError(res, detail = 'An error has occurred.', status = 500, message = 'Internal Server Error') {
    if (!res.headersSent) {
        return res.status(status).json({ message: message, detail: detail });
    }
}

export default new DicaController();