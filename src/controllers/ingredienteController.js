/* import Ingrediente from '../models/Ingrediente.js';
import { supabase } from '../supabase/client.js';

class IngredienteController {

    async store(req, res) {
        try {
            const ingrediente = new Ingrediente(req.body);

            const { valid, errors } = ingrediente.validate();

            if (!valid) {
                handleError(res, errors, 400, 'Ingrediente Inválido');
            }

            await ingrediente.save();

            return res.status(201).json({ message: 'Ingrediente adicionado com sucesso', data: data });

        } catch (e) {
            handleError(res, e.message)
        }
    }

    async index(req, res) {
        try {
            const { data: ingredientes, error } = await supabase
                .from('ingredientes')
                .select('nomeingrediente, quantidade, medida');

            if (error) throw error;

            return res.json(ingredientes);

        } catch (e) {
            handleError(res, e)
        }
    }


    async show(req, res) {
        try {
            const { data: ingrediente, error } = await supabase
                .from('ingredientes')
                .select()
                .eq('ingrediente_id', req.params.ingredienteId)
                .single();

            if (error || !ingrediente) {
                handleError(res, `O ingrediente com o Id ${req.params.ingredienteId} não foi encontrado.`, 404, 'Ingrediente não encontrado')
            }

            return res.json(ingrediente);
        } catch (e) {
            handleError(res, e.message);
        }
    }

    async update(req, res) {
        try {
            if (!valid) {
                return res.status(400).json({ message: 'Esse ingrediente não é válido', errors: errors });
            }

            const updateIngrediente = new Ingrediente(req.body);

            const { valid, errors } = updateIngrediente.validate();

            const { data: updatedIngrediente, error: updateError } = await supabase
                .from('ingredientes')
                .update([{
                    nomeIngrediente: updateIngrediente.nomeIngrediente,
                    quantidade: updateIngrediente.quantidade,
                    medida: updateIngrediente.medida,
                }])
                .eq('ingrediente_id', req.params.ingredienteId)
                .select();

            if (updateError) throw updateError;

            if (!updatedIngrediente) {
                handleError(res, `O ingrendiente com o id ${req.params.ingredienteId} não foi encontrado.`, 404, 'Ingrediente não encontrado')
            }

            return res.status(200).json({ message: 'Ingrediente atualizado com sucesso', data: updatedIngrediente[0] });

        } catch (e) {
            handleError(res, e.message);
        }
    }

    async delete(req, res) {
        try {
            const { data, error: deleteError } = await supabase
                .from('ingredientes')
                .delete()
                .eq('ingrediente_id', req.params.ingredienteId)
                .select();

            if (deleteError) throw deleteError;

            if (!data) {
                handleError(res, `O ingrendiente com o id ${req.params.ingredienteId} não foi encontrado.`, 404, 'Ingrediente não encontrado')
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

export default new IngredienteController(); */