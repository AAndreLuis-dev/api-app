import User from '../models/User.js';
import { supabase } from '../supabase/client.js';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

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
    
            // Prepare the data to be updated
            const updatedData = { ...req.body, fotoUsu: fotoUsuarioURL };
    
            // Verificação e hash da senha
            if (req.body.senha) {  // Use 'senha' em minúsculas
                console.log("Hashing a senha...");
                updatedData.senha = await argon2.hash(req.body.senha.trim());  // 'senha' em minúsculas
            }
    
            const { error: updateError } = await supabase
                .from('usuarios')
                .update(updatedData)
                .eq('email', req.params.email);
    
            if (updateError) throw updateError;
    
            return res.json({ message: 'Usuário atualizado com sucesso' });
    
        } catch (e) {
            console.error("Erro ao atualizar usuário:", e.message);
    
            if (uploadedImagePath) {
                await supabase.storage.from('fotoPerfil').remove([uploadedImagePath]);
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
    async loginUser(req, res) {
        const { email, senha } = req.body;
    
        try {
            console.log("Iniciando login para o email:", email);
    
            const { data: user, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .single();
    
            if (error || !user) {
                console.error("Erro ao buscar usuário ou usuário não encontrado:", error);
                return res.status(400).json({ error: 'Usuário não encontrado ou erro na busca' });
            }
    
            console.log("Usuário encontrado:", user);
            if (!user.senha || !user.senha.startsWith('$')) {
                console.error("Senha inválida ou não é um hash no banco de dados.");
                return res.status(500).json({ error: 'Erro no registro do usuário' });
            }
    
            const validPassword = await argon2.verify(user.senha, senha);
    
            if (!validPassword) {
                console.error("Senha inválida para o usuário:", email);
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
    
            console.log("Senha verificada com sucesso. Gerando token...");
    
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET
            );
    
            console.log("Token gerado com sucesso:", token);
    
            return res.status(200).json({ message: 'Login bem-sucedido', token });
        } catch (e) {
            console.error("Erro no processo de login:", e.message);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
async resetPasswordRequest(req, res) {
    const { email } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const token = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Redefinição de Senha',
            text: `Seu token de redefinição de senha é: ${token}`,
            html: `<p>Seu token de redefinição de senha é:</p><p><strong>${token}</strong></p>`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Token de redefinição de senha enviado com sucesso' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const hashedPassword = await argon2.hash(newPassword);

        const { error } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword })
            .eq('email', email);

        if (error) {
            return res.status(400).json({ error: 'Erro ao atualizar a senha' });
        }

        return res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Token expirado' });
        } else if (e.name === 'JsonWebTokenError') {
            return res.status(400).json({ error: 'Token inválido' });
        }
        
        console.error(e);
        return res.status(500).json({ error: 'Erro interno do servidor' });
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
