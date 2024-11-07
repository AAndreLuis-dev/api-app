import Receita from '../models/Receita.js';
import { supabase } from '../supabase/client.js';
import Subtema from '../models/Subtemas.js';
import { TEMAS_VALIDOS } from '../utils/temas_validos.js';
import multer from 'multer';

class ReceitaController {
    async create(req, res) {
        let imageUrls = [];
        try {
            if (!req.body.titulo || !req.body.conteudo || !req.body.idUsuario || !req.body.tema) {
                throw new Error('Campos obrigatórios: titulo, conteudo, idUsuario e tema');
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

            // Validação e inserção dos subtemas
            const subtemas = new Subtema(req.body.subtema);
            const resultSubtemas = await subtemas.validate();

            const correlacaoReceitasData = resultSubtemas.subtemasExistentes.map(subtema => ({
                idReceita: receitaData.id,
                subtema: subtema,
                tema: req.body.tema
            }));

            if (correlacaoReceitasData.length > 0) {
                const { error: correlacaoError } = await supabase
                    .from('correlacaoReceitas')
                    .insert(correlacaoReceitasData);

                if (correlacaoError) throw correlacaoError;
            }

            // Upload das imagens
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
                data: {
                    ...receitaData,
                    subtemas: correlacaoReceitasData.map(item => item.subtema),
                    imagens: imageUrls
                }
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

    // Resto dos métodos...

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
