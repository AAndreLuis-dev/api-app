import User from '../models/User.js';
import { supabase } from '../supabase/client.js';
import { v4 as uuidv4 } from 'uuid';

class UserController {
    async store(req, res) {
        let uploadedImagePath = null;
        try {
            const user = new User(req.body);
            const { valid, errors } = user.validate();

            if (!valid) return res.status(400).json({ errors });

            let fotoUsuarioURL = null;

            if (req.file) {
                const uploadResult = await uploadImage(req.file);
                console.log(uploadResult.url);
                fotoUsuarioURL = uploadResult.url;
                uploadedImagePath = uploadResult.path;
            }

            const { data, error } = await supabase
                .from('usuarios')
                .insert([{
                    email: user.email,
                    senha: user.senha,
                    tokens: user.tokens,
                    nome: user.nome,
                    telefone: user.telefone,
                    niveldeconcientizacao: user.niveldeconcientizacao,
                    ismonitor: user.ismonitor,
                    fotoUsuario: fotoUsuarioURL,
                    endereco: user.endereco
                }]);

            if (error) {
                if (uploadedImagePath) {
                    await supabase.storage
                        .from('fotoPerfil')
                        .remove([uploadedImagePath]);
                }
                return res.status(500).json({ errors: [error.message] });
            }

            return res.status(201).json({ message: 'Usuário criado com sucesso' });

        } catch (e) {
            if (uploadedImagePath) {
                await supabase.storage
                    .from('fotoPerfil')
                    .remove([uploadedImagePath]);
            }
            return res.status(400).json({ errors: [e.message] });
        }
    }

    async index(req, res) {
        try {
            const { data: users, error } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, niveldeconcientizacao, ismonitor, fotoUsuario, endereco');

            if (error) throw error;

            return res.json(users);

        } catch (e) {
            return res.status(400).json({ errors: [e.message] });
        }
    }

    async show(req, res) {
        try {
            const { data: user, error } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, niveldeconcientizacao, ismonitor, fotoUsuario, endereco')
                .eq('email', req.params.email)
                .single();

            if (error || !user) {
                return res.status(404).json({ errors: ['Usuário não encontrado'] });
            }

            return res.json(user);

        } catch (e) {
            return res.status(400).json({ errors: [e.message] });
        }
    }

    async update(req, res) {
        try {
            const { data: user, error: fetchError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', req.params.email)
                .single();

            if (fetchError || !user) {
                return res.status(400).json({ errors: ['Usuário não encontrado'] });
            }

            const { error: updateError } = await supabase
                .from('usuarios')
                .update(req.body)
                .eq('email', req.params.email);

            if (updateError) throw updateError;

            return res.json({ message: 'Usuário atualizado com sucesso' });

        } catch (e) {
            return res.status(400).json({ errors: [e.message] });
        }
    }

    async delete(req, res) {
        try {
            const { data: user, error: fetchError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', req.params.email)
                .single();

            if (fetchError || !user) {
                return res.status(400).json({ errors: ['Usuário não encontrado'] });
            }

            const { error: deleteError } = await supabase
                .from('usuarios')
                .delete()
                .eq('email', req.params.email);

            if (deleteError) throw deleteError;

            return res.json({ message: 'Usuário deletado com sucesso' });

        } catch (e) {
            return res.status(400).json({ errors: [e.message] });
        }
    }
}

async function uploadImage(file) {
    try {
        const uniqueFileName = `${uuidv4()}-${file.originalname}`;
        const { data, error } = await supabase.storage
            .from('fotoPerfil')
            .upload(uniqueFileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);

        const { publicURL } = supabase.storage.from('fotoPerfil').getPublicUrl(uniqueFileName);

        return { url: publicURL, path: uniqueFileName };

    } catch (e) {
        console.error("Erro detalhado ao tentar fazer upload da imagem:", e);
        throw new Error(`Erro ao fazer upload da imagem: ${e.message}`);
    }
}

export default new UserController();
