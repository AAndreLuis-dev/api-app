import User from '../models/User.js';
import { supabase } from '../supabase/client.js';

class UserController {
    async store(req, res) {
        try {
            const user = new User(req.body);

            const { valid, errors } = user.validate();
            if (!valid) {
                return res.status(400).json({ errors });
            }

            const savedUser = await user.save();

            console.log('Usuário salvo:', savedUser);

            if (!savedUser || (Array.isArray(savedUser) && savedUser.length === 0) || !savedUser[0]) {
                return res.status(400).json({
                    errors: ['Falha ao salvar o usuário no banco de dados.'],
                });
            }

            const { email, nome, telefone, nivelDeConcientizacao, isMonitor } = Array.isArray(savedUser) ? savedUser[0] : savedUser;
            return res.json({ email, nome, telefone, nivelDeConcientizacao, isMonitor });

        } catch (e) {
            return res.status(400).json({
                errors: [e.message],
            });
        }
    }

    async index(req, res) {
        try {
            const { data: users, error } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, niveldeconcientizacao, ismonitor');

            if (error) throw error;

            return res.json(users);

        } catch (e) {
            return res.status(400).json({
                errors: [e.message],
            });
        }
    }

    async show(req, res) {
        try {
            const { data: user, error } = await supabase
                .from('usuarios')
                .select('email, nome, telefone, niveldeconcientizacao, ismonitor')
                .eq('email', req.params.email)
                .single();

            if (error || !user) {
                return res.status(404).json({
                    errors: ['Usuário não encontrado'],
                });
            }

            return res.json(user);

        } catch (e) {
            return res.status(400).json({
                errors: [e.message],
            });
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
                return res.status(400).json({
                    errors: ['Usuário não encontrado'],
                });
            }

            const { error: updateError } = await supabase
                .from('usuarios')
                .update(req.body)
                .eq('email', req.params.email);

            if (updateError) throw updateError;

            return res.json({ message: 'Usuário atualizado com sucesso' });

        } catch (e) {
            return res.status(400).json({
                errors: [e.message],
            });
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
                return res.status(400).json({
                    errors: ['Usuário não encontrado'],
                });
            }

            const { error: deleteError } = await supabase
                .from('usuarios')
                .delete()
                .eq('email', req.params.email);

            if (deleteError) throw deleteError;

            return res.json({ message: 'Usuário deletado com sucesso' });

        } catch (e) {
            return res.status(400).json({
                errors: [e.message],
            });
        }
    }
}

export default new UserController();
