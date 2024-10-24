import Receita from '../models/Receita.js';
import { supabase } from '../supabase/client.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';

class ReceitaController {

    async create(req, res) {
        let uploadedImagePath = null;
        try {
            const receita = new Receita(req.body);
            const { valid, errors } = receita.validate();

            if (!valid) return handleError(res, errors, 400, 'Receita Inválida');

            let imgURL = null;

            if (req.file) {
                const uploadResult = await uploadImage(req.file);
                imgURL = uploadResult.url;
                uploadedImagePath = uploadResult.path;
            }

            const { data, error } = await supabase
                .from('receitas')
                .insert([{
                    titulo: receita.titulo,
                    imgurl: imgURL || receita.imgURL,
                    conteudo: receita.conteudo,
                    categoria: receita.categoria,
                    verificado: receita.verificado || false,
                    autor: receita.autor,
                    tema: receita.tema,
                    VerificadaPor: receita.verificadoPor
                }]).select();

            if (error) {
                if (uploadedImagePath) {
                    await supabase.storage
                        .from('Teste')  // Supabase Bucket / Storage name
                        .remove([uploadedImagePath]);
                }
                return handleError(res, error.message, 500, error.details);
            }

            return res.status(201).json({ message: 'Receita criada com sucesso', data: data[0] });
        } catch (e) {
            if (uploadedImagePath) {
                await supabase.storage
                    .from('Teste')  // Supabase Bucket / Storage name
                    .remove([uploadedImagePath]);
            }
            return handleError(res, e.message);
        }
    }

    async getAll(_req, res) {
        try {
            const { data: receitas, error } = await supabase
                .from('receitas')
                .select()
                .order('codigo', { ascending: false });

            if (error) return handleError(res, error.message, 500, error.details);

            return res.status(200).json(receitas);
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async getByCode(req, res) {
        try {
            const { data: receita, error } = await supabase
                .from('receitas')
                .select(`
                    *,
                    ingredientes (
                        ingrediente_id,
                        nomeingrediente,
                        quantidade,
                        medida
                    )
                    `
                )
                .eq('codigo', req.params.codigo)
                .single();

            if (error || !receita) return handleError(res, `A receita com o código ${req.params.codigo} não foi encontrada.`, 404, 'Receita não encontrada');
            return res.json({ data: receita });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async update(req, res) {
        try {
            const newReceita = new Receita(req.body);
            const { valid, errors } = newReceita.validate();

            if (!valid) {
                return handleError(res, errors, 400, 'Essa receita não é válida');
            }

            let imgURL = null;

            if (req.file) {
                const { data, error } = await supabase.storage
                    .from('Teste')
                    .upload(`${Date.now()}-${req.file.originalname}`, req.file.buffer, {
                        contentType: req.file.mimetype,
                    });

                if (error) return handleError(res, error.message, 500, 'Error uploading image');

                const { data: publicURL } = supabase.storage
                    .from('Teste')
                    .getPublicUrl(data.path);

                imgURL = publicURL.publicUrl;
            }

            const { data: updatedReceita, error: updateError } = await supabase
                .from('receitas')
                .update({
                    titulo: newReceita.titulo,
                    imgurl: imgURL || newReceita.imgURL,
                    conteudo: newReceita.conteudo,
                    categoria: newReceita.categoria,
                    verificado: newReceita.verificado,
                    autor: newReceita.autor,
                    tema: newReceita.tema,
                    VerificadaPor: newReceita.verificadoPor
                })
                .eq('codigo', req.params.codigo)
                .select();

            if (updateError) return handleError(res, updateError.message, 500, updateError.details);

            if (!updatedReceita) {
                return handleError(res, `A receita com o código ${req.params.codigo} não foi encontrada.`, 404, 'Receita não encontrada');
            }

            return res.status(200).json({ message: 'Receita atualizada com sucesso', data: updatedReceita[0] });
        } catch (e) {
            return handleError(res, e.message);
        }
    }

    async delete(req, res) {
        try {
            const { data, error: deleteError } = await supabase
                .from('receitas')
                .delete()
                .eq('codigo', req.params.codigo)
                .select();

            if (deleteError) return handleError(res, deleteError.message, 500, deleteError.details);

            if (!data) {
                return handleError(res, `A receita com o código ${req.params.codigo} não foi encontrada.`, 404, 'Receita não encontrada');
            }

            return res.status(204).end();
        } catch (e) {
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
                return handleError(res, `O tema ${tema} não é um tema válido. Temas válidos: ${TEMAS_VALIDOS.join(', ')}.`, 400, 'Input inválido');
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
        .from('Teste')  // Supabase Bucket / Storage name
        .upload(`${Date.now()}-${file.originalname}`, file.buffer, {
            contentType: file.mimetype,
        });

    if (error) throw new Error('Error uploading image');

    const { data: publicURL } = supabase.storage
        .from('Teste') // Supabase Bucket / Storage name
        .getPublicUrl(data.path);

    return { path: data.path, url: publicURL.publicUrl };
}

function handleError(res, detail = 'An error has occurred.', status = 500, message = 'Internal Server Error') {
    if (!res.headersSent) {
        return res.status(status).json({ message, detail });
    }
}

export default new ReceitaController();