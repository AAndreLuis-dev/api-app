import { supabase } from '../supabase/client.js'; // Importa o cliente Supabase configurado
import argon2 from 'argon2';

class User {
    constructor({ email, tokens, senha, nome, telefone, nivelConsciencia, isMonitor, fotoUsu }) {
        this.email = email;
        this.tokens = tokens;
        this.senha = senha;
        this.nome = nome;
        this.telefone = telefone;
        this.nivelConsciencia = nivelConsciencia;
        this.isMonitor = isMonitor;
        this.fotoUsu = fotoUsu;
    }

    validate() {
        const errors = [];

        if (!this.nome || this.nome.length < 3 || this.nome.length > 51) {
            errors.push('Nome deve ter entre 3 e 51 caracteres.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this.email || !emailRegex.test(this.email)) {
            errors.push('Email inválido.');
        }

        if (typeof this.tokens !== 'string') {
            errors.push('Token inválido.');
        }

        const telefoneRegex = /^\+?[1-9]\d{1,14}$/; // Validação de telefone
        if (!this.telefone || !telefoneRegex.test(this.telefone)) {
            errors.push('Número de telefone inválido.');
        }

        if (!this.senha || this.senha.length < 6 || this.senha.length > 255) {
            errors.push('A senha precisa ter entre 6 e 255 caracteres.');
        }

        if (this.ni_conciencia < 0 || this.ni_conciencia > 5) { // Validação do nível de conscientização
            errors.push('Nível de conscientização deve ser um número entre 0 e 5.');
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }
        this.ni_conciencia = parseInt(this.ni_conciencia);
        return { valid: true };
    }

    async save() {
        const password_hash = await argon2.hash(this.senha);

        const { data, error } = await supabase
            .from('usuarios')
            .insert([
                {
                    email: this.email,
                    tokens: this.tokens,
                    senha: password_hash,
                    nome: this.nome,
                    telefone: this.telefone,
                    ni_conciencia: this.ni_conciencia,
                    is_monitor: this.is_monitor,
                    foto_usuario: this.foto_usuario,
                },
            ])
            .select();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async passwordIsValid(password) {
        const { data: user, error } = await supabase
            .from('usuarios') // Mudança para 'usuarios'
            .select('senha')
            .eq('email', this.email)
            .single();

        if (error || !user) {
            throw new Error('Usuário não encontrado ou erro ao buscar.');
        }

        return argon2.verify(user.senha, password); // Mudança para 'senha'
    }
}

export default User;
