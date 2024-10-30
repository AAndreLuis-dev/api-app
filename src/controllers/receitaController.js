import Receita from '../models/Receita.js';
import { supabase } from '../supabase/client.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';
import multer from 'multer';

class ReceitaController {

    async create(req, res) {
        let imageUrls = [];

        try {
            console.log('1. Iniciando criação da receita');

            // 1. Criar a receita primeiro
            const { data: receitaData, error: receitaError } = await supabase
                .from('receitas')
                .insert([{
                    titulo: req.body.titulo,
                    conteudo: req.body.conteudo,
                    verificado: false,
                    autor: req.body.autor,
                    "VerificadaPor": null,
                    subTema: req.body.subTema,
                    tema: req.body.tema
                }])
                .select()
                .single();

            if (receitaError) {
                console.log('Erro ao criar receita:', receitaError);
                throw receitaError;
            }

            console.log('2. Receita criada:', receitaData);

            // 2. Upload das imagens
            if (req.files?.length > 0) {
                console.log('3. Iniciando upload de imagens');
                for (const file of req.files) {
                    const fileName = `${receitaData.codigo}-${Date.now()}-${file.originalname}`;
                    console.log('Tentando upload:', fileName);

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('fotosReceitas')
                        .upload(fileName, file.buffer, {
                            contentType: file.mimetype,
                            upsert: false
                        });

                    if (uploadError) {
                        console.log('Erro no upload:', uploadError);
                        throw uploadError;
                    }

                    console.log('4. Upload bem-sucedido:', uploadData);

                    // Obter URL pública
                    const { data: { publicUrl } } = supabase.storage
                        .from('fotosReceitas')
                        .getPublicUrl(fileName);

                    console.log('5. URL gerada:', publicUrl);
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
            // Limpar imagens em caso de erro
            if (imageUrls.length > 0) {
                for (const url of imageUrls) {
                    const fileName = url.split('/').pop();
                    await supabase.storage.from('fotosReceitas').remove([fileName]);
                }
            }
            return handleError(res, e.message || 'Erro ao criar receita');
        }
    }

    async getAll(req, res) {
        try {
            // Buscar todas as receitas
            const { data: receitas, error } = await supabase
                .from('receitas')
                .select('*');

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
            // Buscar receita
            const { data: receita, error } = await supabase
                .from('receitas')
                .select('*')
                .eq('codigo', req.params.codigo)
                .single();

            if (error) throw error;
            if (!receita) return handleError(res, 'Receita não encontrada', 404);

            // Buscar todas as imagens da receita
            const { data: arquivos } = await supabase.storage
                .from('fotosReceitas')
                .list('', {
                    search: `${receita.codigo}-`
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
            return handleError(res, e.message);
        }
    }

    async update(req, res) {
        try {
            // 1. Verificar se a receita existe
            const { data: receita, error } = await supabase
                .from('receitas')
                .select('*')
                .eq('codigo', req.params.codigo)
                .single();

            if (error || !receita) {
                return handleError(res, 'Receita não encontrada', 404);
            }

            // 2. Se houver novas imagens, remover as antigas
            if (req.files?.length > 0) {
                // Listar imagens antigas
                const { data: arquivosAntigos } = await supabase.storage
                    .from('fotosReceitas')
                    .list('', {
                        search: `${receita.codigo}-`
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
                    const fileName = `${receita.codigo}-${Date.now()}-${file.originalname}`;
                    
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
            }

            // 3. Atualizar dados da receita
            const { data: updatedReceita, error: updateError } = await supabase
                .from('receitas')
                .update({
                    titulo: req.body.titulo,
                    conteudo: req.body.conteudo,
                    autor: req.body.autor,
                    subTema: req.body.subTema,
                    tema: req.body.tema
                })
                .eq('codigo', req.params.codigo)
                .select();

            if (updateError) throw updateError;

            return res.json({
                message: 'Receita atualizada com sucesso',
                data: updatedReceita[0]
            });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async delete(req, res) {
        try {
            // 1. Verificar se a receita existe
            const { data: receita, error: findError } = await supabase
                .from('receitas')
                .select('*')
                .eq('codigo', req.params.codigo)
                .single();

            if (findError || !receita) {
                return handleError(res, 'Receita não encontrada', 404);
            }

            // 2. Listar e remover todas as imagens do bucket
            const { data: arquivos, error: listError } = await supabase.storage
                .from('fotosReceitas')
                .list('', {
                    search: `${receita.codigo}-`
                });

            if (listError) {
                console.log('Erro ao listar arquivos:', listError);
                throw listError;
            }

            if (arquivos?.length > 0) {
                const { error: deleteStorageError } = await supabase.storage
                    .from('fotosReceitas')
                    .remove(arquivos.map(a => a.name));

                if (deleteStorageError) {
                    console.log('Erro ao deletar arquivos:', deleteStorageError);
                    throw deleteStorageError;
                }
            }

            // 3. Deletar a receita
            const { error: deleteError } = await supabase
                .from('receitas')
                .delete()
                .eq('codigo', req.params.codigo);

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