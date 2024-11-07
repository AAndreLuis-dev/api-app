import multer from 'multer';

const userStorage = multer.memoryStorage();
const userUpload = multer({
    storage: userStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Somente arquivos de imagem são permitidos'));
        }
    }
}).single('Foto.usu');

export default userUpload;
