import { supabase } from '../supabase/client'; // Importa o cliente Supabase configurado
import argon2 from 'argon2';

class User {
    constructor({ email, password, nome, telefone, nivelDeConcientizacao, isMonitor }) {
        this.email = email;
        this.password = password;
        this.nome = nome;
        this.telefone = telefone;
        this.nivelDeConcientizacao = nivelDeConcientizacao;
        this.isMonitor = isMonitor;
    }


    validate() {
        const errors = [];

        if (this.nome.length < 3 || this.nome.length > 255) {
            errors.push('Nome deve ter entre 3 e 255 caracteres.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            errors.push('Email inválido.');
        }

        const telefoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!telefoneRegex.test(this.telefone)) {
            errors.push('Número de telefone inválido.');
        }

        if (this.password.length < 6 || this.password.length > 50) {
            errors.push('A senha precisa ter entre 6 e 50 caracteres.');
        }

        if (typeof this.nivelDeConcientizacao !== 'number' || this.nivelDeConcientizacao < 0 || this.nivelDeConcientizacao > 5) {
            errors.push('Nível de conscientização deve ser um número entre 0 e 5.');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true };
    }

    async save() {
        const password_hash = await argon2.hash(this.password);

        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    email: this.email,
                    password_hash: password_hash,
                    nome: this.nome,
                    telefone: this.telefone,
                    nivelDeConcientizacao: this.nivelDeConcientizacao,
                    isMonitor: this.isMonitor
                },
            ]);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async passwordIsValid(password) {
        const { data: user, error } = await supabase
            .from('users')
            .select('password_hash')
            .eq('email', this.email)
            .single();

        if (error || !user) {
            throw new Error('Usuário não encontrado ou erro ao buscar.');
        }

        return argon2.verify(user.password_hash, password);
    }
}

export default User;
