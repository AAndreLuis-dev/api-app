import Dica from '../models/Dica.js';
import { supabase } from '../supabase/client.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';

class DicaController {

    async create(req, res) {
        try {

            const dica = new Dica(req.body);
            const { valid, errors } = dica.validate();

            if (!valid) return handleError(res, errors, 400, 'Dica Inválida');

            const { data, error } = await supabase
                .from('dicas')
                .insert([{
                    nomecriador: dica.nomeCriador,
                    conteudo: dica.conteudo,
                    tema: dica.tema,
                    categoria: dica.categoria,
                    Isverificada: dica.isAprovado || false,
                    AprovadoPor: dica.aprovadoPor
                }]).select();

            if (error) return handleError(res, error.message, 500, error.details);

            return res.status(201).json({ message: 'Dica criada com sucesso', data: data[0] });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getAll(_req, res) {

        try {
            const { data: dicas, error } = await supabase
                .from('dicas')
                .select();

            if (error) return handleError(res, error.message, 500, error.details);

            return res.status(200).json(dicas);

        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getByCode(req, res) {
        try {
            const { data: dica, error } = await supabase
                .from('dicas')
                .select()
                .eq('codigo', req.params.codigo)
                .single();

            if (error || !dica) return handleError(res, `A dica com o código ${req.params.codigo} não foi encontrada.`, 404, 'Dica não encontrada');

            return res.json(dica);
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async update(req, res) {
        try {
            const newDica = new Dica(req.body);
            const { valid, errors } = newDica.validate();

            if (!valid) {
                return handleError(res, errors, 400, 'Essa dica não é válida');
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

            if (updateError) return handleError(res, updateError.message, 500, updateError.details);

            if (!updatedDica) {
                return handleError(res, `A dica com o código ${req.params.codigo} não foi encontrada.`, 404, 'Dica não encontrada');
            }

            return res.status(200).json({ message: 'Dica atualizada com sucesso', data: updatedDica[0] });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async delete(req, res) {
        try {
            const { data, error: deleteError } = await supabase
                .from('dicas')
                .delete()
                .eq('codigo', req.params.codigo)
                .select();

            if (deleteError) return handleError(res, deleteError.message, 500, deleteError.details);

            if (!data) {
                return handleError(res, `A dica com o código ${req.params.codigo} não foi encontrada.`, 404, 'Dica não encontrada');
            }

            return res.status(204).end();
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async verify(req, res) {
        try {
            const aprovadoPor = req.body.AprovadoPor;
            const codigo = req.params.codigo;

            if (!aprovadoPor) {
                return handleError(res, `O campo 'AprovadoPor' é obrigátorio.`, 400, 'Input inválido');
            }

            const { data: user, userError } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, niveldeconcientizacao, ismonitor')
                .eq('email', aprovadoPor)
                .maybeSingle();

            if (!user || userError) {
                return handleError(res, `O usuário com o email ${aprovadoPor} não foi encontrado.`, 404, 'Usuário não encontrado');
            }

            if (!user.ismonitor) {
                return handleError(res, `O usuário com o email ${aprovadoPor} não é um monitor.`, 400, 'Usuário não é monitor');
            }

            const { data: dica, error } = await supabase
                .from('dicas')
                .update({
                    Isverificada: true,
                    AprovadoPor: aprovadoPor
                })
                .eq('codigo', codigo)
                .select();

            if (error) return handleError(res, error.message, 500, error.details);

            if (!dica) return handleError(res, `A dica com o código ${codigo} não foi encontrada.`, 404, 'Dica não encontrada');

            return res.status(200).json({ message: `A dica com o código ${codigo} foi verificada com sucesso pelo usuário com o email ${aprovadoPor}.` });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getAllVerifiedByTheme(req, res) {
        try {

            const { tema } = req.params;

            if (!TEMAS_VALIDOS.includes(tema)) {
                return handleError(res, `O tema ${tema} não é um tema válido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}.`, 400, 'Input inválido');
            }

            const { data: dicas, error } = await supabase
                .from('dicas')
                .select()
                .eq('Isverificada', true)
                .eq('tema', tema);

            if (error) return handleError(res, error.message, 500, error.details);

            return res.status(200).json(dicas);
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getAllNotVerifiedByTheme(req, res) {
        try {

            const { tema } = req.params;

            if (!TEMAS_VALIDOS.includes(tema)) {
                return handleError(res, `O tema ${tema} não é um tema válido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}.`, 400, 'Input inválido');
            }

            const { data: dicas, error } = await supabase
                .from('dicas')
                .select()
                .eq('Isverificada', false)
                .eq('tema', tema);

            if (error) return handleError(res, error.message, 500, error.details);

            return res.status(200).json(dicas);
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getAllByTheme(req, res) {
        try {

            const { tema } = req.params;

            if (!TEMAS_VALIDOS.includes(tema)) {
                return handleError(res, `O tema ${tema} não é um tema válido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}.`, 400, 'Input inválido');
            }

            const { data: dicas, error } = await supabase
                .from('dicas')
                .select()
                .eq('tema', tema);

            if (error) return handleError(res, error.message, 500, error.details);

            return res.status(200).json(dicas);
        } catch (e) {
            return handleError(res, e.message);
        }
    }
}

function handleError(res, detail = 'An error has occurred.', status = 500, message = 'Internal Server Error') {
    if (!res.headersSent) {
        return res.status(status).json({ message, detail });
    }
}

export default new DicaController();