import Dica from '../models/Dica.js';

describe('Dica Model', () => {
    it('should construct a tip with the same data as passed', () => {
        const dica = new Dica({
            nomeCriador: 'nomeCriador',
            conteudo: 'conteudo',
            tema: 1,
            categoria: 'categoria'
        });
        expect(dica).not.toBeNull();
        expect(dica).toBeDefined();
        expect(dica).toBeInstanceOf(Dica);
        expect(dica.nomeCriador).toBe('nomeCriador');
        expect(dica.conteudo).toBe('conteudo');
        expect(dica.tema).toBe(1);
        expect(dica.categoria).toBe('categoria');
    })
})

describe('Dica Controller', () => {
    // TODO
})