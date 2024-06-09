const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const imageProcessor = require("../utils/imageProcessor");
const {
    createBook,
    modifyBook,
    deleteBook,
    bestRatingBook,
    getOneBook,
    getAllBook,
    addNewRating,
} = require("../controllers/books");

router.post("/", auth, imageProcessor, createBook); // Remplacez multer par imageProcessor pour la création de livre
router.put("/:id", auth, imageProcessor, modifyBook); // Remplacez multer par imageProcessor pour la modification de livre
router.delete("/:id", auth, deleteBook);
router.get("/bestrating", bestRatingBook);
router.get("/:id", getOneBook);
router.get("/", getAllBook);
router.post("/:id/rating", auth, addNewRating);

module.exports = router;
