const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");

const imageProcessor = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res
                .status(400)
                .json({ message: "Erreur lors du téléchargement de l'image." });
        } else if (err) {
            return res.status(500).json({
                message:
                    "Une erreur s'est produite lors du traitement de l'image.",
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Aucune image trouvée." });
        }

        const filePath = req.file.buffer;
        const outputFilePath = `images/resized_${req.file.originalname}`;

        sharp(filePath)
            .resize({ width: 206, height: 260 })
            .webp({ quality: 20 })
            .toFile(outputFilePath, (err, info) => {
                if (err) {
                    return res.status(500).json({
                        message: "Erreur lors du traitement de l'image.",
                    });
                }

                req.file.path = outputFilePath;
                next();
            });
    });
};

module.exports = imageProcessor;
