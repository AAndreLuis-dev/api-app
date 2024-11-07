class Subtema {
  constructor(subtemas) {
    this.subtemas = subtemas;
  }

  async validate() {
    const resultado = {
      subtemasNaoExistentes: [],
      subtemasExistentes: [],
      erros: []
    };

    for (let subtema of this.subtemas) {
      if (this.isValidText(subtema)) {
        const subtemaFormatado = subtema.toLowerCase();
        try {
          const subtemaExiste = await this.verifyBd(subtemaFormatado);

          if (subtemaExiste) {
            resultado.subtemasExistentes.push(subtema);
          } else {
            resultado.subtemasNaoExistentes.push(subtema);
          }
        } catch (e) {
          resultado.erros.push({ subtema, mensagem: e.message });
        }
      } else {
        resultado.erros.push({ subtema, mensagem: 'Subtema escrito de forma incorreta.' });
      }
    }

    return resultado;
  }

  async verifyBd(subtema) {
    try {
      const { data: subtemaBd, error } = await supabase
        .from("subTemas")
        .select("subTemas")
        .eq("subTemas", subtema)
        .single();

      if (error && error.details !== 'No rows found') {
        throw new Error(error.message);
      }

      return !!subtemaBd;
    } catch (e) {
      console.error(e.message);
      throw new Error('Erro ao verificar o subtema no banco de dados.');
    }
  }

  isValidText(text) {
    const regex = /^[a-zA-Z\s]+$/; 
    return regex.test(text);
  }
}