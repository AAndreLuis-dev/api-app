import { supabase } from '../supabase/client.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';

class ReceitaController {
    async create(req, res) {
        let imageUrls = [];
        try {
            if (!req.body.titulo || !req.body.conteudo || !req.body.idUsuario || !req.body.tema || !req.body.subtema) {
                throw new Error('Campos obrigatórios: titulo, conteudo, idUsuario, tema e subtema');
            }

            const { data: usuario, error: userError } = await supabase
                .from('usuarios')
                .select('email')
                .eq('email', req.body.idUsuario)
                .single();

            if (userError || !usuario) {
                throw new Error('Usuário não encontrado');
            }

            const novaReceita = {
                titulo: req.body.titulo,
                conteudo: req.body.conteudo,
                isVerify: false,
                idUsuario: req.body.idUsuario,
                dataCriacao: new Date().toISOString(),
                ultimaAlteracao: new Date().toISOString()
            };

            const { data: receitaData, error: receitaError } = await supabase
                .from('receitas')
                .insert([novaReceita])
                .select()
                .single();

            if (receitaError) throw receitaError;

            const tema = req.body.tema;
            const subtemas = Array.isArray(req.body.subtema) ? req.body.subtema : [req.body.subtema];

            for (const subtema of subtemas) {
                const { data: subtemaData, error: subtemaError } = await supabase
                    .from('subTema')
                    .select('*')
                    .eq('descricao', subtema)
                    .single();

                if (subtemaError && subtemaError.code !== 'PGRST116') throw subtemaError;

                if (!subtemaData) {
                    const { error: createSubtemaError } = await supabase
                        .from('subTema')
                        .insert({ descricao: subtema });

                    if (createSubtemaError) throw createSubtemaError;
                }

                const { data: temaSubtemaData, error: temaSubtemaError } = await supabase
                    .from('temaSubtema')
                    .select('*')
                    .eq('tema', tema)
                    .eq('subtema', subtema)
                    .single();

                if (temaSubtemaError && temaSubtemaError.code !== 'PGRST116') throw temaSubtemaError;

                if (!temaSubtemaData) {
                    const { error: createTemaSubtemaError } = await supabase
                        .from('temaSubtema')
                        .insert({ tema, subtema });

                    if (createTemaSubtemaError) throw createTemaSubtemaError;
                }

                const { error: correlacaoError } = await supabase
                    .from('correlacaoReceitas')
                    .insert({
                        idReceita: receitaData.id,
                        tema,
                        subtema
                    });

                if (correlacaoError) throw correlacaoError;
            }

            // Upload das imagens
            if (req.files?.length > 0) {
                for (const file of req.files) {
                    const fileName = `${receitaData.id}-${Date.now()}-${file.originalname}`;
                    const { error: uploadError } = await supabase.storage
                        .from('fotosReceitas')
                        .upload(fileName, file.buffer, {
                            contentType: file.mimetype
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('fotosReceitas')
                        .getPublicUrl(fileName);

                    const { error: fotoError } = await supabase
                        .from('fotosReceitas')
                        .insert({
                            idFoto: Date.now(),
                            id: receitaData.id,
                            url: publicUrl,
                            createdAt: new Date().toISOString()
                        });

                    if (fotoError) throw fotoError;
                    imageUrls.push(publicUrl);
                }
            }

            return res.status(201).json({
                message: 'Receita criada com sucesso',
                data: {
                    ...receitaData,
                    fotos: imageUrls
                }
            });
        } catch (e) {
            return handleError(res, e.message);
        }
    }


    async getAll(req, res) {
        try {
            const { data: receitas, error: receitasError } = await supabase
                .from('receitas')
                .select('*, correlacaoReceitas(subtema)')
                .order('dataCriacao', { ascending: false });

            if (receitasError) throw receitasError;

            const receitasComFotos = await Promise.all(receitas.map(async (receita) => {
                const { data: fotos, error: fotosError } = await supabase
                    .from('fotosReceitas')
                    .select('*')
                    .eq('id', receita.id);

                if (fotosError) throw fotosError;

                return {
                    ...receita,
                    fotos: fotos || []
                };
            }));

            return res.json(receitasComFotos);
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getById(req, res) {
        try {
            const { data: receita, error: receitaError } = await supabase
                .from('receitas')
                .select(`
                    *, 
                    correlacaoReceitas(subtema),
                    ingredientes (
                        *
                    )
                    `
                )
                .eq('id', req.params.id)
                .single();

            if (receitaError) throw receitaError;
            if (!receita) return handleError(res, 'Receita não encontrada', 404);

            const { data: fotos, error: fotosError } = await supabase
                .from('fotosReceitas')
                .select('*')
                .eq('id', receita.id);

            if (fotosError) throw fotosError;

            return res.json({
                ...receita,
                fotos: fotos || []
            });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async update(req, res) {
        let imageUrls = [];
        try {
            console.log('1. Body recebido:', req.body);
            console.log('2. Files recebidos:', req.files?.length);

            // Validação dos dados recebidos
            if (!req.body.titulo && !req.body.conteudo && !req.files?.length) {
                return handleError(res, 'Nenhum dado para atualizar foi fornecido', 400);
            }

            const { data: receita, error: findError } = await supabase
                .from('receitas')
                .select('*')
                .eq('id', req.params.id)
                .single();

            if (findError || !receita) {
                return handleError(res, 'Receita não encontrada', 404);
            }

            // Buscar tema atual da receita
            const { data: correlacao, error: correlacaoError } = await supabase
                .from('correlacaoReceitas')
                .select('tema')
                .eq('idReceita', req.params.id)
                .single();

            if (correlacaoError) {
                throw new Error('Erro ao buscar tema atual da receita');
            }

            // Define tema atualizado
            const temaAtualizado = req.body.tema || correlacao.tema;

            // Atualizar subtemas, se fornecidos
            if (req.body.subtema && Array.isArray(req.body.subtema)) {
                // Remover subtemas antigos 
                await supabase
                    .from('correlacaoReceitas')
                    .delete()
                    .eq('idReceita', req.params.id);

                // Adicionar os novos subtemas
                const correlacaoReceitasData = req.body.subtema.map(subtema => ({
                    idReceita: receita.id,
                    subtema: subtema,
                    tema: temaAtualizado
                }));

                if (correlacaoReceitasData.length > 0) {
                    const { error: correlacaoError } = await supabase
                        .from('correlacaoReceitas')
                        .insert(correlacaoReceitasData);

                    if (correlacaoError) throw correlacaoError;
                }
            }

            // Se existem novas fotos
            if (req.files?.length > 0) {
                // Deletar fotos antigas
                const { data: fotosAntigas } = await supabase
                    .from('fotosReceitas')
                    .select('*')
                    .eq('id', req.params.id);

                if (fotosAntigas?.length > 0) {
                    for (const foto of fotosAntigas) {
                        const fileName = foto.url.split('/fotosReceitas/').pop();
                        await supabase.storage
                            .from('fotosReceitas')
                            .remove([fileName]);
                    }

                    await supabase
                        .from('fotosReceitas')
                        .delete()
                        .eq('id', req.params.id);
                }

                // Upload novas fotos
                for (const file of req.files) {
                    const fileName = `${receita.id}-${Date.now()}-${file.originalname}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('fotosReceitas')
                        .upload(fileName, file.buffer, {
                            contentType: file.mimetype
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('fotosReceitas')
                        .getPublicUrl(fileName);

                    const { error: fotoError } = await supabase
                        .from('fotosReceitas')
                        .insert({
                            idFoto: Date.now(),
                            id: receita.id,
                            url: publicUrl,
                            createdAt: new Date().toISOString()
                        });

                    if (fotoError) throw fotoError;
                    imageUrls.push(publicUrl);
                }
            }

            // Atualiza dados da receita
            const dadosAtualizados = {
                titulo: req.body.titulo || receita.titulo,
                conteudo: req.body.conteudo || receita.conteudo,
                isVerify: receita.isVerify,
                idUsuario: receita.idUsuario,
                verifyBy: receita.verifyBy,
                dataCriacao: receita.dataCriacao,
                ultimaAlteracao: new Date().toISOString()
            };

            const { data: receitaAtualizada, error: updateError } = await supabase
                .from('receitas')
                .update(dadosAtualizados)
                .eq('id', req.params.id)
                .select()
                .single();

            if (updateError) throw updateError;

            return res.json({
                message: 'Receita atualizada com sucesso',
                data: { ...receitaAtualizada, fotos: imageUrls }
            });

        } catch (e) {
            console.error('Erro completo:', e);
            if (imageUrls.length > 0) {
                for (const url of imageUrls) {
                    const fileName = url.split('/fotosReceitas/').pop();
                    await supabase.storage.from('fotosReceitas').remove([fileName]);
                }
            }
            return handleError(res, e.message);
        }
    }


    async delete(req, res) {
        try {
            const { data: receita, error: findError } = await supabase
                .from('receitas')
                .select('*')
                .eq('id', req.params.id)
                .single();

            if (findError || !receita) {
                return handleError(res, 'Receita não encontrada', 404);
            }

            // Primeiro, buscar todas as fotos da receita
            const { data: fotos, error: fotosError } = await supabase
                .from('fotosReceitas')
                .select('*')  // Alterado de 'url' para '*' para pegar todos os dados
                .eq('id', req.params.id);

            if (fotosError) throw fotosError;

            // Se existem fotos, deletar do bucket e da tabela
            if (fotos?.length > 0) {
                for (const foto of fotos) {
                    // Extrair o nome do arquivo da URL
                    const fileName = foto.url.split('/fotosReceitas/').pop();

                    console.log('Tentando deletar arquivo:', fileName);

                    const { error: deleteStorageError } = await supabase.storage
                        .from('fotosReceitas')
                        .remove([fileName]);

                    if (deleteStorageError) {
                        console.error('Erro ao deletar arquivo:', deleteStorageError);
                        throw deleteStorageError;
                    }
                }

                // Deletar registros da tabela fotosReceitas
                const { error: deleteFotosError } = await supabase
                    .from('fotosReceitas')
                    .delete()
                    .eq('id', req.params.id);

                if (deleteFotosError) throw deleteFotosError;
            }

            // Por fim, deletar a receita
            const { error: deleteError } = await supabase
                .from('receitas')
                .delete()
                .eq('id', req.params.id);

            if (deleteError) throw deleteError;

            return res.json({
                message: 'Receita e fotos deletadas com sucesso'
            });

        } catch (e) {
            console.error('Erro completo:', e);
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

            const { data: receita, error } = await supabase
                .from('receitas')
                .update({
                    isVerify: true,
                    verifyBy: verifyBy,
                    ultimaAlteracao: new Date().toISOString()
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!receita) return handleError(res, 'Receita não encontrada', 404);

            return res.json({
                message: 'Receita verificada com sucesso',
                data: receita
            });
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
                .from('correlacaoReceitas')
                .select('idReceita')
                .eq('tema', tema);

            if (idPostError) return handleError(res, idPostError.message, 500, idPostError.details);
            if (!idPost) return handleError(res, 'Nenhuma receita encontrada', 404);

            const { data: receitas, error } = await supabase
                .from('receitas')
                .select()
                .in('id', idPost.map(post => post.idReceita))
                .eq('isVerify', true);
            if (error) return handleError(res, error.message, 500, error.details);
            return res.status(200).json(receitas);
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
                .from('correlacaoReceitas')
                .select('idReceita')
                .eq('tema', tema);

            if (idPostError) return handleError(res, idPostError.message, 500, idPostError.details);
            if (!idPost) return handleError(res, 'Nenhuma receita encontrada', 404);

            const { data: receitas, error } = await supabase
                .from('receitas')
                .select()
                .in('id', idPost.map(post => post.idReceita))
                .eq('isVerify', false);
            if (error) return handleError(res, error.message, 500, error.details);
            return res.status(200).json(receitas);
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
                .from('correlacaoReceitas')
                .select('idReceita')
                .eq('tema', tema);

            if (idPostError) return handleError(res, idPostError.message, 500, idPostError.details);
            if (!idPost) return handleError(res, 'Nenhuma receita encontrada', 404);

            const { data: receitas, error } = await supabase
                .from('receitas')
                .select()
                .in('id', idPost.map(post => post.idReceita));

            if (error) return handleError(res, error.message, 500, error.details);
            return res.status(200).json(receitas);
        } catch (e) {
            return handleError(res, e.message);
        }
    }



    async getReceitasPorSubtemas(req, res) {
        try {
            const tema = req.params.tema;
            const subtemas = req.params.subtema.split(',');

            const subtemasQuery = subtemas.map(subtema => `subtema.eq.${subtema}`).join(',');

            const { data: correlacoes, error: correlacaoError } = await supabase
                .from('correlacaoReceitas')
                .select()
                .eq("tema", tema)
                .or(subtemasQuery);

            if (correlacaoError) {
                console.error('Erro ao buscar correlações:', correlacaoError);
                return res.status(500).json({ error: `Erro ao buscar correlações de receitas: ${correlacaoError.message}` });
            }

            if (!correlacoes || correlacoes.length === 0) {
                return res.status(200).json([]);
            }

            const idsReceitas = [...new Set(correlacoes.map(correlacao => correlacao.idReceita))];
            if (idsReceitas.length === 0) {
                return res.status(200).json([]);
            }

            const { data: receitas, error: receitasError } = await supabase
                .from('receitas')
                .select('*, correlacaoReceitas(*)')
                .in('id', idsReceitas)
                .eq('isVerify', true);

            if (receitasError) {
                console.error('Erro ao buscar receitas:', receitasError);
                return res.status(500).json({ error: `Erro ao buscar as receitas: ${receitasError.message}` });
            }

            return res.status(200).json(receitas);
        }
        catch (e) {
            console.error('Erro ao buscar receitas por subtemas:', e);
            return res.status(500).json({ error: `Erro interno ao processar a solicitação: ${e.message}` });
        }
    }
}

function handleError(res, detail = 'Ocorreu um erro.', status = 500) {
    console.error('Erro:', detail);
    if (!res.headersSent) {
        return res.status(status).json({
            message: 'Erro',
            detail
        });
    }
}

export default new ReceitaController();
