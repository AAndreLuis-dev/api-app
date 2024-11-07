import User from '../models/User.js';
import { supabase } from '../supabase/client.js';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

class UserController {
    async store(req, res) {
        let uploadedImagePath = null;
        try {
            const user = new User({
                email: req.body.email,
                tokens: req.body.tokens,
                senha: req.body.senha,
                nome: req.body.nome,
                telefone: req.body.telefone,
                nivelConsciencia: req.body.nivelConsciencia,
                isMonitor: req.body.isMonitor,
                fotoUsu: null
            });

            const { valid, errors } = user.validate();

            if (!valid) return res.status(400).json({ errors });

            let fotoUsuarioURL = null;

            // Se a imagem foi carregada
            if (req.file) {
                const uploadResult = await uploadImage(req.file);
                fotoUsuarioURL = uploadResult.url;
                uploadedImagePath = uploadResult.path;
            }

            // O hash da senha é gerado aqui
            const hashedPassword = await argon2.hash(user.senha);

            const { data, error } = await supabase
                .from('usuarios')
                .insert([{
                    email: user.email,
                    senha: hashedPassword,
                    nome: user.nome,
                    telefone: user.telefone,
                    nivelConsciencia: user.nivelConsciencia,
                    isMonitor: user.isMonitor,
                    tokens: user.tokens,
                    fotoUsu: fotoUsuarioURL
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

    //funcionando pos alteracao bd
    async index(req, res) {
        try {
            const { data: users, error } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, nivelConsciencia, isMonitor, fotoUsu');

            if (error) throw error;

            return res.json(users);

        } catch (e) {
            return res.status(400).json({ errors: [e.message] });
        }
    }
    //funcionando pos alteracao bd
    async show(req, res) {
        try {
            const { data: user, error } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, nivelConsciencia, isMonitor, fotoUsu')
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
    //Funcionando pos alteracao
    async update(req, res) {
        let uploadedImagePath = null;
        try {
            const { data: user, error: fetchError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', req.params.email)
                .single();

            if (fetchError || !user) {
                return res.status(400).json({ errors: ['Usuário não encontrado'] });
            }

            let fotoUsuarioURL = user["Foto.usu"];

            if (req.file) {
                const uploadResult = await uploadImage(req.file);
                fotoUsuarioURL = uploadResult.url;
                uploadedImagePath = uploadResult.path;
            }

            const updatedData = {
                ...req.body,
                fotoUsu: fotoUsuarioURL
            };

            if (req.body.Senha) {
                updatedData.Senha = await argon2.hash(req.body.Senha);
            }

            const { error: updateError } = await supabase
                .from('usuarios')
                .update(updatedData)
                .eq('email', req.params.email);

            if (updateError) throw updateError;

            return res.json({ message: 'Usuário atualizado com sucesso' });

        } catch (e) {
            if (uploadedImagePath) {
                await supabase.storage
                    .from('fotoPerfil')
                    .remove([uploadedImagePath]);
            }
            return res.status(400).json({ errors: [e.message] });
        }
    }
    // Funcionando pos alteracao
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

        const { data: publicURL } = supabase.storage
            .from('fotoPerfil')
            .getPublicUrl(data.path);

        return { url: publicURL.publicUrl, path: data.path };

    } catch (e) {
        throw new Error(`Erro ao fazer upload da imagem: ${e.message}`);
    }
}

export default new UserController();
