
import Dica from '../models/Dica.js';
import { supabase } from '../supabase/client.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';
import Subtema from "../models/Subtemas.js";

class DicaController {

    async create(req, res) {
        try {
            console.log(req.body);
            const dica = new Dica(req.body);
            const { valid, errors } = dica.validate();

            if (!valid) return handleError(res, errors, 400, 'Dica Inválida');

            const tema = req.body.tema;
            const subtemas = req.body.subtemas;

            if (!TEMAS_VALIDOS.includes(tema)) {
                return handleError(res, `O tema ${tema} não é um tema válido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}.`, 400, 'Tema inválido');
            }

            const subtemaObj = new Subtema(subtemas);
            const resultadoSubtema = await subtemaObj.validate();

            if (resultadoSubtema.erros.length > 0) {
                return handleError(res, resultadoSubtema.erros, 400, 'Erro ao processar subtemas');
            }

            const { data: dicaData, error: dicaError } = await supabase
                .from('dicas')
                .insert({
                    usuarioId: dica.usuarioId,
                    conteudo: dica.conteudo,
                }).select();

            if (dicaError) return handleError(res, dicaError.message, 500, dicaError.details);

            for (let subtema of subtemas) {
                const { data: temaSubtemaData, error: temaSubtemaError } = await supabase
                    .from('temaSubtema')
                    .select('*')
                    .eq('tema', tema)
                    .eq('subtema', subtema);

                if (temaSubtemaError) {
                    return handleError(res, temaSubtemaError.message, 500, 'Erro ao verificar relação tema-subtema');
                }

                if (temaSubtemaData.length === 0) {
                    const { error: insertTemaSubtemaError } = await supabase
                        .from('temaSubtema')
                        .insert({
                            tema: tema,
                            subtema: subtema,
                        });

                    if (insertTemaSubtemaError) {
                        return handleError(res, insertTemaSubtemaError.message, 500, 'Erro ao criar relação tema-subtema');
                    }
                }

                const { error: correlacaoError } = await supabase
                    .from('correlacaoDicas')
                    .insert({
                        idDicas: dicaData[0].id,
                        tema: tema,
                        subtema: subtema,
                    });

                if (correlacaoError) return handleError(res, correlacaoError.message, 500, correlacaoError.details);
            }

            return res.status(201).json({ message: 'Dica criada com sucesso', data: dicaData[0] });
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

            if (!valid) return handleError(res, errors, 400, 'Essa dica não é válida');

            const tema = req.body.tema;
            const subtemas = req.body.subtemas;

            const { data: updatedDica, error: updateError } = await supabase
                .from('dicas')
                .update({
                    conteudo: newDica.conteudo,
                })
                .eq('id', req.params.id)
                .select();

            if (updateError) return handleError(res, updateError.message, 500, updateError.details);
            if (!updatedDica) return handleError(res, `A dica com o código ${req.params.id} não foi encontrada.`, 404, 'Dica não encontrada');

            for (let subtema of subtemas) {
                const { data: temaSubtemaData, error: temaSubtemaError } = await supabase
                    .from('temaSubtema')
                    .select('*')
                    .eq('tema', tema)
                    .eq('subtema', subtema);

                if (temaSubtemaError) return handleError(res, temaSubtemaError.message, 500, 'Erro ao verificar relação tema-subtema');

                if (temaSubtemaData.length === 0) {
                    const { error: insertTemaSubtemaError } = await supabase
                        .from('temaSubtema')
                        .insert({
                            tema: tema,
                            subtema: subtema,
                        });

                    if (insertTemaSubtemaError) return handleError(res, insertTemaSubtemaError.message, 500, 'Erro ao atualizar relação tema-subtema');
                }

                const { error: updateCorrelacaoError } = await supabase
                    .from('correlacaoDicas')
                    .upsert({
                        idDicas: req.params.id,
                        tema: tema,
                        subtema: subtema,
                    });

                if (updateCorrelacaoError) return handleError(res, updateCorrelacaoError.message, 500, updateCorrelacaoError.details);
            }

            return res.status(200).json({ message: 'Dica e correlações atualizadas com sucesso', data: updatedDica[0] });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async delete(req, res) {
        try {
            const dicaId = req.params.id;

            const { error: deleteCorrelacaoError } = await supabase
                .from('correlacaoDicas')
                .delete()
                .eq('idDicas', dicaId);

            if (deleteCorrelacaoError) return handleError(res, deleteCorrelacaoError.message, 500, deleteCorrelacaoError.details);

            const { error: deleteDicaError } = await supabase
                .from('dicas')
                .delete()
                .eq('id', dicaId);

            if (deleteDicaError) return handleError(res, deleteDicaError.message, 500, deleteDicaError.details);

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

    async getDica(req, res) { 
        try {
            const tema = req.params.tema;
            const subtemas = req.params.subtema.split(',');

            
            const subtemasQuery = subtemas.map(subtema => `subtema.eq.${subtema}`).join(',');

            const { data: correlacoes, error: correlacaoError } = await supabase
                .from('correlacaoDicas') 
                .select()
                .eq("tema", tema)
                .or(subtemasQuery);

            if (correlacaoError) {
                console.error('Erro ao buscar correlações:', correlacaoError);
                return res.status(500).json({ error: `Erro ao buscar correlações de dicas: ${correlacaoError.message}` });
            }

            if (!correlacoes || correlacoes.length === 0) {
                return res.status(200).json([]);
            }

            
            const idsDicas = [...new Set(correlacoes.map(correlacao => correlacao.idDicas))]; 
            if (idsDicas.length === 0) {
                return res.status(200).json([]);
            }

            const { data: dicas, error: dicasError } = await supabase 
                .from('dicas')
                .select('*, correlacaoDicas(*)')
                .in('id', idsDicas)
                .eq('isVerify', true);

            if (dicasError) {
                console.error('Erro ao buscar dicas:', dicasError);
                return res.status(500).json({ error: `Erro ao buscar as dicas: ${dicasError.message}` });
            }

            return res.status(200).json(dicas);
        } catch (e) {
            console.error('Erro ao buscar dicas por subtemas:', e);
            return res.status(500).json({ error: `Erro interno ao processar a solicitação: ${e.message}` });
        }
    }
}

function handleError(res, detail = 'An error has occurred.', status = 500, message = 'Internal Server Error') {
    if (!res.headersSent) {
        return res.status(status).json({ message, detail });
    }
}

export default new DicaController();