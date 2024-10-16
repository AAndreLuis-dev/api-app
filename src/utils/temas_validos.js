export const TEMAS_VALIDOS = [
    'Gastro',
    'Moda',
    'Enge',
    'Veteri',
    'Cosme'
]

export function isThemeValid(theme) {
    return TEMAS_VALIDOS.includes(theme);
}