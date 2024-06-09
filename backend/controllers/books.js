const Book = require("../models/Book");

const createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${
            req.file.originalname
        }`, // Modifie l'URL de l'image
    });

    book.save()
        .then(() => {
            return res.status(201).json({ message: "Objet enregistré !" });
        })
        .catch((error) => {
            return res.status(400).json({ error });
        });
};

const modifyBook = async (req, res, next) => {
    const modifyObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${
                  req.file.originalname
              }`, // Modifie l'URL de l'image sharp
          }
        : { ...req.body };

    delete modifyObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                return res.status(403).json({ message: "Non-autorisé" });
            } else {
                Book.updateOne(
                    { _id: req.params.id },
                    { ...modifyObject, _id: req.params.id }
                )
                    .then(() =>
                        res.status(200).json({ message: "Objet modifié" })
                    )
                    .catch((error) =>
                        res.status(500).json({ message: "server error update" })
                    );
            }
        })
        .catch((error) => {
            return res.status(400).json({ error });
        });
};

const deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Objet supprimé !" }))
        .catch((error) => res.status(400).json({ error }));
};

const bestRatingBook = (req, res, next) => {
    Book.find()
        .then((books) => {
            const sortedBooks = books
                .sort((a, b) => {
                    if (a.averageRating < b.averageRating) return 1;
                    if (a.averageRating > b.averageRating) return -1;
                    return 0;
                })
                .slice(0, 3);
            return sortedBooks;
        })
        .then((filteredBooks) => res.status(200).json(filteredBooks))
        .catch((error) => res.status(400).json({ error }));
};

const getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }));
};

const getAllBook = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
};

const addNewRating = (req, res, next) => {
    const userId = req.auth.userId; // Assuré par le middleware d'authentification
    const { rating } = req.body;
    const bookId = req.params.id;

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return res
            .status(400)
            .json({ message: "La note doit être comprise entre 0 et 5" });
    }

    Book.findOne({ _id: bookId })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: "Livre non trouvé" });
            }

            const existingRating = book.ratings.find(
                (r) => r.userId === userId
            );
            if (existingRating) {
                return res
                    .status(400)
                    .json({ message: "Vous avez déjà noté ce livre" });
            }

            book.ratings.push({ userId, grade: parsedRating });

            const totalRatings = book.ratings.length;
            const sumRatings = book.ratings.reduce(
                (sum, r) => sum + r.grade,
                0
            );
            book.averageRating = Number(sumRatings / totalRatings).toFixed(1);

            book.save()
                .then((updatedBook) => res.status(200).json(updatedBook))
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};

module.exports = {
    createBook,
    modifyBook,
    deleteBook,
    bestRatingBook,
    getOneBook,
    getAllBook,
    addNewRating,
};