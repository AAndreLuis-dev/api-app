import Receita from '../models/Receita.js';
import { supabase } from '../supabase/client.js';
import multer from 'multer';

class ReceitaController {
    async create(req, res) {
        let imageUrls = [];

        try {
            if (!req.body.titulo || !req.body.conteudo || !req.body.idUsuario) {
                throw new Error('Campos obrigatórios: titulo, conteudo e idUsuario');
            }

            // Primeiro, vamos verificar se o email existe na tabela de usuários
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

            if (req.files?.length > 0) {
                for (const file of req.files) {
                    const fileName = `${receitaData.id}-${Date.now()}-${file.originalname}`;
                    
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
                data: { ...receitaData, fotos: imageUrls }
            });

        } catch (e) {
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
            const { data: receitas, error: receitasError } = await supabase
                .from('receitas')
                .select('*')
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
                .select('*')
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
            if (!req.body.verifyBy) {
                return handleError(res, 'Campo verifyBy é obrigatório', 400);
            }

            const { data: receita, error } = await supabase
                .from('receitas')
                .update({
                    isVerify: true,
                    verifyBy: req.body.verifyBy,
                    ultimaAlteracao: new Date().toISOString()
                })
                .eq('id', req.params.id)
                .select()
                .single();

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
}

function handleError(res, detail = 'Ocorreu um erro.', status = 500) {
    if (!res.headersSent) {
        return res.status(status).json({
            message: 'Erro',
            detail
        });
    }
}

export default new ReceitaController();