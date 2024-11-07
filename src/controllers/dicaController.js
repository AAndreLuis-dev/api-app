import Dica from '../models/Dica.js';
import { supabase } from '../supabase/client.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';

class DicaController {

    async create(req, res) {
        try {
            console.log(req.body);
            const dica = new Dica(req.body);
            const { valid, errors } = dica.validate();

            if (!valid) return handleError(res, errors, 400, 'Dica Inválida');

            const { data, error } = await supabase
                .from('dicas')
                .insert({
                    usuarioId: dica.usuarioId,
                    conteudo: dica.conteudo,
                }).select();

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
                .select()
                .order('id', { ascending: false });

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
                .eq('id', req.params.id)
                .single();

            if (error || !dica) return handleError(res, `A dica com o código ${req.params.id} não foi encontrada.`, 404, 'Dica não encontrada');

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
                .update({
                    conteudo: newDica.conteudo,
                })
                .eq('id', req.params.id)
                .select();

            if (updateError) return handleError(res, updateError.message, 500, updateError.details);

            if (!updatedDica) {
                return handleError(res, `A dica com o código ${req.params.id} não foi encontrada.`, 404, 'Dica não encontrada');
            }

            return res.status(200).json({ message: 'Dica atualizada com sucesso', data: updatedDica[0] });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async delete(req, res) {
        console.log(req.params.id);
        try {
            const { error: deleteError } = await supabase
                .from('dicas')
                .delete()
                .eq('id', req.params.id);

            if (deleteError) return handleError(res, deleteError.message, 500, deleteError.details);

            return res.status(204).end();
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async verify(req, res) {
        try {
            const verifyBy = req.body.verifyBy;
            const id = req.params.id;

            if (!verifyBy) {
                return handleError(res, `O campo 'verifyBy' é obrigátorio.`, 400, 'Input inválido');
            }

            const { data: user, userError } = await supabase
                .from('usuarios')
                .select('isMonitor')
                .eq('email', verifyBy)
                .maybeSingle();

            if (!user || userError) {
                return handleError(res, `O usuário com o email ${verifyBy} não foi encontrado.`, 404, 'Usuário não encontrado');
            }

            if (!user.isMonitor) {
                return handleError(res, `O usuário com o email ${verifyBy} não é um monitor.`, 400, 'Usuário não é monitor');
            }

            const { data: dica, error } = await supabase
                .from('dicas')
                .update({
                    isVerify: true,
                    verifyBy: verifyBy,
                    ultimaAlteracao: new Date().toISOString()
                })
                .eq('id', id)
                .select();

            if (error) return handleError(res, error.message, 500, error.details);

            if (!dica) return handleError(res, `A dica com o código ${id} não foi encontrada.`, 404, 'Dica não encontrada');

            return res.status(200).json({ message: `A dica com o código ${id} foi verificada com sucesso pelo usuário com o email ${verifyBy}.` });
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

            const { data: idPost, error: idPostError } = await supabase
                .from('correlacaoDicas')
                .select('idDicas')
                .eq('tema', tema);

            if (idPostError) return handleError(res, idPostError.message, 500, idPostError.details);
            if (!idPost) return handleError(res, 'Nenhuma receita encontrada', 404);

            const { data: dicas, error } = await supabase
                .from('dicas')
                .select()
                .eq('isVerify', true)
                .in('id', idPost.map(post => post.idDicas));

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

            const { data: idPost, error: idPostError } = await supabase
                .from('correlacaoDicas')
                .select('idDicas')
                .eq('tema', tema);

            if (idPostError) return handleError(res, idPostError.message, 500, idPostError.details);
            if (!idPost) return handleError(res, 'Nenhuma receita encontrada', 404);

            const { data: dicas, error } = await supabase
                .from('dicas')
                .select()
                .eq('isVerify', false)
                .in('id', idPost.map(post => post.idDicas));

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

            const { data: idPost, error: idPostError } = await supabase
                .from('correlacaoDicas')
                .select('idDicas')
                .eq('tema', tema);

            if (idPostError) return handleError(res, idPostError.message, 500, idPostError.details);
            if (!idPost) return handleError(res, 'Nenhuma receita encontrada', 404);

            const { data: dicas, error } = await supabase
                .from('dicas')
                .select()
                .in('id', idPost.map(post => post.idDicas));

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