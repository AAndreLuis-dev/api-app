import Receita from '../models/Receita.js';
import { supabase } from '../supabase/client.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';
import multer from 'multer';

class ReceitaController {

    async create(req, res) {
        let imageUrls = [];

        try {
            console.log('1. Dados recebidos:', req.body);

            // Validar dados obrigatórios
            if (!req.body.Titulo || !req.body.Conteudo || !req.body.nomeusu) {
                throw new Error('Campos obrigatórios: Titulo, Conteudo e nomeusu');
            }

            // Criar objeto com os nomes EXATOS das colunas
            const novaReceita = {
                "Titulo": req.body.Titulo,      // Exatamente como está no banco
                "Conteudo": req.body.Conteudo,  // Exatamente como está no banco
                "IsVerify": false,              // Exatamente como está no banco
                "nomeusu": req.body.nomeusu     // Exatamente como está no banco
            };

            console.log('2. Dados para inserção:', novaReceita);

            const { data: receitaData, error: receitaError } = await supabase
                .from('receitas')
                .insert([novaReceita])
                .select()
                .single();

            if (receitaError) {
                console.log('Erro ao criar receita:', receitaError);
                throw receitaError;
            }

            const subtemas = new Subtema(req.body.subtemas);
            const resultSubtemas = await subtemas.validate();

            for (const subtema of resultSubtemas.subtemasExistentes) {
                const { data, error } = await supabase
                    .from('correlacaoReceitas')
                    .insert([{ idReceita: receitaData.Id, subtema: subtema }]);
                if (error) throw error;
            }

            // Upload das imagens
            if (req.files?.length > 0) {
                for (const file of req.files) {
                    const fileName = `${receitaData.Id}-${Date.now()}-${file.originalname}`;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('fotosReceitas')
                        .upload(fileName, file.buffer, {
                            contentType: file.mimetype
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('fotosReceitas')
                        .getPublicUrl(fileName);

                    imageUrls.push(publicUrl);
                }
            }

            return res.status(201).json({
                message: 'Receita criada com sucesso',
                data: {
                    ...receitaData,
                    imagens: imageUrls
                }
            });

        } catch (e) {
            console.log('Erro completo:', e);
            if (imageUrls.length > 0) {
                for (const url of imageUrls) {
                    const fileName = url.split('/').pop();
                    await supabase.storage.from('fotosReceitas').remove([fileName]);
                }
            }
            return handleError(res, e.message);
        }
    }

    async getAll(req, res) {
        try {
            // Buscar todas as receitas
            const { data: receitas, error } = await supabase
                .from('receitas')
                .select('*, correlacaoReceitas(subtema)');

            if (error) throw error;

            // Buscar primeira imagem de cada receita
            const receitasComImagens = await Promise.all(receitas.map(async (receita) => {
                const { data } = await supabase.storage
                    .from('fotosReceitas')
                    .list('', {
                        limit: 1,
                        search: `${receita.codigo}-`
                    });

                const imagem = data && data[0] ?
                    supabase.storage
                        .from('fotosReceitas')
                        .getPublicUrl(data[0].name).data.publicUrl
                    : null;

                return {
                    ...receita,
                    imagem
                };
            }));

            return res.json(receitasComImagens);
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getByCode(req, res) {
        try {
            // Buscar receita usando 'Id' (com I maiúsculo)
            const { data: receita, error } = await supabase
                .from('receitas')
                .select('*')
                .eq('Id', req.params.codigo)
                .single();

            if (error) {
                console.log('Erro ao buscar receita:', error);
                throw error;
            }

            if (!receita) {
                return handleError(res, 'Receita não encontrada', 404);
            }

            // Buscar imagens da receita
            const { data: arquivos } = await supabase.storage
                .from('fotosReceitas')
                .list('', {
                    search: `${receita.Id}-`
                });

            // Gerar URLs públicas
            const imagens = arquivos ? arquivos.map(arquivo =>
                supabase.storage
                    .from('fotosReceitas')
                    .getPublicUrl(arquivo.name).data.publicUrl
            ) : [];

            return res.json({
                ...receita,
                imagens
            });
        } catch (e) {
            console.log('Erro:', e);
            return handleError(res, e.message);
        }
    }

    async update(req, res) {
        try {
            console.log('1. Iniciando atualização da receita:', req.params.codigo);

            // 1. Verificar se a receita existe
            const { data: receita, error: findError } = await supabase
                .from('receitas')
                .select('*')
                .eq('Id', req.params.codigo)  // Usando 'Id' com I maiúsculo
                .single();

            if (findError) {
                console.log('Erro ao buscar receita:', findError);
                throw findError;
            }

            if (!receita) {
                console.log('Receita não encontrada:', req.params.codigo);
                return res.status(404).json({
                    message: 'Receita não encontrada',
                    detail: `Não existe receita com Id ${req.params.codigo}`
                });
            }

            // 2. Preparar dados para atualização
            const dadosAtualizados = {
                "Titulo": req.body.Titulo,      // Exatamente como está no banco
                "Conteudo": req.body.Conteudo,  // Exatamente como está no banco
                "nomeusu": req.body.nomeusu     // Exatamente como está no banco
            };

            console.log('2. Dados para atualização:', dadosAtualizados);

            // 3. Se houver novas imagens, remover as antigas
            if (req.files?.length > 0) {
                console.log('3. Processando novas imagens');

                // Listar imagens antigas
                const { data: arquivosAntigos } = await supabase.storage
                    .from('fotosReceitas')
                    .list('', {
                        search: `${receita.Id}-`
                    });

                // Remover imagens antigas
                if (arquivosAntigos?.length > 0) {
                    await supabase.storage
                        .from('fotosReceitas')
                        .remove(arquivosAntigos.map(a => a.name));
                }

                // Upload das novas imagens
                const imageUrls = [];
                for (const file of req.files) {
                    const fileName = `${receita.Id}-${Date.now()}-${file.originalname}`;

                    const { error: uploadError } = await supabase.storage
                        .from('fotosReceitas')
                        .upload(fileName, file.buffer, {
                            contentType: file.mimetype
                        });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('fotosReceitas')
                        .getPublicUrl(fileName);

                    imageUrls.push(publicUrl);
                }

                console.log('4. Novas imagens processadas:', imageUrls);
            }

            // 4. Atualizar dados da receita
            const { data: updatedReceita, error: updateError } = await supabase
                .from('receitas')
                .update(dadosAtualizados)
                .eq('Id', req.params.codigo)  // Usando 'Id' com I maiúsculo
                .select()
                .single();

            if (updateError) throw updateError;

            console.log('5. Receita atualizada com sucesso');

            // 5. Gerenciar subtemas
            const subtemas = new Subtema(req.body.subtemas);
            const resultSubtemas = await subtemas.validate();

            // 6. Deletar subtemas que não existem mais
            await supabase
                .from('correlacaoReceitas')
                .delete()
                .eq('idReceita', req.params.codigo)
                .not('subtema', 'in', `(${resultSubtemas.subtemasExistentes.map(st => `'${st}'`).join(',')})`);

            // 7. Inserir novos subtemas
            for (const subtema of resultSubtemas.subtemasExistentes) {
                const { error: insertError } = await supabase
                    .from('correlacaoReceitas')
                    .insert([{ idReceita: req.params.codigo, subtema }]);

                if (insertError) throw insertError;
            }

            return res.json({
                message: 'Receita atualizada com sucesso',
                data: updatedReceita
            });

        } catch (e) {
            console.log('Erro completo:', e);
            return handleError(res, e.message);
        }
    }

    async delete(req, res) {
        try {
            // 1. Verificar se a receita existe
            const { data: receita, error: findError } = await supabase
                .from('receitas')
                .select('*')
                .eq('Id', req.params.codigo)
                .single();

            if (findError || !receita) {
                console.log('Receita não encontrada:', req.params.codigo);
                return handleError(res, 'Receita não encontrada', 404);
            }

            // 2. Listar e remover todas as imagens do bucket
            const { data: arquivos, error: listError } = await supabase.storage
                .from('fotosReceitas')
                .list('', {
                    search: `${receita.Id}-`
                });

            if (listError) {
                console.log('Erro ao listar arquivos:', listError);
                throw listError;
            }

            // 3. Remover imagens se existirem
            if (arquivos?.length > 0) {
                const { error: deleteStorageError } = await supabase.storage
                    .from('fotosReceitas')
                    .remove(arquivos.map(a => a.name));

                if (deleteStorageError) {
                    console.log('Erro ao deletar arquivos:', deleteStorageError);
                    throw deleteStorageError;
                }
            }

            // 4. Deletar as associações de subtemas
            const { error: deleteSubtemaError } = await supabase
                .from('correlacaoReceitas')
                .delete()
                .eq('idReceita', req.params.codigo);

            if (deleteSubtemaError) throw deleteSubtemaError;

            // 5. Deletar a receita
            const { error: deleteError } = await supabase
                .from('receitas')
                .delete()
                .eq('Id', req.params.codigo);

            if (deleteError) throw deleteError;

            return res.json({
                message: 'Receita e imagens deletadas com sucesso'
            });

        } catch (e) {
            console.log('Erro ao deletar:', e);
            return handleError(res, e.message);
        }
    }

    async verify(req, res) {
        try {
            const verificadaPor = req.body.VerificadaPor;
            const codigo = req.params.codigo;

            if (!verificadaPor) {
                return handleError(res, `O campo 'VerificadaPor' é obrigatório.`, 400, 'Input inválido');
            }

            const { data: user, userError } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, niveldeconcientizacao, ismonitor')
                .eq('email', verificadaPor)
                .maybeSingle();

            if (!user || userError) {
                return handleError(res, `O usuário com o email ${verificadaPor} não foi encontrado.`, 404, 'Usuário não encontrado');
            }

            if (!user.ismonitor) {
                return handleError(res, `O usuário com o email ${verificadaPor} não é um monitor.`, 400, 'Usuário não é monitor');
            }

            const { data: receita, error } = await supabase
                .from('receitas')
                .update({
                    verificado: true,
                    VerificadaPor: verificadaPor
                })
                .eq('codigo', codigo)
                .select();

            if (error) return handleError(res, error.message, 500, error.details);

            if (!receita) return handleError(res, `A receita com o código ${codigo} não foi encontrada.`, 404, 'Receita não encontrada');

            return res.status(200).json({ message: `A receita com o código ${codigo} foi verificada com sucesso pelo usuário com o email ${verificadaPor}.` });
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

            const { data: receitas, error } = await supabase
                .from('receitas')
                .select()
                .order('codigo', { ascending: false })
                .eq('verificado', true)
                .eq('tema', tema);

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
                return handleError(res, `O tema ${tema} não é um tema válido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}.`, 400, 'Input invlido');
            }

            const { data: receitas, error } = await supabase
                .from('receitas')
                .select()
                .order('codigo', { ascending: false })
                .eq('verificado', false)
                .eq('tema', tema);

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

            const { data: receitas, error } = await supabase
                .from('receitas')
                .select()
                .order('codigo', { ascending: false })
                .eq('tema', tema);

            if (error) return handleError(res, error.message, 500, error.details);

            return res.status(200).json(receitas);
        } catch (e) {
            return handleError(res, e.message);
        }
    }
}

async function uploadImage(file) {
    const { data, error } = await supabase.storage
        .from('fotosReceitas')
        .upload(`${Date.now()}-${file.originalname}`, file.buffer, {
            contentType: file.mimetype,
        });

    if (error) throw new Error('Error uploading image');

    const { data: publicURL } = supabase.storage
        .from('fotosReceitas')
        .getPublicUrl(data.path);

    return { path: data.path, url: publicURL.publicUrl };
}

function handleError(res, detail = 'An error has occurred.', status = 500, message = 'Internal Server Error') {
    if (!res.headersSent) {
        return res.status(status).json({ message, detail });
    }
}

export default new ReceitaController();