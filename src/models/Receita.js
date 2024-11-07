class Receita {
    constructor(receita) {
        this.id = receita.id;
        this.titulo = receita.titulo;
        this.conteudo = receita.conteudo;
        this.isVerify = receita.isVerify || false;
        this.idUsuario = receita.idUsuario;
        this.verifyBy = receita.verifyBy;
        this.dataCriacao = receita.dataCriacao || new Date().toISOString();
        this.ultimaAlteracao = receita.ultimaAlteracao || new Date().toISOString();
        this.fotos = receita.fotos || [];
    }

    validate() {
        const errors = [];

        // Validação do título
        if (!this.titulo) {
            errors.push("Título é obrigatório.");
        } else if (this.titulo.length < 3 || this.titulo.length > 100) {
            errors.push("Título deve ter entre 3 e 100 caracteres.");
        }

        // Validação do conteúdo
        if (!this.conteudo) {
            errors.push("Conteúdo é obrigatório.");
        } else if (this.conteudo.length < 3 || this.conteudo.length > 2000) {
            errors.push("Conteúdo deve ter entre 3 e 2000 caracteres.");
        }

        // Validação do ID do usuário
        if (!this.idUsuario) {
            errors.push("ID do usuário é obrigatório.");
        }

        // Validação do isVerify
        if (this.isVerify !== undefined && typeof this.isVerify !== 'boolean') {
            errors.push("IsVerify deve ser um valor booleano.");
        }

        // Validação do verifyBy
        if (this.isVerify && !this.verifyBy) {
            errors.push("VerifyBy é obrigatório quando a receita está verificada.");
        }

        // Validação das datas
        try {
            if (this.dataCriacao) new Date(this.dataCriacao);
            if (this.ultimaAlteracao) new Date(this.ultimaAlteracao);
        } catch (e) {
            errors.push("Formato de data inválido.");
        }

        // Validação das fotos
        if (this.fotos) {
            if (!Array.isArray(this.fotos)) {
                errors.push("Fotos devem ser fornecidas em um array.");
            } else if (this.fotos.length > 8) {
                errors.push("Máximo de 8 fotos permitidas.");
            }

            // Validar URLs das fotos
            this.fotos.forEach((foto, index) => {
                if (typeof foto !== 'string') {
                    errors.push(`Foto ${index + 1}: URL inválida.`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Método para atualizar a data de última alteração
    updateLastModified() {
        this.ultimaAlteracao = new Date().toISOString();
    }

    // Método para verificar a receita
    verify(verifyBy) {
        if (!verifyBy) {
            throw new Error("VerifyBy é obrigatório para verificar a receita.");
        }
        this.isVerify = true;
        this.verifyBy = verifyBy;
        this.updateLastModified();
    }

    // Método para adicionar foto
    addFoto(fotoUrl) {
        if (!this.fotos) this.fotos = [];
        if (this.fotos.length >= 8) {
            throw new Error("Máximo de 8 fotos atingido.");
        }
        this.fotos.push(fotoUrl);
        this.updateLastModified();
    }

    // Método para remover foto
    removeFoto(fotoUrl) {
        if (!this.fotos) return;
        this.fotos = this.fotos.filter(f => f !== fotoUrl);
        this.updateLastModified();
    }
}

export default Receita;
