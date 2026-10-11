const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const hardwareController = require('../controllers/hardwareController');
const puzzleController = require('../controllers/puzzleController');
const quizController = require('../controllers/quizController');
const pblController = require('../controllers/pblController');
const assessmentController = require('../controllers/assessmentController');

// 1. Auth & Groups Routes
router.get('/auth/groups', authController.getGroups);
router.post('/auth/groups', authController.createGroup);
router.post('/auth/student-login', authController.studentLogin);
router.post('/auth/teacher-login', authController.teacherLogin);
router.get('/auth/profile/:userId', authController.getUserProfile);

// 2. Hardware Cards Routes
router.get('/hardware', hardwareController.getAllHardwareCards);
router.get('/hardware/:slug', hardwareController.getHardwareBySlug);

// 3. Puzzle Game (NetFix Lab) Routes
router.get('/puzzles', puzzleController.getAllLevels);
router.post('/puzzles/:levelId/complete', puzzleController.completeLevel);

// 4. Tinder Swipe Quiz Routes
router.get('/quiz/swipes', quizController.getSwipeCards);
router.post('/quiz/swipes/submit', quizController.submitSwipeResult);

// 5. PBL Case Solver & Recommendation Matrix Routes
router.get('/pbl/case-brief', pblController.getCaseStudyBrief);
router.get('/pbl/matrix/:groupId', pblController.getGroupMatrix);
router.post('/pbl/matrix/:groupId', pblController.addMatrixItem);
router.delete('/pbl/matrix/item/:itemId', pblController.deleteMatrixItem);
router.get('/pbl/matrix/validate/:groupId', pblController.validateGroupMatrix);

// 6. Teacher Assessment & Grading Routes
router.post('/assessments/grade', assessmentController.gradeGroup);
router.get('/assessments/summary', assessmentController.getClassSummary);

module.exports = router;
