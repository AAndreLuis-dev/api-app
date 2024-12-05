import { supabase } from '../supabase/client.js';

class Subtema {
  constructor(subtemas) {
    this.subtemas = Array.isArray(subtemas) ? subtemas : [];
  }

  async validate() {
    const resultado = {
      subtemasNaoExistentes: [],
      subtemasExistentes: [],
      erros: []
    };

    if (!Array.isArray(this.subtemas) || this.subtemas.length === 0) {
      throw new Error("Nenhum subtema enviado.");
    }
    
    for (let subtema of this.subtemas) {
      const subtemaFormatado = subtema.trim(); 

      try {
        const subtemaExiste = await this.verifyBd(subtemaFormatado);

        if (subtemaExiste) {
          resultado.subtemasExistentes.push(subtemaFormatado);
        } else {
          await this.createSubtema(subtemaFormatado);
          resultado.subtemasExistentes.push(subtemaFormatado); 
        }
      } catch (e) {
        resultado.erros.push({ subtema: subtemaFormatado, mensagem: e.message });
      }
    }

    return resultado;
  }

  async verifyBd(subtema) {
    try {
      const { data: subtemaBd, error } = await supabase
        .from('subTema')
        .select('descricao')
        .eq('descricao', subtema);

      if (error) {
        throw new Error(error.message);
      }

      return subtemaBd && subtemaBd.length > 0;
    } catch (e) {
      throw new Error('Erro ao verificar o subtema no banco de dados.');
    }
  }

  async createSubtema(subtema) {
    try {
      const { data, error } = await supabase
        .from('subTema')
        .insert([{ descricao: subtema }]);

    } catch (e) {
      throw new Error(`Erro ao criar subtema "${subtema}"`);
    }
  }
}

export default Subtema;